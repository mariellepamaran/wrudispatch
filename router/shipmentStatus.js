const express = require('express');
const moment = require('moment-timezone');
const request = require('request');
const router = express.Router();

const db = require("../utils/db");


/************** Variable Initialization **************/
// list of client options
const CLIENT_OPTIONS = {
    "wd-coket1": { ggsURL: "coca-cola.server93.com",    appId: 9,     scheduledEntry: false,     allowTempStatus: true,     ignoreDestinationEvents: false,     statusOption: { default: "assigned", insideOrigin: "assigned",     insideOriginEvent: "entered_origin",    enRouteToDestination: "in_transit" }    },
    "wd-coket2": { ggsURL: "coca-cola.server93.com",    appId: 4,     scheduledEntry: false,     allowTempStatus: false,    ignoreDestinationEvents: true,      statusOption: { default: "assigned", insideOrigin: "dispatched",   insideOriginEvent: "dispatched",        enRouteToDestination: "onDelivery" }    },
    "wd-wilcon": { ggsURL: "wru.server93.com",          appId: 427,   scheduledEntry: true,      allowTempStatus: true,     ignoreDestinationEvents: false,     statusOption: { default: "assigned", insideOrigin: "assigned",     insideOriginEvent: "entered_origin",    enRouteToDestination: "in_transit" }    },
};

// initialize timezone and date formats
const timezone = "Asia/Manila";
const format = {
    date: "MMM DD, YYYY",
    time: "h:mm A",
    datetime: "MMM DD, YYYY, h:mm A"
};

// maximum number of times to call an API when it returned an error
const MAX_TRIES = 5;

// maximum number of hours between event time and current time
// events beyond that time difference are ignored
const MAX_HOURDIFF = 24;
/************** end Variable Initialization **************/

// production
router.post('/:dbName/:username', (req,res,next)=>{
    const dbName = req.params.dbName;
    const body = req.body;
    const clientName = "wd-"+dbName;
    
    var hasError = false; // check if there were error/s during process(). 
                          // the reason for this is to send status 500 after all CLIENTS are done 
                          // instead of returning error immediately while other CLIENTS (if available) 
                          // have not yet undergone through process().
                        
    // initialize timezone and date formats
    const now = moment.tz(undefined, undefined, timezone); // get current time
    const now_ms = now.valueOf(); // get current time in milliseconds

    // initialize database
    const vehiclesHistoryCollection = db.getCollection(dbName,'vehicles_history');

    // get Main credentials
    const ggsURL = CLIENT_OPTIONS[clientName].ggsURL;
    const appId = CLIENT_OPTIONS[clientName].appId;

    // extra function for objects
    const OBJECT = {
        sortByKey: o => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {}),
        getKeyByValue: (o,v) => Object.keys(o).find(key => o[key] === v),
    };

    // check whether NOW is within schedule date
    function isNowWithinSchedule(minDate,shiftTime){
        // format date to MMM DD, YYYY
        minDate = moment.tz(minDate, undefined, timezone).format(format.date);

        // split shift schedule into minimum and maximum time.
        // Sample Original format: 12:00 AM - 3:00 PM
        shiftTime = (shiftTime||"").split(" - ");

        const minTime = shiftTime[0]; // minimum time - 12:00 AM
        const maxTime = shiftTime[1]; // maximum time - 3:00 PM

        // convert minimum time to moment object
        const minTimeMoment = moment.tz(minTime, format.time, timezone);
        // convert maximum time to moment object
        const maxTimeMoment = moment.tz(maxTime, format.time, timezone);
        // if maximum time is before minimum time, add 1 day to date
        // Reason: shifts like "July 28, 2021 - 8:00 PM - 1:00 AM"
        // Goal: Min DateTime = July 28, 2021, 8:00 PM
        //       Max DateTime = July 29, 2021, 1:00 AM
        const maxDate = (maxTimeMoment.isBefore(minTimeMoment)) ? moment.tz(minDate, format.date, timezone).add(1,"day") : minDate;
        
        // activate entry XX minutes BEFORE scheduled date and time. Default value is 0.
        // Eg. Schedule: July 28, 2021 (8:00 PM - 1:00 AM)
        //     activateInMinutes: 60
        //     Result: Activate entry on July 28, 2021, 7:00 PM
        const minutes = (CLIENT_OPTIONS[clientName]||{}).activateInMinutes || 0;

        // get the minimum date and time minus X minutes in milliseconds
        const minSchedule = moment.tz(`${minDate}, ${minTime}`, format.datetime, timezone).subtract(minutes,"minutes").valueOf();
        // get the maximum date and time in milliseconds
        const maxSchedule = moment.tz(`${maxDate}, ${maxTime}`, format.datetime, timezone).valueOf();

        // return true if NOW is between minimum schedule and maximum schedule
        return (now_ms >= minSchedule && now_ms <= maxSchedule);
    }

    // check if RULE_NAME meets the condition
    function getIndexOf(text,arr,op){
        var cond = null;
        arr.forEach(val => {
            if(op == "or" && !cond){
                cond = (text.indexOf(val) > -1);
            }
            if(op == "and" && (cond == null || cond == true)){
                cond = (text.indexOf(val) > -1);
            }
        });
        return cond;
    };

    // variable to be sent back to client
    var returnStatus = {};

    // declare variables
    var __tempStat = null;
    var late_data_entry = null;
    var events_captured = {};

    // variables sent by client
    const geofenceId = body.geofenceId;
    const scheduled_date = body.scheduled_date;
    const shift_schedule = body.shift_schedule;
    const __originalObj = body.__originalObj;
    const route = body.route;
    const vehicle_id = Number((body.vehicle||{})._id);
    const vehicleUsername = (body.vehicle||{}).username;
    const __status = body.__status;
    const dGeofence = body.dGeofence;
    const geofence = body.geofence;
    const roundtrip = body.roundtrip;
    const checkSchedule = body.checkSchedule; // boolean - whether the function should check for Schedule or not
    const apiKey = body.apiKey;

    // sent by client because of Previous Check-In feature. User can select a different check-in-check-out
    // and this function should be able to detect shipment's status based on their selection
    const previousCheckInOriginGeofence = body.previousCheckInOriginGeofence;
    const previousCheckInDestinationGeofence = body.previousCheckInDestinationGeofence;

    // Custom client options
    // Custom status
    const defaultStatus = CLIENT_OPTIONS[clientName].statusOption.default;
    const insideOriginStatus = CLIENT_OPTIONS[clientName].statusOption.insideOrigin;
    const insideOriginEventStatus = CLIENT_OPTIONS[clientName].statusOption.insideOriginEvent;
    const enRouteToDestinationStatus = CLIENT_OPTIONS[clientName].statusOption.enRouteToDestination;

    // if dispatch entry is set to make a scheduled/advanced entry
    const scheduledEntry = CLIENT_OPTIONS[clientName].scheduledEntry;

    // whether to ignore the destination events or not
    const ignoreDestinationEvents = CLIENT_OPTIONS[clientName].ignoreDestinationEvents;

    // whether to allow the function to save temp status. Temp status are used to save event times that did not meet the other conditions.
    // Useful for clients that depends on event times PER geofence. 
    const allowTempStatus = CLIENT_OPTIONS[clientName].allowTempStatus;
    
    // Geofence ID should not be null of undefined
    if(geofenceId){

        // If 'checkSchedule' is false OR
        // 'checkSchedule' is true AND 
        // either 'scheduledEntry' is false OR 
        // 'scheduledEntry' is true AND current dateTime is within the scheduled date and shift
        if(!checkSchedule || (checkSchedule && (!scheduledEntry || (scheduledEntry && isNowWithinSchedule(scheduled_date,shift_schedule))))){
            
            // check if original route and vehicle is same as current
            if((__originalObj && (__originalObj.route == route && __originalObj.vehicle_id == Number(vehicle_id))) && (!previousCheckInOriginGeofence && !previousCheckInDestinationGeofence)){
                // return empty object 
                returnStatus = {}; 
                isDone();
            } else {
                // if vehicle username is not null or undefined AND status is not in the array
                if(vehicleUsername && !["complete","incomplete","scheduled"].includes(__status)){

                    // function that checks whether the vehicle is inside the geofence or not (WRU Main)
                    function isVehicleInsideGeofenceId(tries){
                        tries = tries || 0;

                        // destination geofence
                        const destinationGeofenceName = dGeofence.short_name;
                        // origin geofence
                        const originShortName = geofence.short_name;

                        // function that determins what the status of the shipment should be based on the vehicle's location history
                        function determineShipmentStatus(oEvents,dEvents,byPassHourDiff){
                            // note: byPassHourDiff is used to not check the time difference between the event time and current time

                            // value will change depending on where the truck is
                            // set status to Client's default shipment status
                            var status = defaultStatus;
                            
                            // used to know the time difference between the event time and current time
                            // value will change when the truck left the origin. The new value will be used to check
                            // the time difference between the event time and Check-out time
                            var tempDateTime = now_ms;


                            // used for CokeT2
                            var isOnDelivery = false;
                            var storedDispatched = false;

                            // ------------> Origin
                            // loop origin events
                            for(var i = oEvents.length-1; i >= 0; i--){

                                const val = oEvents[i];

                                // convert time to milliseconds
                                const eventDate = moment.tz(val.timestamp, null, timezone).valueOf();
                                // calculate time difference between event time and 'tempDateTime'
                                const hourDiff = (byPassHourDiff === true) ? 0 : Math.abs(tempDateTime - eventDate) / 36e5;

                                // print necessary data for debugging
                                console.log("oEvents",val.RULE_NAME,val.stage,!events_captured[eventDate],hourDiff < MAX_HOURDIFF);

                                // in transit
                                // do not remove status = in_transit.
                                if(((val.RULE_NAME == "Inside Geofence" && val.stage == "end") || (val.RULE_NAME == "Outside Geofence" && val.stage == "start")) && late_data_entry == true && status != enRouteToDestinationStatus && hourDiff < MAX_HOURDIFF) {
                                        status = enRouteToDestinationStatus;
                                        events_captured[eventDate] = enRouteToDestinationStatus;
                                        
                                        tempDateTime = eventDate;
                                }
                                
                                // save event as idlingAtOrigin if RULE_NAME consists "Inside" and "Idle" strings
                                if(getIndexOf(val.RULE_NAME,["Inside","Idle"],"and") && !events_captured[eventDate] && hourDiff < MAX_HOURDIFF){
                                    events_captured[eventDate] = "idlingAtOrigin";
                                }

                                // save event as processingAtOrigin if RULE_NAME consists "Inside" and "Processing" strings
                                if(getIndexOf(val.RULE_NAME,["Inside","Processing"],"and") && !events_captured[eventDate] && hourDiff < MAX_HOURDIFF){
                                    events_captured[eventDate] = "processingAtOrigin";
                                }

                                // save event as queueingAtOrigin if RULE_NAME consists "Inside" and "Queueing" strings
                                if(getIndexOf(val.RULE_NAME,["Inside","Queueing"],"and") && !events_captured[eventDate] && hourDiff < MAX_HOURDIFF){
                                    events_captured[eventDate] = "queueingAtOrigin";
                                }
                                
                                // Left the geofence
                                // "!isOnDelivery && !storedDispatched" is added to check that the shipment is neither detected as On Delivery or Dispatched yet
                                // The status should be based on the latest data ONLY and not by geofence unlike CokeT1 and Wilcon
                                if((val.RULE_NAME == "Check Out" && val.stage == "start") && late_data_entry == true && status != enRouteToDestinationStatus && !isOnDelivery && !storedDispatched) {
                                    status = enRouteToDestinationStatus;
                                    events_captured[eventDate] = enRouteToDestinationStatus;
                                    tempDateTime = eventDate;
                                    isOnDelivery = true;
                                }
                                // Entered the geofence
                                // "!storedDispatched" is added to check that the shipment is not yet tagged as Dispatched
                                // The status should be based on the latest data ONLY and not by geofence unlike CokeT1 and Wilcon
                                if((val.RULE_NAME == "Check Out" && val.stage == "end") && !events_captured[eventDate] && !storedDispatched) {
                                    events_captured[eventDate] = insideOriginStatus;
                                    storedDispatched = true;
                                }

                                // save event as tempStatus for events that do not fall under idlingAtOrigin, processingAtOrigin, or queueingAtOrigin, etc
                                if(allowTempStatus && !events_captured[eventDate] && hourDiff < MAX_HOURDIFF){
                                    events_captured[eventDate] = "tempStatus";
                                }
                            }

                            // if late entry and no 'enRouteToDestinationStatus' timestamp
                            if(late_data_entry == true && !OBJECT.getKeyByValue(events_captured,enRouteToDestinationStatus)){
                                // last timestamp will be 'enRouteToDestinationStatus'
                                events_captured[now_ms] = enRouteToDestinationStatus;
                            }

                            // sort eventsCaptured by key (timestamp/eventDate) in ascending order
                            const sortedEvents = OBJECT.sortByKey(events_captured);

                            // change first status event to "entered_origin" or 'insideOriginEventStatus'
                            // Note: "entered_origin" is just for reference when the truck entered the origin geofence. It is not a status.
                            Object.keys(sortedEvents).forEach((key,i) => {
                                if(i == 0){
                                    // if first timestamp is not in transit, change value to entered_origin
                                    (sortedEvents[key] != enRouteToDestinationStatus) ? sortedEvents[key] = insideOriginEventStatus : null
                                }
                            });

                            // loop to delete "tempStatus"
                            Object.keys(sortedEvents).forEach(key => {
                                (sortedEvents[key] == "tempStatus") ? delete sortedEvents[key] : null;
                            });
                            
                            // had to loop again because when "tempStatus" is deleted, sortedEvents[lastTimestamp] ends up to be undefined
                            const lastTimestamp = Object.keys(sortedEvents).map(key => { return Number(key); }).sort().reverse()[0];
                            
                            // set events_captured equal to its sorted version
                            events_captured = sortedEvents;

                            // print necessary data for debugging
                            console.log("sortedEvents",status,sortedEvents);

                            // status is equal to the last timestamp's status value
                            status = sortedEvents[lastTimestamp] || defaultStatus;
                            // if status is equal to 'insideOriginEventStatus', change it to the proper status or  'insideOriginStatus'
                            // ex. For CokeT1/Wilcon, 'insideOriginEventStatus' is 'entered_origin' but 'insideOriginStatus' is 'assigned'
                            (status == insideOriginEventStatus) ? status = insideOriginStatus : null;



                            // ------------> Destination
                            // Check if its late entry 
                            if(late_data_entry == true && !ignoreDestinationEvents){

                                // get leaving time by status based on events captured
                                const enRouteDateTime = OBJECT.getKeyByValue(events_captured,enRouteToDestinationStatus);

                                status = enRouteToDestinationStatus;

                                // loop destination events
                                dEvents.forEach(val => {
                                    // convert time to milliseconds
                                    const eventDate = moment.tz(val.timestamp, null, timezone).valueOf();
                                    // calculate time difference between event time and 'tempDateTime'
                                    const hourDiff = (byPassHourDiff === true) ? 0 : Math.abs(tempDateTime - eventDate) / 36e5;

                                    // in_transit/onDelivery (if no enRouteDateTime)
                                    if(val.stage == "start" && !enRouteDateTime && hourDiff < MAX_HOURDIFF){
                                        events_captured[eventDate] = enRouteToDestinationStatus;
                                    }
                                    // end in_transit/onDelivery (if no enRouteDateTime)

                                    if(roundtrip) {
                                        // onSite
                                        // save event as onSite if conditions are the same as entering a geofence (destination geofence)
                                        if(!((val.RULE_NAME == "Inside Geofence" && val.stage == "end") || (val.RULE_NAME == "Outside Geofence" && val.stage == "start")) && status == enRouteToDestinationStatus && !events_captured[eventDate]){
                                            status = "onSite";
                                            events_captured[eventDate] = "onSite";
                                        }
                                        // end onSite
                                        

                                        // returning
                                        // save event as returning if conditions are the same as leaving a geofence (destination geofence)
                                        if(((val.RULE_NAME == "Inside Geofence" && val.stage == "end") || (val.RULE_NAME == "Outside Geofence" && val.stage == "start")) && status == "onSite" && !events_captured[eventDate]){
                                            status = "returning";
                                            events_captured[eventDate] = "returning";
                                        }
                                        // end returning
                                    } else {
                                        // complete
                                        // save event as complete when the truck entered the destination geofence
                                        if(status == enRouteToDestinationStatus && !events_captured[eventDate] && (Number(enRouteDateTime) < eventDate) && hourDiff < MAX_HOURDIFF){
                                            status = "complete";
                                            events_captured[eventDate] = "complete";
                                        }
                                        // end complete
                                    }
                                });
                            }

                            return status;
                        };

                        // if no previous check-in geofences sent
                        if(!previousCheckInOriginGeofence && !previousCheckInDestinationGeofence){
                            
                            function loadVehiclesHistory(){

                                // declare client query to be able to close connection later
                                const query = vehiclesHistoryCollection.find({ _id: vehicle_id });

                                // find vehicles where _id is vehicle_id
                                query.toArray().then(docs => {
                                    if(docs.length > 0){
                                        const doc = docs[0];
                                        
                                        const loc = doc.location || []; // don't name it 'location', it will refresh page (page.location??)

                                        // late entry - Truck selected is outside the origin
                                        if(late_data_entry) {
                                            // loop location history - latest to oldest
                                            for(var i = loc.length-1; i >= 0; i--){

                                                // if location is shipment's origin
                                                if(loc[i].short_name == originShortName){
                                                    // >>>>> Truck selected has left the origin <<<<<
                                                    
                                                    // late entry is true
                                                    late_data_entry = true;

                                                    // determine shipment status
                                                    // will automatically be saved as IN TRANSIT or ON DELIVERY.
                                                    __tempStat = determineShipmentStatus(loc[i].events,[]);

                                                    break;
                                                } else {
                                                    // if location is shipment's destination
                                                    if(loc[i].short_name == destinationGeofenceName){
                                                        // remove the last location (detected as shipment's destination)
                                                        // ex. 
                                                        // loc = [ { short_name: "ABC" }, { short_name: "EFG" }, { short_name: "HIJ" }, { short_name: "KLM" } ] 
                                                        // destination = "HIJ"
                                                        // locationsBeforeDestination = [ { short_name: "ABC" }, { short_name: "EFG" } ] 
                                                        const locationsBeforeDestination = loc.slice(0, i);

                                                        // used to check if the origin is found???
                                                        var prevHasOrigin = false;

                                                        // loop locationsBeforeDestination - latest to oldest
                                                        for(var j = locationsBeforeDestination.length-1; j >= 0; j--){
                                                            // if it kept on looping and location is the destination again, break loop
                                                            if(locationsBeforeDestination[j].short_name == destinationGeofenceName){
                                                                break;
                                                            }
                                                            // if location is origin,
                                                            // >>>>> Truck selected has left the origin and is already at destination. <<<<<
                                                            if(locationsBeforeDestination[j].short_name == originShortName){
                                                                // late entry is true
                                                                late_data_entry = true;
                                                                // determine shipment status
                                                                __tempStat = determineShipmentStatus(locationsBeforeDestination[j].events,loc[i].events);
                                                                prevHasOrigin = true;
                                                                break;
                                                            }
                                                        }
                                                        // >>>>> Truck selected is NOT within the origin. It is assumed that the truck is enroute to origin <<<<<
                                                        if(!prevHasOrigin){
                                                            // late entry is false
                                                            late_data_entry = false;
                                                            // make set it to Client's default shipment status
                                                            __tempStat = defaultStatus;
                                                        }
                                                        break;
                                                    }
                                                }
                                            }

                                            // even after looping the vehicle's location history and __tempStat is still null then,
                                            // >>>>> Truck selected is NOT within the origin. It is assumed that the truck is enroute to origin <<<<<
                                            if(__tempStat == null) {
                                                // make set it to Client's default inside origin status
                                                __tempStat = defaultStatus;
                                                // late entry is false
                                                late_data_entry = false;
                                            }
                                        } else {
                                            // >>>>> Truck selected is within the origin <<<<<
                                            
                                            // get the last location of the truck and check if it is the shipment's origin
                                            if(loc[loc.length-1].short_name == originShortName){
                                                // determine shipment status
                                                __tempStat = determineShipmentStatus(loc[loc.length-1].events);
                                            }
                                            
                                            // if '__tempStat' is null, then 
                                            if(__tempStat == null) {
                                                // make set it to Client's default inside origin status
                                                __tempStat = insideOriginStatus;
                                                // late entry is false
                                                late_data_entry = false;
                                            }
                                        }
                                        
                                        // sort events_captured
                                        const sortedEvents = OBJECT.sortByKey(events_captured);
                                        events_captured = sortedEvents;

                                        // added this just in case __tempStat is null
                                        __tempStat = __tempStat || defaultStatus;

                                        // print necessary data for debugging
                                        console.log("EYOOOEOEOEOOEOEO",late_data_entry,__tempStat,events_captured);

                                        // close the mongodb client connection
                                        query.close();
                                        
                                        // return data
                                        returnStatus = {
                                            status: __tempStat,
                                            late_data_entry,
                                            events_captured,
                                        };
                                        isDone();

                                    } else {
                                        // close the mongodb client connection
                                        query.close();
                                        
                                        // return error
                                        returnStatus = {
                                            error: 1,
                                            message: 'Truck selected does not exist.'
                                        }
                                        isDone();
                                    }
                                }).catch(error => { 

                                    // close the mongodb client connection
                                    query.close(); 

                                    // if the request returned an error, we will try until the number of maximum tries is reached
                                    if(error.status == 0 && tries < MAX_TRIES){
                                        tries++;
                                        isVehicleInsideGeofenceId(tries);
                                    } else {
                                        // if maximum tries is reached, resolve this dbName function
                                        isDone("Vehicles History",error);
                                    }
                                });
                            }
                            
                            // get the list of users/trucks inside the geofence (WRU Main)
                            request({
                                method: 'GET',
                                url: `https://${ggsURL}/comGpsGate/api/v.1/applications/${appId}/geofences/${geofenceId}/users?FromIndex=0&PageSize=500`,
                                headers: {
                                    "Authorization": apiKey
                                },
                            }, (error, response, body) => {
                                if (!error && response.statusCode == 200) {
                                    // parse the body
                                    body = JSON.parse(body);

                                    // print necessary data for debugging
                                    // console.log("Vehicles1:",JSON.stringify(body));

                                    // if the truck is inside the geofence, late_data_entry is false. Else, true
                                    // Ex. body = [ { id: "A", username: "123" }, { id: "B", username: "456" } ] 
                                    // !body.some(x => x.username == "555"); -----> true
                                    // !body.some(x => x.username == "456"); -----> false
                                    late_data_entry = !body.some(x => x.username == vehicleUsername);
                                    
                                    // load vehicle history
                                    loadVehiclesHistory();
                                } else {                                                
                                    // if the request returned an error, we will try until the number of maximum tries is reached
                                    if(error.status == 0 && tries < MAX_TRIES){
                                        tries++;
                                        isVehicleInsideGeofenceId(tries);
                                    } else {
                                        // if maximum tries is reached, resolve this dbName function
                                        isDone("GGS Geofences 01",error);
                                    }
                                }
                            });
                        } else {
                            if(previousCheckInOriginGeofence && previousCheckInDestinationGeofence){

                                // late entry is true (there's data for 'previousCheckInDestinationGeofence' too)
                                late_data_entry = true;

                                // print necessary data for debugging
                                console.log(previousCheckInDestinationGeofence.short_name,destinationGeofenceName);

                                // if location is destination
                                if(previousCheckInDestinationGeofence.short_name == destinationGeofenceName){
                                    // determine shipment status -- 'previousCheckInOriginGeofence' and 'previousCheckInDestinationGeofence' is passed
                                    __tempStat = determineShipmentStatus(previousCheckInOriginGeofence.events,(previousCheckInDestinationGeofence||{}).events,true);
                                } else {
                                    // determine shipment status -- only 'previousCheckInOriginGeofence'
                                    __tempStat = determineShipmentStatus(previousCheckInOriginGeofence.events,[],true);
                                }

                                // sort events_captured
                                var tempEventsCaptured = OBJECT.sortByKey(events_captured);
                                events_captured = tempEventsCaptured;

                                // print necessary data for debugging
                                console.log("EYOOOEOEOEOOEOEO1111111111",late_data_entry,__tempStat,events_captured);

                                // return data
                                returnStatus = {
                                    status: __tempStat,
                                    late_data_entry,
                                    events_captured: events_captured
                                };
                                isDone();
                            } else {
                                // ---> There's only data for 'previousCheckInOriginGeofence'

                                // get the list of users/trucks inside the geofence (WRU Main)
                                request({
                                    method: 'GET',
                                    url: `https://${ggsURL}/comGpsGate/api/v.1/applications/${appId}/geofences/${geofenceId}/users?FromIndex=0&PageSize=500`,
                                    headers: {
                                        "Authorization": apiKey
                                    },
                                }, (error, response, body) => {
                                    if (!error && response.statusCode == 200) {
                                        // parse the body
                                        body = JSON.parse(body);

                                        // print necessary data for debugging
                                        // console.log("Vehicles2:",JSON.stringify(body));

                                        // if the truck is inside the geofence, late_data_entry is false. Else, true
                                        // Ex. body = [ { id: "A", username: "123" }, { id: "B", username: "456" } ] 
                                        // !body.some(x => x.username == "555"); -----> true
                                        // !body.some(x => x.username == "456"); -----> false
                                        late_data_entry = !body.some(x => x.username == vehicleUsername);
                                        
                                        // determine shipment status
                                        __tempStat = determineShipmentStatus(previousCheckInOriginGeofence.events,[],true);

                                        // sort events_captured
                                        const sortedEvents = OBJECT.sortByKey(events_captured);
                                        events_captured = sortedEvents;

                                        // print necessary data for debugging
                                        console.log("EYOOOEOEOEOOEOEO222222222",late_data_entry,__tempStat,events_captured);

                                        returnStatus = {
                                            status: __tempStat,
                                            late_data_entry,
                                            events_captured: events_captured
                                        };
                                        
                                        isDone();
                                        
                                    } else {
                                        // if the request returned an error, we will try until the number of maximum tries is reached
                                        if(error.status == 0 && tries < MAX_TRIES){
                                            tries++;
                                            isVehicleInsideGeofenceId(tries);
                                        } else {
                                            // if maximum tries is reached, resolve this dbName function
                                            isDone("GGS Geofences 02",error);
                                        }
                                    }
                                });
                            }
                        }
                    }

                    isVehicleInsideGeofenceId();
                } else {
                    // return empty object 
                    returnStatus = {}; 
                    isDone();
                }
            }
        } else {
            // if current time is not within schedule, status is "scheduled"
            if(checkSchedule && scheduledEntry && !isNowWithinSchedule(scheduled_date,shift_schedule)){
                returnStatus = {
                    status: "scheduled",
                    late_data_entry: false,
                    events_captured: {},
                };
            } else {
                // return the Client's default shipment status
                returnStatus = {
                    status: defaultStatus,
                    late_data_entry: false,
                    events_captured: {},
                };
            }

            isDone();
        }
    } else {
        // incomplete data. Status is PLAN
        returnStatus = {
            status: "plan",
            late_data_entry: false,
            events_captured: {},
        };
        isDone();
    }
    
    // will resolve the function depending if there was an error or not. Also, this will display the error if an error is passed
    function isDone(errTitle,err){
        // if error, display the title and error
        if(err) {
            console.log(`Error in ${errTitle}:`,err);
            hasError = true;
        }

        // return
        res.status(hasError?500:200).send(hasError?"ERROR":returnStatus);
    }
});

// development
router.post('/:dbName/:username/development', (req,res,next)=>{
    const dbName = req.params.dbName;
    const body = req.body;
    const clientName = "wd-"+dbName;
    
    var hasError = false; // check if there were error/s during process(). 
                          // the reason for this is to send status 500 after all CLIENTS are done 
                          // instead of returning error immediately while other CLIENTS (if available) 
                          // have not yet undergone through process().
                        
    // initialize timezone and date formats
    const now = moment.tz(undefined, undefined, timezone); // get current time
    const now_ms = now.valueOf(); // get current time in milliseconds

    // initialize database
    const vehiclesHistoryCollection = db.getCollection(dbName,'vehicles_history');

    // get Main credentials
    const ggsURL = CLIENT_OPTIONS[clientName].ggsURL;
    const appId = CLIENT_OPTIONS[clientName].appId;

    // extra function for objects
    const OBJECT = {
        sortByKey: o => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {}),
        getKeyByValue: (o,v) => Object.keys(o).find(key => o[key] === v),
    };

    // check whether NOW is within schedule date
    function isNowWithinSchedule(minDate,shiftTime){
        // format date to MMM DD, YYYY
        minDate = moment.tz(minDate, undefined, timezone).format(format.date);

        // split shift schedule into minimum and maximum time.
        // Sample Original format: 12:00 AM - 3:00 PM
        shiftTime = (shiftTime||"").split(" - ");

        const minTime = shiftTime[0]; // minimum time - 12:00 AM
        const maxTime = shiftTime[1]; // maximum time - 3:00 PM

        // convert minimum time to moment object
        const minTimeMoment = moment.tz(minTime, format.time, timezone);
        // convert maximum time to moment object
        const maxTimeMoment = moment.tz(maxTime, format.time, timezone);
        // if maximum time is before minimum time, add 1 day to date
        // Reason: shifts like "July 28, 2021 - 8:00 PM - 1:00 AM"
        // Goal: Min DateTime = July 28, 2021, 8:00 PM
        //       Max DateTime = July 29, 2021, 1:00 AM
        const maxDate = (maxTimeMoment.isBefore(minTimeMoment)) ? moment.tz(minDate, format.date, timezone).add(1,"day") : minDate;
        
        // activate entry XX minutes BEFORE scheduled date and time. Default value is 0.
        // Eg. Schedule: July 28, 2021 (8:00 PM - 1:00 AM)
        //     activateInMinutes: 60
        //     Result: Activate entry on July 28, 2021, 7:00 PM
        const minutes = (CLIENT_OPTIONS[clientName]||{}).activateInMinutes || 0;

        // get the minimum date and time minus X minutes in milliseconds
        const minSchedule = moment.tz(`${minDate}, ${minTime}`, format.datetime, timezone).subtract(minutes,"minutes").valueOf();
        // get the maximum date and time in milliseconds
        const maxSchedule = moment.tz(`${maxDate}, ${maxTime}`, format.datetime, timezone).valueOf();

        // return true if NOW is between minimum schedule and maximum schedule
        return (now_ms >= minSchedule && now_ms <= maxSchedule);
    }

    // check if RULE_NAME meets the condition
    function getIndexOf(text,arr,op){
        var cond = null;
        arr.forEach(val => {
            if(op == "or" && !cond){
                cond = (text.indexOf(val) > -1);
            }
            if(op == "and" && (cond == null || cond == true)){
                cond = (text.indexOf(val) > -1);
            }
        });
        return cond;
    };

    // variable to be sent back to client
    var returnStatus = {};

    // declare variables
    var __tempStat = null;
    var late_data_entry = null;
    var events_captured = {};

    // variables sent by client
    const geofenceId = body.geofenceId;
    const scheduled_date = body.scheduled_date;
    const shift_schedule = body.shift_schedule;
    const __originalObj = body.__originalObj;
    const route = body.route;
    const vehicle_id = Number((body.vehicle||{})._id);
    const vehicleUsername = (body.vehicle||{}).username;
    const __status = body.__status;
    const dGeofence = body.dGeofence;
    const geofence = body.geofence;
    const roundtrip = body.roundtrip;
    const checkSchedule = body.checkSchedule; // boolean - whether the function should check for Schedule or not
    const apiKey = body.apiKey;

    // sent by client because of Previous Check-In feature. User can select a different check-in-check-out
    // and this function should be able to detect shipment's status based on their selection
    const previousCheckInOriginGeofence = body.previousCheckInOriginGeofence;
    const previousCheckInDestinationGeofence = body.previousCheckInDestinationGeofence;

    // Custom client options
    // Custom status
    const defaultStatus = CLIENT_OPTIONS[clientName].statusOption.default;
    const insideOriginStatus = CLIENT_OPTIONS[clientName].statusOption.insideOrigin;
    const insideOriginEventStatus = CLIENT_OPTIONS[clientName].statusOption.insideOriginEvent;
    const enRouteToDestinationStatus = CLIENT_OPTIONS[clientName].statusOption.enRouteToDestination;

    // if dispatch entry is set to make a scheduled/advanced entry
    const scheduledEntry = CLIENT_OPTIONS[clientName].scheduledEntry;

    // whether to ignore the destination events or not
    const ignoreDestinationEvents = CLIENT_OPTIONS[clientName].ignoreDestinationEvents;

    // whether to allow the function to save temp status. Temp status are used to save event times that did not meet the other conditions.
    // Useful for clients that depends on event times PER geofence. 
    const allowTempStatus = CLIENT_OPTIONS[clientName].allowTempStatus;
    
    // Geofence ID should not be null of undefined
    if(geofenceId){

        // If 'checkSchedule' is false OR
        // 'checkSchedule' is true AND 
        // either 'scheduledEntry' is false OR 
        // 'scheduledEntry' is true AND current dateTime is within the scheduled date and shift
        if(!checkSchedule || (checkSchedule && (!scheduledEntry || (scheduledEntry && isNowWithinSchedule(scheduled_date,shift_schedule))))){
            
            // check if original route and vehicle is same as current
            if((__originalObj && (__originalObj.route == route && __originalObj.vehicle_id == Number(vehicle_id))) && (!previousCheckInOriginGeofence && !previousCheckInDestinationGeofence)){
                // return empty object 
                returnStatus = {}; 
                isDone();
            } else {
                // if vehicle username is not null or undefined AND status is not in the array
                if(vehicleUsername && !["complete","incomplete","scheduled"].includes(__status)){

                    // function that checks whether the vehicle is inside the geofence or not (WRU Main)
                    function isVehicleInsideGeofenceId(tries){
                        tries = tries || 0;

                        // destination geofence
                        const destinationGeofenceName = dGeofence.short_name;
                        // origin geofence
                        const originShortName = geofence.short_name;

                        // function that determins what the status of the shipment should be based on the vehicle's location history
                        function determineShipmentStatus(oEvents,dEvents,byPassHourDiff){
                            // note: byPassHourDiff is used to not check the time difference between the event time and current time

                            // value will change depending on where the truck is
                            // set status to Client's default shipment status
                            var status = defaultStatus;
                            
                            // used to know the time difference between the event time and current time
                            // value will change when the truck left the origin. The new value will be used to check
                            // the time difference between the event time and Check-out time
                            var tempDateTime = now_ms;


                            // used for CokeT2
                            var isOnDelivery = false;
                            var storedDispatched = false;

                            // ------------> Origin
                            // loop origin events
                            for(var i = oEvents.length-1; i >= 0; i--){

                                const val = oEvents[i];

                                // convert time to milliseconds
                                const eventDate = moment.tz(val.timestamp, null, timezone).valueOf();
                                // calculate time difference between event time and 'tempDateTime'
                                const hourDiff = (byPassHourDiff === true) ? 0 : Math.abs(tempDateTime - eventDate) / 36e5;

                                // print necessary data for debugging
                                console.log("oEvents",val.RULE_NAME,val.stage,!events_captured[eventDate],hourDiff < MAX_HOURDIFF);

                                // in transit
                                // do not remove status = in_transit.
                                if(((val.RULE_NAME == "Inside Geofence" && val.stage == "end") || (val.RULE_NAME == "Outside Geofence" && val.stage == "start")) && late_data_entry == true && status != enRouteToDestinationStatus && hourDiff < MAX_HOURDIFF) {
                                        status = enRouteToDestinationStatus;
                                        events_captured[eventDate] = enRouteToDestinationStatus;
                                        
                                        tempDateTime = eventDate;
                                }
                                
                                // save event as idlingAtOrigin if RULE_NAME consists "Inside" and "Idle" strings
                                if(getIndexOf(val.RULE_NAME,["Inside","Idle"],"and") && !events_captured[eventDate] && hourDiff < MAX_HOURDIFF){
                                    events_captured[eventDate] = "idlingAtOrigin";
                                }

                                // save event as processingAtOrigin if RULE_NAME consists "Inside" and "Processing" strings
                                if(getIndexOf(val.RULE_NAME,["Inside","Processing"],"and") && !events_captured[eventDate] && hourDiff < MAX_HOURDIFF){
                                    events_captured[eventDate] = "processingAtOrigin";
                                }

                                // save event as queueingAtOrigin if RULE_NAME consists "Inside" and "Queueing" strings
                                if(getIndexOf(val.RULE_NAME,["Inside","Queueing"],"and") && !events_captured[eventDate] && hourDiff < MAX_HOURDIFF){
                                    events_captured[eventDate] = "queueingAtOrigin";
                                }
                                
                                // Left the geofence
                                // "!isOnDelivery && !storedDispatched" is added to check that the shipment is neither detected as On Delivery or Dispatched yet
                                // The status should be based on the latest data ONLY and not by geofence unlike CokeT1 and Wilcon
                                if((val.RULE_NAME == "Check Out" && val.stage == "start") && late_data_entry == true && status != enRouteToDestinationStatus && !isOnDelivery && !storedDispatched) {
                                    status = enRouteToDestinationStatus;
                                    events_captured[eventDate] = enRouteToDestinationStatus;
                                    tempDateTime = eventDate;
                                    isOnDelivery = true;
                                }
                                // Entered the geofence
                                // "!storedDispatched" is added to check that the shipment is not yet tagged as Dispatched
                                // The status should be based on the latest data ONLY and not by geofence unlike CokeT1 and Wilcon
                                if((val.RULE_NAME == "Check Out" && val.stage == "end") && !events_captured[eventDate] && !storedDispatched) {
                                    events_captured[eventDate] = insideOriginStatus;
                                    storedDispatched = true;
                                }

                                // save event as tempStatus for events that do not fall under idlingAtOrigin, processingAtOrigin, or queueingAtOrigin, etc
                                if(allowTempStatus && !events_captured[eventDate] && hourDiff < MAX_HOURDIFF){
                                    events_captured[eventDate] = "tempStatus";
                                }
                            }

                            // if late entry and no 'enRouteToDestinationStatus' timestamp
                            if(late_data_entry == true && !OBJECT.getKeyByValue(events_captured,enRouteToDestinationStatus)){
                                // last timestamp will be 'enRouteToDestinationStatus'
                                events_captured[now_ms] = enRouteToDestinationStatus;
                            }

                            // sort eventsCaptured by key (timestamp/eventDate) in ascending order
                            const sortedEvents = OBJECT.sortByKey(events_captured);

                            // change first status event to "entered_origin" or 'insideOriginEventStatus'
                            // Note: "entered_origin" is just for reference when the truck entered the origin geofence. It is not a status.
                            Object.keys(sortedEvents).forEach((key,i) => {
                                if(i == 0){
                                    // if first timestamp is not in transit, change value to entered_origin
                                    (sortedEvents[key] != enRouteToDestinationStatus) ? sortedEvents[key] = insideOriginEventStatus : null
                                }
                            });

                            // loop to delete "tempStatus"
                            Object.keys(sortedEvents).forEach(key => {
                                (sortedEvents[key] == "tempStatus") ? delete sortedEvents[key] : null;
                            });
                            
                            // had to loop again because when "tempStatus" is deleted, sortedEvents[lastTimestamp] ends up to be undefined
                            const lastTimestamp = Object.keys(sortedEvents).map(key => { return Number(key); }).sort().reverse()[0];
                            
                            // set events_captured equal to its sorted version
                            events_captured = sortedEvents;

                            // print necessary data for debugging
                            console.log("sortedEvents",status,sortedEvents);

                            // status is equal to the last timestamp's status value
                            status = sortedEvents[lastTimestamp] || defaultStatus;
                            // if status is equal to 'insideOriginEventStatus', change it to the proper status or  'insideOriginStatus'
                            // ex. For CokeT1/Wilcon, 'insideOriginEventStatus' is 'entered_origin' but 'insideOriginStatus' is 'assigned'
                            (status == insideOriginEventStatus) ? status = insideOriginStatus : null;



                            // ------------> Destination
                            // Check if its late entry 
                            if(late_data_entry == true && !ignoreDestinationEvents){

                                // get leaving time by status based on events captured
                                const enRouteDateTime = OBJECT.getKeyByValue(events_captured,enRouteToDestinationStatus);

                                status = enRouteToDestinationStatus;

                                // loop destination events
                                dEvents.forEach(val => {
                                    // convert time to milliseconds
                                    const eventDate = moment.tz(val.timestamp, null, timezone).valueOf();
                                    // calculate time difference between event time and 'tempDateTime'
                                    const hourDiff = (byPassHourDiff === true) ? 0 : Math.abs(tempDateTime - eventDate) / 36e5;

                                    // in_transit/onDelivery (if no enRouteDateTime)
                                    if(val.stage == "start" && !enRouteDateTime && hourDiff < MAX_HOURDIFF){
                                        events_captured[eventDate] = enRouteToDestinationStatus;
                                    }
                                    // end in_transit/onDelivery (if no enRouteDateTime)

                                    if(roundtrip) {
                                        // onSite
                                        // save event as onSite if conditions are the same as entering a geofence (destination geofence)
                                        if(!((val.RULE_NAME == "Inside Geofence" && val.stage == "end") || (val.RULE_NAME == "Outside Geofence" && val.stage == "start")) && status == enRouteToDestinationStatus && !events_captured[eventDate]){
                                            status = "onSite";
                                            events_captured[eventDate] = "onSite";
                                        }
                                        // end onSite
                                        

                                        // returning
                                        // save event as returning if conditions are the same as leaving a geofence (destination geofence)
                                        if(((val.RULE_NAME == "Inside Geofence" && val.stage == "end") || (val.RULE_NAME == "Outside Geofence" && val.stage == "start")) && status == "onSite" && !events_captured[eventDate]){
                                            status = "returning";
                                            events_captured[eventDate] = "returning";
                                        }
                                        // end returning
                                    } else {
                                        // complete
                                        // save event as complete when the truck entered the destination geofence
                                        if(status == enRouteToDestinationStatus && !events_captured[eventDate] && (Number(enRouteDateTime) < eventDate) && hourDiff < MAX_HOURDIFF){
                                            status = "complete";
                                            events_captured[eventDate] = "complete";
                                        }
                                        // end complete
                                    }
                                });
                            }

                            return status;
                        };

                        // if no previous check-in geofences sent
                        if(!previousCheckInOriginGeofence && !previousCheckInDestinationGeofence){
                            
                            function loadVehiclesHistory(){

                                // declare client query to be able to close connection later
                                const query = vehiclesHistoryCollection.find({ _id: vehicle_id });

                                // find vehicles where _id is vehicle_id
                                query.toArray().then(docs => {
                                    if(docs.length > 0){
                                        const doc = docs[0];
                                        
                                        const loc = doc.location || []; // don't name it 'location', it will refresh page (page.location??)

                                        // late entry - Truck selected is outside the origin
                                        if(late_data_entry) {
                                            // loop location history - latest to oldest
                                            for(var i = loc.length-1; i >= 0; i--){

                                                // if location is shipment's origin
                                                if(loc[i].short_name == originShortName){
                                                    // >>>>> Truck selected has left the origin <<<<<
                                                    
                                                    // late entry is true
                                                    late_data_entry = true;

                                                    // determine shipment status
                                                    // will automatically be saved as IN TRANSIT or ON DELIVERY.
                                                    __tempStat = determineShipmentStatus(loc[i].events,[]);

                                                    break;
                                                } else {
                                                    // if location is shipment's destination
                                                    if(loc[i].short_name == destinationGeofenceName){
                                                        // remove the last location (detected as shipment's destination)
                                                        // ex. 
                                                        // loc = [ { short_name: "ABC" }, { short_name: "EFG" }, { short_name: "HIJ" }, { short_name: "KLM" } ] 
                                                        // destination = "HIJ"
                                                        // locationsBeforeDestination = [ { short_name: "ABC" }, { short_name: "EFG" } ] 
                                                        const locationsBeforeDestination = loc.slice(0, i);

                                                        // used to check if the origin is found???
                                                        var prevHasOrigin = false;

                                                        // loop locationsBeforeDestination - latest to oldest
                                                        for(var j = locationsBeforeDestination.length-1; j >= 0; j--){
                                                            // if it kept on looping and location is the destination again, break loop
                                                            if(locationsBeforeDestination[j].short_name == destinationGeofenceName){
                                                                break;
                                                            }
                                                            // if location is origin,
                                                            // >>>>> Truck selected has left the origin and is already at destination. <<<<<
                                                            if(locationsBeforeDestination[j].short_name == originShortName){
                                                                // late entry is true
                                                                late_data_entry = true;
                                                                // determine shipment status
                                                                __tempStat = determineShipmentStatus(locationsBeforeDestination[j].events,loc[i].events);
                                                                prevHasOrigin = true;
                                                                break;
                                                            }
                                                        }
                                                        // >>>>> Truck selected is NOT within the origin. It is assumed that the truck is enroute to origin <<<<<
                                                        if(!prevHasOrigin){
                                                            // late entry is false
                                                            late_data_entry = false;
                                                            // make set it to Client's default shipment status
                                                            __tempStat = defaultStatus;
                                                        }
                                                        break;
                                                    }
                                                }
                                            }

                                            // even after looping the vehicle's location history and __tempStat is still null then,
                                            // >>>>> Truck selected is NOT within the origin. It is assumed that the truck is enroute to origin <<<<<
                                            if(__tempStat == null) {
                                                // make set it to Client's default inside origin status
                                                __tempStat = defaultStatus;
                                                // late entry is false
                                                late_data_entry = false;
                                            }
                                        } else {
                                            // >>>>> Truck selected is within the origin <<<<<
                                            
                                            // get the last location of the truck and check if it is the shipment's origin
                                            if(loc[loc.length-1].short_name == originShortName){
                                                // determine shipment status
                                                __tempStat = determineShipmentStatus(loc[loc.length-1].events);
                                            }
                                            
                                            // if '__tempStat' is null, then 
                                            if(__tempStat == null) {
                                                // make set it to Client's default inside origin status
                                                __tempStat = insideOriginStatus;
                                                // late entry is false
                                                late_data_entry = false;
                                            }
                                        }
                                        
                                        // sort events_captured
                                        const sortedEvents = OBJECT.sortByKey(events_captured);
                                        events_captured = sortedEvents;

                                        // added this just in case __tempStat is null
                                        __tempStat = __tempStat || defaultStatus;

                                        // print necessary data for debugging
                                        console.log("EYOOOEOEOEOOEOEO",late_data_entry,__tempStat,events_captured);

                                        // close the mongodb client connection
                                        query.close();
                                        
                                        // return data
                                        returnStatus = {
                                            status: __tempStat,
                                            late_data_entry,
                                            events_captured,
                                        };
                                        isDone();

                                    } else {
                                        // close the mongodb client connection
                                        query.close();
                                        
                                        // return error
                                        returnStatus = {
                                            error: 1,
                                            message: 'Truck selected does not exist.'
                                        }
                                        isDone();
                                    }
                                }).catch(error => { 

                                    // close the mongodb client connection
                                    query.close(); 

                                    // if the request returned an error, we will try until the number of maximum tries is reached
                                    if(error.status == 0 && tries < MAX_TRIES){
                                        tries++;
                                        isVehicleInsideGeofenceId(tries);
                                    } else {
                                        // if maximum tries is reached, resolve this dbName function
                                        isDone("Vehicles History",error);
                                    }
                                });
                            }
                            
                            // get the list of users/trucks inside the geofence (WRU Main)
                            request({
                                method: 'GET',
                                url: `https://${ggsURL}/comGpsGate/api/v.1/applications/${appId}/geofences/${geofenceId}/users?FromIndex=0&PageSize=500`,
                                headers: {
                                    "Authorization": apiKey
                                },
                            }, (error, response, body) => {
                                if (!error && response.statusCode == 200) {
                                    // parse the body
                                    body = JSON.parse(body);

                                    // print necessary data for debugging
                                    // console.log("Vehicles1:",JSON.stringify(body));

                                    // if the truck is inside the geofence, late_data_entry is false. Else, true
                                    // Ex. body = [ { id: "A", username: "123" }, { id: "B", username: "456" } ] 
                                    // !body.some(x => x.username == "555"); -----> true
                                    // !body.some(x => x.username == "456"); -----> false
                                    late_data_entry = !body.some(x => x.username == vehicleUsername);
                                    
                                    // load vehicle history
                                    loadVehiclesHistory();
                                } else {                                                
                                    // if the request returned an error, we will try until the number of maximum tries is reached
                                    if(error.status == 0 && tries < MAX_TRIES){
                                        tries++;
                                        isVehicleInsideGeofenceId(tries);
                                    } else {
                                        // if maximum tries is reached, resolve this dbName function
                                        isDone("GGS Geofences 01",error);
                                    }
                                }
                            });
                        } else {
                            if(previousCheckInOriginGeofence && previousCheckInDestinationGeofence){

                                // late entry is true (there's data for 'previousCheckInDestinationGeofence' too)
                                late_data_entry = true;

                                // print necessary data for debugging
                                console.log(previousCheckInDestinationGeofence.short_name,destinationGeofenceName);

                                // if location is destination
                                if(previousCheckInDestinationGeofence.short_name == destinationGeofenceName){
                                    // determine shipment status -- 'previousCheckInOriginGeofence' and 'previousCheckInDestinationGeofence' is passed
                                    __tempStat = determineShipmentStatus(previousCheckInOriginGeofence.events,(previousCheckInDestinationGeofence||{}).events,true);
                                } else {
                                    // determine shipment status -- only 'previousCheckInOriginGeofence'
                                    __tempStat = determineShipmentStatus(previousCheckInOriginGeofence.events,[],true);
                                }

                                // sort events_captured
                                var tempEventsCaptured = OBJECT.sortByKey(events_captured);
                                events_captured = tempEventsCaptured;

                                // print necessary data for debugging
                                console.log("EYOOOEOEOEOOEOEO1111111111",late_data_entry,__tempStat,events_captured);

                                // return data
                                returnStatus = {
                                    status: __tempStat,
                                    late_data_entry,
                                    events_captured: events_captured
                                };
                                isDone();
                            } else {
                                // ---> There's only data for 'previousCheckInOriginGeofence'

                                // get the list of users/trucks inside the geofence (WRU Main)
                                request({
                                    method: 'GET',
                                    url: `https://${ggsURL}/comGpsGate/api/v.1/applications/${appId}/geofences/${geofenceId}/users?FromIndex=0&PageSize=500`,
                                    headers: {
                                        "Authorization": apiKey
                                    },
                                }, (error, response, body) => {
                                    if (!error && response.statusCode == 200) {
                                        // parse the body
                                        body = JSON.parse(body);

                                        // print necessary data for debugging
                                        // console.log("Vehicles2:",JSON.stringify(body));

                                        // if the truck is inside the geofence, late_data_entry is false. Else, true
                                        // Ex. body = [ { id: "A", username: "123" }, { id: "B", username: "456" } ] 
                                        // !body.some(x => x.username == "555"); -----> true
                                        // !body.some(x => x.username == "456"); -----> false
                                        late_data_entry = !body.some(x => x.username == vehicleUsername);
                                        
                                        // determine shipment status
                                        __tempStat = determineShipmentStatus(previousCheckInOriginGeofence.events,[],true);

                                        // sort events_captured
                                        const sortedEvents = OBJECT.sortByKey(events_captured);
                                        events_captured = sortedEvents;

                                        // print necessary data for debugging
                                        console.log("EYOOOEOEOEOOEOEO222222222",late_data_entry,__tempStat,events_captured);

                                        returnStatus = {
                                            status: __tempStat,
                                            late_data_entry,
                                            events_captured: events_captured
                                        };
                                        
                                        isDone();
                                        
                                    } else {
                                        // if the request returned an error, we will try until the number of maximum tries is reached
                                        if(error.status == 0 && tries < MAX_TRIES){
                                            tries++;
                                            isVehicleInsideGeofenceId(tries);
                                        } else {
                                            // if maximum tries is reached, resolve this dbName function
                                            isDone("GGS Geofences 02",error);
                                        }
                                    }
                                });
                            }
                        }
                    }

                    isVehicleInsideGeofenceId();
                } else {
                    // return empty object 
                    returnStatus = {}; 
                    isDone();
                }
            }
        } else {
            // if current time is not within schedule, status is "scheduled"
            if(checkSchedule && scheduledEntry && !isNowWithinSchedule(scheduled_date,shift_schedule)){
                returnStatus = {
                    status: "scheduled",
                    late_data_entry: false,
                    events_captured: {},
                };
            } else {
                // return the Client's default shipment status
                returnStatus = {
                    status: defaultStatus,
                    late_data_entry: false,
                    events_captured: {},
                };
            }

            isDone();
        }
    } else {
        // incomplete data. Status is PLAN
        returnStatus = {
            status: "plan",
            late_data_entry: false,
            events_captured: {},
        };
        isDone();
    }
    
    // will resolve the function depending if there was an error or not. Also, this will display the error if an error is passed
    function isDone(errTitle,err){
        // if error, display the title and error
        if(err) {
            console.log(`Error in ${errTitle}:`,err);
            hasError = true;
        }

        // return
        res.status(hasError?500:200).send(hasError?"ERROR":returnStatus);
    }
});

module.exports = router;