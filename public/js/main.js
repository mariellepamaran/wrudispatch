/************** GLOBAL VARIABLES **************/
var autorizationLevel = {
    dispatcher: () => { return ["dispatcher"].includes(USER.role); },
    administrator: () => { return ["administrator","developer"].includes(USER.role); },
};
var vehiclePersonnelCalendarOptions = {
    rest_days: { optionTitle: "Rest Days", label: "Rest Day" },
    on_leave:  { optionTitle: "On Leave",  label: "On Leave" },
    absent:    { optionTitle: "Absences",  label: "Absent" },
    suspended: { optionTitle: "Suspended", label: "Suspended" },
    awol: { optionTitle: "AWOL",      label: "AWOL" },
};
/************** END GLOBAL VARIABLES **************/

function matcher(query, data,opt) {
    // https://jsfiddle.net/adigas/2g1q5ypn/
    // console.log(query,data);

    var id = $(data.element).parent().attr("id");

    var arrTerm = (query.term||"").split(",");
    var term1 = (arrTerm[0]||"")._trim().toUpperCase();
    var term2 = (arrTerm[1]||"")._trim().toUpperCase();

    var text = (data.text||"").toUpperCase();
    
    var fullSubText = ($(data.element).attr("data-subtext")||"").replace(/<br>/g," ").toUpperCase();
    var arrSubText = ($(data.element).attr("data-subtext")||"").split("<br>");
    var subText1 = (arrSubText[0]||"")._trim().toUpperCase();
    var subText2 = (arrSubText[1]||"")._trim().toUpperCase();
    var subText3 = (arrSubText[2]||"")._trim().toUpperCase();

    if(id == "route"){
        if(!query.term || (!term2 && text.indexOf(term1) > -1) || ((text.indexOf(term1) > -1 || subText1.indexOf(term1) > -1) && subText2.indexOf(term2) > -1)){
            return data;
        }
        else return null;
    } else if(id == "vehicle"){
        var tempSubText = (subText2.indexOf("TRAILER") > -1) ? subText3 : subText2;
        if(!query.term || text.indexOf(term1) > -1 || subText1.indexOf(term1) > -1 || tempSubText.indexOf(term1) > -1){
            return data;
        }
        else return null;
        // var tempSubtext = [];
        // arrSubText.forEach(val => {
        //     if(val.indexOf("Trailer") == -1){
        //         tempSubtext.push(val);
        //     }
        // });
        // tempSubtext = tempSubtext.join(" ").toUpperCase();

        // if(!query.term || text.indexOf(term1) > -1 || tempSubtext.indexOf(term1) > -1){
        //     return data;
        // }
        // else return null;
    } else {
        if(fullSubText.indexOf(term1) > -1 || text.indexOf(term1) > -1){
            return data;
        }
        else return null;
    }
};
function formatCustom(state) {
    return $(
        '<div><b>' + state.text + '</b><div class="text-muted">'
            + ($(state.element).attr('data-subtext')||"")
            + '</div></div>'
    );
};
function formatCustomGrayed(state) {
    var condition = false;
    Object.keys(vehiclePersonnelCalendarOptions).forEach(key => {
        (state.text.indexOf(vehiclePersonnelCalendarOptions[key].label) > -1) ? condition = true : null;
    });
    var _class_ = condition ? "text-muted" : "";
    return $(`<div class="${_class_}">${state.text}</div>`);
};
function getSelect2Options(){
    /******** VEHICLES ********/
    G_SELECT2["form-vehicles"] = `<option value="">&nbsp;</option>`;
    G_SELECT2["form-vehicles-admin"] = `<option value="">&nbsp;</option>`;
    (LIST["vehicles"]||[]).forEach(val => {
        var status = VEHICLES.STATUS.find(x => x.id == (val.status || "")) || {value: "Available"};
        var subtext = "";
        var subtextAdmin = "";
        try {
            function getSubtext(type) {
                var _array_ = [];
                var _custom_ = clientCustom.gSelect2.vehicles[type] || [];
                _custom_.forEach(_val_ => {
                    switch(_val_) {
                        case "trailer":
                            var trailer = getTrailer(val.name);
                            var trailerValue = (trailer) ? "Straight Truck" : (val["Trailer"]||"-");
                            _array_.push(`Trailer: ${trailerValue}`);
                            break;
                        case "truck_number":
                            _array_.push(`Truck Number: ${val["Truck Number"] || "-"}`);
                            break;
                        case "conduction_number":
                            _array_.push(`Conduction #: ${val["Tractor Conduction"]||"-"}`);
                            break;
                        case "availability":
                            _array_.push(`Availability: ${status.value}`);
                            break;
                        default:
                            // code block
                    } 
                });
                return _array_.join("<br>");
            }
            subtext = getSubtext("subtext");
            subtextAdmin = getSubtext("subtextAdmin");
        } catch(error){}

        // do not remove username. Used in "checkSelectedVehicleWithinGeofence" function
        G_SELECT2["form-vehicles-admin"] += `<option value="${val._id}" username="${val.username}" data-subtext="${subtextAdmin}">${val.name}</option>`;
        G_SELECT2["form-vehicles"] += `<option value="${val._id}" username="${val.username}" data-subtext="${subtext}">${val.name}</option>`;
    });
    /******** END VEHICLES ********/

    /******** VEHICLES SECTION ********/
    G_SELECT2["form-vehicles_section"] = `<option value="">&nbsp;</option>`;
    (LIST["vehicles_section"]||[]).forEach(val => {
        (!val.delete) ? G_SELECT2["form-vehicles_section"] += `<option value="${val._id}">${val.section}</option>` : null;
    });
    /******** END VEHICLES SECTION ********/

    /******** VEHICLES COMPANY ********/
    G_SELECT2["form-vehicles_company"] = `<option value="">&nbsp;</option>`;
    (LIST["vehicles_company"]||[]).forEach(val => {
        (!val.delete) ? G_SELECT2["form-vehicles_company"] += `<option value="${val._id}">${val.company}</option>` : null;
    });
    /******** END VEHICLES COMPANY ********/
    
    /******** VEHICLE PERSONNEL ********/
    // G_SELECT2["form-vehicle_personnel"] = `<option value="">&nbsp;</option>`;
    // (LIST["vehicle_personnel"]||[]).forEach(val => {
    //     var subtext = `Occupation: ${val.occupation||"-"}<br>ID Number: ${val.id_number||"-"}`;
    //     G_SELECT2["form-vehicle_personnel"] += `<option value="${val._id}" data-subtext="${subtext}">${val.name}</option>`;
    // });
    /******** END VEHICLE PERSONNEL ********/

    /******** VEHICLE PERSONNEL SECTION ********/
    G_SELECT2["form-vehicle_personnel_section"] = `<option value="">&nbsp;</option>`;
    (LIST["vehicle_personnel_section"]||[]).forEach(val => {
        (!val.delete) ? G_SELECT2["form-vehicle_personnel_section"] += `<option value="${val._id}">${val.section}</option>` : null;
    });
    /******** END VEHICLE PERSONNEL SECTION ********/

    /******** VEHICLE PERSONNEL COMPANY ********/
    G_SELECT2["form-vehicle_personnel_company"] = `<option value="">&nbsp;</option>`;
    (LIST["vehicle_personnel_company"]||[]).forEach(val => {
        (!val.delete) ? G_SELECT2["form-vehicle_personnel_company"] += `<option value="${val._id}">${val.company}</option>` : null;
    });
    /******** END VEHICLE PERSONNEL COMPANY ********/
    
    /******** SHIFT SCHEDULE ********/
    G_SELECT2["form-shift_schedule"] = ``;
    (LIST["shift_schedule"]||[]).forEach(val => {
        G_SELECT2["form-shift_schedule"] += `<option value="${val._id}">${val._id}</option>`;
    });
    /******** END SHIFT SCHEDULE ********/
    
    /******** TRAILERS ********/
    G_SELECT2["form-trailers"] = `<option value="">&nbsp;</option><option disabled>Straight Truck</option>`;
    (LIST["trailers"]||[]).forEach(val => {
        var subtext = `Pal Cap: ${val.pal_cap||"-"}<br>Region: ${val.region||"-"}<br>Cluster: ${val.cluster||"-"}<br>Site: ${val.site||"-"}`;
        G_SELECT2["form-trailers"] += `<option value="${val._id}" data-subtext="${subtext}">${val._id}</option>`;
    });
    /******** END TRAILERS ********/


    /******** ROUTES ********/
    var routes = LIST["routes"] || [];
    try {
        if((clientCustom.defaultOrigin.roles||[]).includes(USER.role)){
            routes = (LIST["routes"]||[]).filter(x => x.origin_id && x.origin_id.toString() == clientCustom.defaultOrigin.id);
        } 
    } catch(error) {}

    G_SELECT2["form-routes"] = `<option value="">&nbsp;</option>`;
    (routes||[]).forEach(val => {
        var origin = getGeofence(val.origin_id) || {};
        var destination = getGeofence(val.destination_id) || {};

        var subtext = `Origin: ${origin.short_name} (${origin.site_name||"-"})<br>Destination: ${destination.short_name} (${destination.site_name||"-"})`;
        G_SELECT2["form-routes"] += `<option value="${val._id}" data-subtext="${subtext}">${val._id}</option>`;
    });
    /******** END ROUTES ********/
};
function getDuration(status,obj){
    obj.events_captured = obj.events_captured || {};
    var events_captured = OBJECT.sortByKey(obj.events_captured);
    var duration = 0;
    var start,end;
    Object.keys(events_captured).forEach(key => {
        if(events_captured[key] == status){
            start = Number(key);
        } else {
            if(start && !end){
                end = Number(key);
                duration += end - start;
                start = null;
                end = null;
            }
        }
    });
    if(start && !end){
        duration = 0;
    }
    return duration;
}
function getDateTime(status,obj,type="first"){
    obj.events_captured = obj.events_captured || {};
    var events_captured = OBJECT.sortByKey(obj.events_captured);
    var datetime = 0;
    Object.keys(events_captured).forEach(key => {
        if(events_captured[key] == status){
            if(type == "first" && !datetime){
                datetime = Number(key);
            }
            if(type == "last"){
                datetime = Number(key);
            }
        }
        if(!status){
            if(type == "first" && !datetime){
                datetime = Number(key);
            }
            if(type == "last"){
                datetime = Number(key);
            }
        }
    });
    return datetime;
}
function withinSchedule(date,minMaxTime,allowAllGreaterMinTime){
    date = moment(new Date(date)).format("MM/DD/YYYY");

    var _withinSchedule_ = false;
    var shiftArr = (minMaxTime||"").split(" - ");
    var shiftMinTime = shiftArr[0];
    var shiftMaxTime = shiftArr[1];
    var beginningTime = moment(shiftMinTime, 'h:mm A');
    var endTime = moment(shiftMaxTime, 'h:mm A');
    var dateTemp = (!beginningTime.isBefore(endTime)) ? moment(new Date(date)).add(1,"day").format("MM/DD/YYYY") : date;
    var minTime = new Date(`${date}, ${shiftMinTime}`).getTime();
    var maxTime = new Date(`${dateTemp}, ${shiftMaxTime}`).getTime();
    var currentTime = new Date().getTime();

    console.log(date);
    
    if((currentTime >= minTime && currentTime <= maxTime) || (allowAllGreaterMinTime && currentTime < minTime)){
        _withinSchedule_ = true;
    }
    return _withinSchedule_;
}
function isFinishedLoading(arr,isNew,callback){
    var condition = true;
    arr.forEach(val => {
        if((CLIENT.loadInBackground||[]).includes(val)){
            if(!GGS.STATUS[val]){
                condition = false;
            }
        }
    });
    if(condition == true && isNew) callback();
}

/************** CLASSES **************/
class Dispatch {
    constructor(obj,table_id,viewOnly) {
        LIST["dispatch"] = LIST["dispatch"] || [];
        obj.events_captured = obj.events_captured || {};
        obj.destination = obj.destination || [];
        obj.destination[0] = obj.destination[0] || {};

        function getValue(_list_,_key_,_val_,_autoVal_,_newObjVal_,_arr_){
            _val_ = _val_ || {};
            var str;
            if(_list_){
                if(_autoVal_) str = (LIST[_key_].find(x => x._id == _val_) || {})[_autoVal_];
                else str = LIST[_key_].find(x => x._id == _val_) || {};
                (_newObjVal_) ? obj[_newObjVal_] = str : null;
            } else {
                if(_arr_){
                    str = {};
                    _arr_.forEach(val => {
                        str[val] = `<small class="font-italic text-muted">loading...</small>`;
                    });
                } else 
                    str = `<small class="font-italic text-muted">loading...</small>`;
            }
            return str;
        }

        var disabledArr = [];
        if(["complete"].includes(obj.status)){
            if(autorizationLevel.administrator()){
                disabledArr = ["statusUpdate","edit","edit-admin"];
            } else {
                disabledArr = ["statusUpdate","edit","edit-admin","delete"];
            }
        }
        if(["in_transit","incomplete"].includes(obj.status)){ 
            if(autorizationLevel.administrator()){
                disabledArr = [];
            } else {
                disabledArr = ["statusUpdate","edit","edit-admin"];
            }
        }
        if(["in_transit","complete","incomplete"].includes(obj.status)){ 
            if(autorizationLevel.administrator()){} 
            else {
                disabledArr.push("delete");
            }
        }
        
        var loadView_ReadOnly = (GGS.STATUS.REGIONS && GGS.STATUS.CLUSTERS && GGS.STATUS.GEOFENCES && GGS.STATUS.VEHICLES && GGS.STATUS.ROUTES) ? [] : ["edit","edit-admin","view"],
            entered_origin = getDuration("entered_origin",obj),
            queueingAtOrigin = getDuration("queueingAtOrigin",obj),
            processingAtOrigin = getDuration("processingAtOrigin",obj),
            idlingAtOrigin = getDuration("idlingAtOrigin",obj),
            in_transit = getDuration("in_transit",obj),
            action = TABLE.ROW_BUTTONS(PAGE.GET(),{loadView:loadView_ReadOnly,readonlyArr:loadView_ReadOnly,adminArr:["edit-admin"],status:obj.status,username:obj.username,disabledArr}),
            user = getUser(obj.username) || {},
            posted_by = ((USER.username == obj.username)?"You":(user.name || obj.username)),
            postedByWithName = user.name || obj.username,
            origin = getValue(LIST["geofences"],"geofences",obj.origin_id,null,"_origin",["short_name"]),
            destination = getValue(LIST["geofences"],"geofences",obj.destination[0].location_id,null,"_destination",["short_name"]),
            region = getValue(LIST["regions"]&&LIST["geofences"],"regions",origin.region_id,"region","_region"),
            cluster = getValue(LIST["clusters"]&&LIST["geofences"],"clusters",origin.cluster_id,"cluster","_cluster"),
            vehicle = getValue(LIST["vehicles"],"vehicles",obj.vehicle_id,null,"_vehicle",["name","Trailer"]),
            route = getValue(LIST["routes"],"routes",obj.route,null,"_route",["transit_time"]),
            trailer = getValue(LIST["trailers"],"trailers",(obj.trailer||vehicle["Trailer"]),null,null,["_id","pal_cap"]),
            driver = getValue(LIST["vehicle_personnel"],"vehicle_personnel",(obj.driver_id),null,null,["name"]),
            checker = getValue(LIST["vehicle_personnel"],"vehicle_personnel",(obj.checker_id),null,null,["name"]),
            helper = getValue(LIST["vehicle_personnel"],"vehicle_personnel",(obj.helper_id),null,null,["name"]),
            index = LIST["dispatch"].findIndex(x => x._id == obj._id),
            beforeCheckOutTime = getDateTime("entered_origin",obj) || getDateTime("queueingAtOrigin",obj) || getDateTime("processingAtOrigin",obj) || getDateTime("idlingAtOrigin",obj),
            cico_time_calcAtOrigin = (beforeCheckOutTime) ?  (getDateTime("in_transit",obj,"last") - beforeCheckOutTime) : 0,
            cico_time_dhAtOrigin = (["in_transit","complete","incomplete"].includes(obj.status)) ? DATETIME.DH(cico_time_calcAtOrigin || 0) : "-",
            cico_time_hhmmAtOrigin = (cico_time_dhAtOrigin == "-")?"-":DATETIME.HH_MM(null,cico_time_dhAtOrigin).hour_minute,
            cico_time_5AtOrigin =(cico_time_dhAtOrigin == "-")?"-": DATETIME.HH_MM(null,5.0).hour_minute,
            isPL = (origin.short_name) ? (origin.short_name.indexOf(" PL") > -1) : false;

        if(viewOnly){
            action = TABLE.ROW_BUTTONS(PAGE.GET(),{customButtons:["view"],loadView:loadView_ReadOnly,readonlyArr:loadView_ReadOnly,username:obj.username});
        }
        (table_id) ? $(`${table_id} th:last-child`).css({"min-width":action.width,"width":action.width}) : null;

        if(obj._id){
            (obj._row) ? null : obj._row = GENERATE.RANDOM(36);
            (index > -1) ? LIST["dispatch"][index] = obj : LIST["dispatch"].push(obj);
            // var a = [];
            // LIST[x.urlPath].forEach(aa => {
            //     a.push(aa._id);
            // })
            // console.log("1".a.join(", "));
        }

        (posted_by == "_API_") ? posted_by = `${CLIENT.name} Server` : null;

        var attachmentsHTML = "";
        if(obj.attachments){
            obj.attachments.forEach((val,i) => {
                attachmentsHTML += `<div style="font-weight: normal;">${i+1}. <a href="${val.url}" target="_blank">${val.filename||"-"}</a></div>`;
            });
        }

        this._row = obj._row;
        this._id = obj._id;
        this.ticket_number = obj.ticket_number||"-";
        this.departure_date = DATETIME.FORMAT(obj.departure_date);
        this.departure__date = DATETIME.FORMAT(obj.departure_date,"MMM DD, YYYY");
        this.departure__time = DATETIME.FORMAT(obj.departure_date,"hh:mm A");
        this.region = region || "-";
        this.cluster = cluster || "-";
        this.origin = origin.short_name || "-";
        this.route = obj.route || "-";
        this.destination = `${(destination.short_name || "-")}${GET.LENGTH(destination.length).text}`;
        this.etd = DATETIME.FORMAT(obj.destination[0].etd);
        this.eta = DATETIME.FORMAT(obj.destination[0].eta);
        this.target_transit_time = DATETIME.HH_MM(null,route.transit_time).hour_minute;
        this.target_cico_time = DATETIME.HH_MM(null,origin.cico).hour_minute;
        this.vehicle = vehicle.name || "-";
        this.plate_number = vehicle["Plate Number"] || "-";
        this.truck_number = vehicle["Truck Number"] || "-";
        this.conduction_number = vehicle["Tractor Conduction"] || "-";
        this.trailer = trailer._id || "-";
        this.pal_cap = trailer.pal_cap || "-";
        this.driver = driver.name || "-";
        this.checker = checker.name || "-";
        this.helper = helper.name || "-";
        this.comments = obj.comments || "-";
        
        this.entered_datetime = DATETIME.FORMAT(getDateTime(null,obj));
        this.queueing_datetime = DATETIME.FORMAT(getDateTime("queueingAtOrigin",obj));
        this.queueingDuration = DATETIME.HH_MM(queueingAtOrigin).hour_minute;
        this.processing_datetime = DATETIME.FORMAT(getDateTime("processingAtOrigin",obj));
        this.processingDuration = DATETIME.HH_MM(processingAtOrigin).hour_minute;
        this.idling_datetime = DATETIME.FORMAT(getDateTime("idlingAtOrigin",obj));
        this.idlingDuration = DATETIME.HH_MM(idlingAtOrigin).hour_minute;
        this.cico = (["in_transit","onSite","returning","complete","incomplete"].includes(obj.status)) ? cico_time_hhmmAtOrigin : "-";
        this.cico_capped = (["in_transit","onSite","returning","complete","incomplete"].includes(obj.status)) ? ((cico_time_dhAtOrigin>5 && isPL)?cico_time_5AtOrigin:cico_time_hhmmAtOrigin) : "-";
        this.transit_datetime = (["in_transit","onSite","returning","complete","incomplete"].includes(obj.status)) ? DATETIME.FORMAT(getDateTime("in_transit",obj,"last")) : "-";
        this.transitDuration = (["in_transit","onSite","returning","complete","incomplete"].includes(obj.status)) ? DATETIME.HH_MM(in_transit).hour_minute : "-";
        this.onSite_datetime = (["onSite","returning","complete","incomplete"].includes(obj.status)) ? DATETIME.FORMAT(getDateTime("onSite",obj,"last")) : "-";
        this.returning_datetime = (["returning","complete","incomplete"].includes(obj.status)) ? DATETIME.FORMAT(getDateTime("returning",obj,"last")) : "-";
        this.complete_datetime = (["complete"].includes(obj.status)) ? DATETIME.FORMAT(getDateTime("complete",obj,"last")) : "-";
        this.status = GET.STATUS(obj.status).html;
        this.statusText = GET.STATUS(obj.status).text;
        this.scheduled_date = DATETIME.FORMAT(obj.scheduled_date,"MMM DD, YYYY");
        this.shift_schedule = obj.shift_schedule || "-";
        this.posted_by = posted_by;
        this.postedByWithName = postedByWithName;
        this.posting_date = DATETIME.FORMAT(obj.posting_date);
        this.late_entry = obj.late_entry ? "Yes".bold() : "No";
        this.action = action.buttons;
        this.attachmentsHTML = attachmentsHTML;

        this.ongoingHTML = (obj.status != "complete") ? `<span class="ongoing" style="width: 7px;height: 7px;background: #00a548;border-radius: 20px;top: 14px;margin-left: 4px;position: absolute;"></span>` : "";

        var esc1_remarks = "";
        Object.keys(obj.esc1_remarks||{}).forEach(key => {
            var val = obj.esc1_remarks[key];
            var user = getUser(val.username) || {};
            esc1_remarks += `${val.remarks}<div class="font-11 text-muted mb-1">${user.name || val.username} | ${DATETIME.FORMAT(Number(key))}</div>`;
        });
        var esc2_remarks = "";
        Object.keys(obj.esc2_remarks||{}).forEach(key => {
            var val = obj.esc2_remarks[key];
            var user = getUser(val.username) || {};
            esc2_remarks += `${val.remarks}<div class="font-11 text-muted mb-1">${user.name || val.username} | ${DATETIME.FORMAT(Number(key))}</div>`;
        });
        var esc3_remarks = "";
        Object.keys(obj.esc3_remarks||{}).forEach(key => {
            var val = obj.esc3_remarks[key];
            var user = getUser(val.username) || {};
            esc3_remarks += `${val.remarks}<div class="font-11 text-muted mb-1">${user.name || val.username} | ${DATETIME.FORMAT(Number(key))}</div>`;
        });
        this.esc1_remarks = esc1_remarks || "-";
        this.esc2_remarks = esc2_remarks || "-";
        this.esc3_remarks = esc3_remarks || "-";

        // <td>Traffic as per driver.<div class="font-11 text-muted mb-1">Marielle Pamaran | Mar 18, 2021, 05:00 AM</div></td>

        this.history = obj.history || {};
    }

    row() {
        return {
            '_row':  this._row,
            '_id': this._id,
            'Ticket Number': this.ticket_number,
            'Departure Date': this.departure_date,
            'Departure__Date': this.departure__date,
            'Departure__Time': this.departure__time,
            'Region': this.region,
            'Cluster': this.cluster,
            'Origin': this.origin,
            'Route': this.route,
            'Destination': this.destination,
            'ETD': this.etd,
            'ETA': this.eta,
            'Target Transit Time': this.target_transit_time,
            'Target CICO Time': this.target_cico_time,
            'Vehicle': this.vehicle,
            'Plate Number': this.plate_number,
            'Truck Number': this.truck_number,
            'Trailer': this.trailer,
            'Conduction Number': this.conduction_number,
            'Pal Cap': this.pal_cap,
            'Driver': this.driver,
            'Checker': this.checker,
            'Helper': this.helper,
            'Comments': this.comments,
            'Queueing Duration': this.queueingDuration,
            'Processing Duration':this.processingDuration,
            'Idling Duration':this.idlingDuration,
            'CICO Time': this.cico,
            'CICO Time (Capped)': this.cico_capped,
            'Transit Duration': this.transitDuration,
            'Status': this.status,
            'Scheduled Date': this.scheduled_date,
            'Shift Schedule': this.shift_schedule,
            'Posted By': this.posted_by,
            'Posting Date': this.posting_date,
            'Late Entry': this.late_entry,
            'Action': this.action,
        };
    }

    html(){
        return `<div class="container-parent col-sm-12 p-0 text-dark p-0" _row="${this._row}">
                    <div class="container-header pt-2 pl-4 pr-4 pb-2">
                        <span class="container-header-title">${this._id || "-"}${this.ongoingHTML}</span>
                        <div class="container-header-body">${this.departure_date}, ${this.route}, ${this.vehicle}</div>
                        <i class="la la-angle-up" style="display:none;"></i>
                    </div>
                    <div class="container-body pr-4 pb-2" style="display:none;">
                        <div><span style="display: table-cell;width: 120px;">Departure Date</span><span style="display: table-cell;">${this.departure_date}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Region</span><span style="display: table-cell;">${this.region}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Cluster</span><span style="display: table-cell;">${this.cluster}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Origin</span><span style="display: table-cell;">${this.origin}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Route</span><span style="display: table-cell;">${this.route}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Destination</span><span style="display: table-cell;">${this.destination}</span></div>
                        <div><span style="display: table-cell;width: 120px;">ETD</span><span style="display: table-cell;">${this.etd}</span></div>
                        <div><span style="display: table-cell;width: 120px;">ETA</span><span style="display: table-cell;">${this.eta}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Target Transit Time</span><span style="display: table-cell;">${this.target_transit_time}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Target CICO Time</span><span style="display: table-cell;">${this.target_cico_time}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Vehicle</span><span style="display: table-cell;">${this.vehicle}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Trailer</span><span style="display: table-cell;">${this.trailer}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Conduction #</span><span style="display: table-cell;">${this.conduction_number}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Pal Cap</span><span style="display: table-cell;">${this.pal_cap}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Driver</span><span style="display: table-cell;">${this.driver}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Checker</span><span style="display: table-cell;">${this.checker}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Helper</span><span style="display: table-cell;">${this.helper}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Comments</span><span style="display: table-cell;">${this.comments}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Queueing Duration</span><span style="display: table-cell;"><div>${this.queueingDuration}</div></span></div>
                        <div><span style="display: table-cell;width: 120px;">Processing Duration</span><span style="display: table-cell;"><div>${this.processingDuration}</div></span></div>
                        <div><span style="display: table-cell;width: 120px;">Idling Duration</span><span style="display: table-cell;"><div>${this.idlingDuration}</div></span></div>
                        <div><span style="display: table-cell;width: 120px;">CICO Time</span><span style="display: table-cell;"><div>${this.cico}</div></span></div>
                        <div><span style="display: table-cell;width: 120px;">'CICO Time (Capped)</span><span style="display: table-cell;"><div>${this.cico_capped}</div></span></div>
                        <div><span style="display: table-cell;width: 120px;">Transit Duration</span><span style="display: table-cell;"><div>${this.transitDuration}</div></span></div>
                        <div><span style="display: table-cell;width: 120px;">Scheduled Date</span><span style="display: table-cell;">${this.scheduled_date}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Shift Schedule</span><span style="display: table-cell;">${this.shift_schedule}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Posted By</span><span style="display: table-cell;">${this.posted_by}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Posting Date</span><span style="display: table-cell;">${this.posting_date}</span></div>
                        <div><span style="display: table-cell;width: 120px;">Late Entry</span><span style="display: table-cell;">${this.late_entry}</span></div>
                    </div>
                </div>`;
    }

    tbl() {
        var tr = `width: 50%;float: left !important;padding-bottom: 2px;`;
        var tdFirst = `style="width: 200px;font-weight: bold;vertical-align:top;"`;
        return {
            tr,
            tdFirst,
            empty:  `<tr style="${tr}">
                        <td ${tdFirst}>&nbsp;</td>
                        <td>&nbsp;</td>
                    </tr>`,
            getTr: (key,value,color="",attr="",customTr) => {
                return `<tr style="${customTr||tr} ${color}">
                            <td ${tdFirst}>${key}</td>
                            <td ${attr}>${(value?`: ${value}`:"")}</td>
                        </tr>`
            }
                
        };
    }

    de_html(de){
        var runningDurationType = "Transit";
        if(de["Delay Type"].indexOf("Queueing") > -1) runningDurationType = "Queueing";
        if(de["Delay Type"].indexOf("CICO") > -1) runningDurationType = "CICO";

        return `<div id="overlay" attr_row="${de._row}" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                    <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                        <div role="document" class="modal-dialog modal-lg" style="margin:20px auto;">
                            <div class="modal-content">
                                <div class="modal-header pb-2">
                                    <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                    <div class="float-left">
                                        <h4 class="modal-title" id="myModalLabel2">${this._id.bold()} | Escalation ${de["Escalation"]}</h4>
                                        <div>
                                            <div><b style="width:60px;display: inline-block;">Vehicle</b>: ${this.vehicle}</div>
                                            <div><b style="width:60px;display: inline-block;">Trailer</b>: ${this.trailer}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-body row pl-3 pr-3 pt-2">
                                    <table style="margin: 0px 30px;">
                                        <tbody>
                                            ${this.tbl().getTr("Delay Type",de["Delay Type"],"color:#ca294b;")}
                                            ${this.tbl().getTr("Site",de["Destination"],"color:#ca294b;")}
                                            ${this.tbl().getTr(`Running ${runningDurationType} Duration`,"...","color:#ca294b;", "_duration")}
                                            ${this.tbl().empty}
                                        </tbody>
                                    </table>
                                    <div class="border-bottom mt-2"></div>
                                    <table style="margin: 0px 30px;">
                                        <tbody>
                                            ${this.tbl().empty} ${this.tbl().empty}
            
                                            ${this.tbl().getTr("Region",this.region)}
                                            ${this.tbl().getTr("Target Transit Time",this.target_transit_time)}
                                            ${this.tbl().getTr("Cluster",this.cluster)}
                                            ${this.tbl().getTr("Target CICO Time",this.target_cico_time)}
                                            ${this.tbl().getTr("Route",this.route)} ${this.tbl().empty} 
                                            
                                            ${this.tbl().empty} ${this.tbl().empty}
            
                                            ${this.tbl().getTr("Origin",this.origin)}
                                            ${this.tbl().getTr("Destination",this.destination)}
            
                                            ${this.tbl().empty} ${this.tbl().empty}

                                            ${(CLIENT.id == "wilcon")?`
                                                ${this.tbl().getTr("Driver",this.driver)}
                                                ${this.tbl().getTr("Checker",this.checker)}
                                                ${this.tbl().getTr("Helper",this.helper)} ${this.tbl().empty}

                                                ${this.tbl().empty} ${this.tbl().empty}
                                            `:""}
            
                                            ${this.tbl().getTr("Check In Date & Time",this.entered_datetime)}
                                            ${this.tbl().getTr("Status","")}
                                            ${this.tbl().getTr("Queueing Duration",this.queueingDuration)}
                                            <tr style="${this.tbl().tr}">
                                                <td colspan=2><div class="font-18" style="display: contents;">${this.status}</div></td>
                                            </tr>
            
                                        ${(de["Delay Type"].indexOf("Queueing") > -1) ? `
                                            ${this.tbl().empty} ${this.tbl().empty}
                                            ${this.tbl().empty} ${this.tbl().getTr("Posted By",this.posted_by)}
                                            ${this.tbl().empty} ${this.tbl().getTr("Posted On",this.posting_date)}
                                        ` : `
                                            ${this.tbl().getTr("Processing Duration",this.processingDuration)} ${this.tbl().empty}
                                            ${this.tbl().getTr("Idling Duration",this.idlingDuration)} ${this.tbl().getTr("Posted By",this.posted_by)}
                                            ${this.tbl().getTr("Check Out Date & Time",this.transit_datetime)} ${this.tbl().getTr("Posted On",this.posting_date)}
                                            ${this.tbl().getTr("CICO Time",this.cico)}
                                        `}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
    }
    
    fullView(){
        return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;z-index:999999 !important;">
                    <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                        <div role="document" class="modal-dialog modal-lg" style="margin:20px auto;width:90%;">
                            <div class="modal-content">
                                <div class="modal-header pb-2">
                                    <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                    <div class="float-left">
                                        <h4 class="modal-title" id="myModalLabel2">
                                            <b>${this._id}${((this.ticket_number)?` | ${this.ticket_number}`:"")}</b> 
                                            <div style="display: inline-block;top: -4px;position: relative;margin-left: 2px;font-size: 12px;">${this.status}</div>
                                        </h4>
                                        <div>Full Entry Details</div>
                                    </div>
                                </div>
                                <div class="modal-body row p-0" max-height: 480px;overflow-y: auto;>
                                    <div class="main-details col-sm-9" style="border-right: 1px solid #eee;padding: 15px 0px 10px 30px !important;">
                                        <table>
                                            <tbody>
                                                ${this.tbl().getTr("Region",this.region)}
                                                ${this.tbl().getTr("Origin",this.origin)}
                                                ${this.tbl().getTr("Cluster",this.cluster)}
                                                ${this.tbl().getTr("Destination",this.destination)}
                                                ${this.tbl().getTr("Route",this.route)} ${this.tbl().empty} 

                                                ${this.tbl().empty} ${this.tbl().empty}

                                                ${this.tbl().getTr("Vehicle",this.vehicle)}
                                                ${this.tbl().getTr("Trailer",this.trailer)}
                                                ${this.tbl().getTr("Pal Cap",this.pal_cap)}
                                                ${this.tbl().getTr("Conduction #",this.conduction_number)}

                                                ${this.tbl().empty} ${this.tbl().empty}

                                                ${(CLIENT.id == "wilcon")?`
                                                    ${this.tbl().getTr("Driver",this.driver)}
                                                    ${this.tbl().getTr("Checker",this.checker)}
                                                    ${this.tbl().getTr("Helper",this.helper)} ${this.tbl().empty}

                                                    ${this.tbl().empty} ${this.tbl().empty}
                                                `:""}

                                                ${this.tbl().getTr("Check In Date & Time",this.entered_datetime)} ${this.tbl().empty}
                                                ${this.tbl().getTr("Queueing Duration",this.queueingDuration)} ${this.tbl().empty}
                                                ${this.tbl().getTr("Processing Duration",this.processingDuration)} ${this.tbl().empty}
                                                ${this.tbl().getTr("Idling Duration",this.idlingDuration)} ${this.tbl().empty}
                                                ${this.tbl().getTr("Check Out Date & Time",this.transit_datetime)} ${this.tbl().empty}

                                                ${this.tbl().empty} ${this.tbl().empty}

                                                ${this.tbl().getTr("CICO Time",this.cico)}
                                                ${this.tbl().getTr("Target CICO Time",this.target_cico_time)}
                                                ${this.tbl().getTr("Transit Time",this.transitDuration)}
                                                ${this.tbl().getTr("Target Transit Time",this.target_transit_time)}

                                                ${this.tbl().empty} ${this.tbl().empty}
                                                
                                                ${(clientCustom.roundtrip)?`
                                                    ${this.tbl().getTr("On-Site Date & Time",this.onSite_datetime)} ${this.tbl().empty}
                                                    ${this.tbl().getTr("Returned Date & Time",this.returning_datetime)} ${this.tbl().empty}
                                                    ${this.tbl().getTr("Completion Date & Time",this.complete_datetime)} ${this.tbl().empty}
                                                `:` 
                                                    ${this.tbl().getTr("Completion Date & Time",this.complete_datetime)}
                                                `}
                                            </tbody>
                                        </table>
                                        <div class="border-bottom mb-2 mt-2"></div>
                                        <div class="col-sm-12 p-0 mb-3">
                                            <b>Attachments</b>
                                            <div class="col-sm-12">
                                                <div class="col-sm-12 pl-3">${this.attachmentsHTML || "-"}</div>
                                            </div>
                                        </div>
                                        <table>
                                            <tbody>
                                                ${this.tbl().getTr("Late Entry",this.late_entry)}
                                                ${this.tbl().getTr("Comments",this.comments)}

                                                ${this.tbl().empty} ${this.tbl().empty}

                                                ${(CLIENT.id == "wilcon")?`
                                                    ${this.tbl().getTr("Scheduled Date",this.scheduled_date)}
                                                    ${this.tbl().getTr("Shift Schedule",this.shift_schedule)}
                                                `:""}
                                                
                                                ${this.tbl().getTr("Posted By",this.posted_by)}
                                                ${this.tbl().getTr("Posting Date",this.posting_date)}
                                            </tbody>
                                        </table>
                                        <div class="border-bottom mb-2 mt-2"></div>
                                        <table>
                                            <tbody>
                                                ${this.tbl().getTr("Escalation 1 Remarks",this.esc1_remarks,"","","padding-bottom: 2px;")}
                                                ${this.tbl().getTr("Escalation 2 Remarks",this.esc2_remarks,"","","padding-bottom: 2px;")}
                                                ${this.tbl().getTr("Escalation 3 Remarks",this.esc3_remarks,"","","padding-bottom: 2px;")}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="history-details col-sm-3" style="overflow-y: auto;padding-right:30px;">
                                        <h5 class="mb-1">Logs</h5>
                                        ${DISPATCH.FUNCTION.history(this.history)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
    }
}
class loadInBackground {
    constructor(urlPath,type){
        this.urlPath = urlPath;
        this.type = type;
        this.failed = 0;
    }

    load(){
        var _this = this;

        if(LIST[_this.urlPath] && LIST[_this.urlPath].length > 0){
            GGS.STATUS[_this.type] = true;
            _this.g_select_settings();
            TABLE.FINISH_LOADING.START_CHECK();
        } else {
            var skip = 0,
                getData = function(length){
                    if(length == null || length == LIMIT){
                        $.ajax({ 
                            url: `/api/${_this.urlPath}/${CLIENT.id}/${USER.username}/all/${JSON.stringify({})}/${skip}/${LIMIT}`, 
                            method: "GET", 
                            timeout: 90000, 
                            headers: {
                                "Authorization": SESSION_TOKEN
                            },
                            async: true
                        }).done(function (docs) {
                            console.log(`${_this.urlPath.toUpperCase()}:`,docs);
                            if(!docs.error){
                                length = docs.length;

                                LIST[_this.urlPath] = LIST[_this.urlPath] || [];
                                docs.forEach(val => {
                                    var index = LIST[_this.urlPath].findIndex(x => x._id.toString() == val._id.toString());
                                    if(index > -1){
                                        LIST[_this.urlPath][index] = val;
                                    } else {
                                        val._row = GENERATE.RANDOM(36);
                                        LIST[_this.urlPath].push(val);
                                    }
                                });
        
                                skip+= length;
                                getData(length);
                            } else {
                                if(_this.failed != 5){
                                    setTimeout(function(){
                                        _this.failed++;
                                        _this.load();
                                    },1000);
                                }
                            }
                        }).fail(function(error){
                            console.log(`Error in GGS - ${_this.urlPath}`,error);
                            if(_this.failed != 5){
                                setTimeout(function(){
                                    _this.failed++;
                                    _this.load();
                                },1000);
                            }
                        });
                    } else {
                        TABLE.WATCH({urlPath:_this.urlPath});// BEFORE START_CHECK
                        GGS.STATUS[_this.type] = true;
                        _this.g_select_settings();
                        TABLE.FINISH_LOADING.START_CHECK();
                    }
                };
            getData();
        }
    }
    g_select_settings(){
        const _this = this;
        function getSettings(val){
            var obj = {};
            if(_this.urlPath == "regions"){
                obj = {
                    id: val._id,
                    value: val.region
                };
            }
            if(_this.urlPath == "clusters"){
                obj = {
                    id: val._id,
                    value: val.cluster,
                    region_id: val.region_id
                };
            }
            if(_this.urlPath == "geofences"){
                obj = {
                    id: val._id,
                    value: val.short_name,
                    code: val.code
                };
            }
            return obj;
        }
        G_SELECT[_this.urlPath] = [];
        (LIST[_this.urlPath]||[]).forEach(val => {
            G_SELECT[_this.urlPath].push(getSettings(val));
        });
        G_SELECT[_this.urlPath] = SORT.ARRAY_OBJECT( G_SELECT[_this.urlPath],"value",{sortType:"asc"}); 
    }
}
class Table {
    constructor(x){
        this.id = x.id;
        this.urlPath = x.urlPath;
        this.perColumnSearch = x.perColumnSearch;
        this.url = x.url || `${x.urlPath}/${CLIENT.id}/${USER.username}/all`;
        this.goto = x.goto;
        this.initializeCallback = x.initializeCallback;
        
        this.dataTableOptions = {
            language: { search: '', searchPlaceholder: "Search", sLengthMenu: "_MENU_" },
            responsive: true
        };
        this.dataTableOptions = $.extend(this.dataTableOptions,x.dataTableOptions);

        this._skip = 0;
    }

    get skip(){ return this._skip; }
    set skip(val){ this._skip = val; }

    get filter(){ return this._filter || {}; }
    set filter(val){ this._filter = val; }

    get progressBar(){ return this._progressBar; }
    set progressBar(val){ this._progressBar = val; }

    setButtons(x){ 
        const _this = this;

        var goto = _this.goto,
            pageButtons = PAGE_FUNCTIONALITIES[goto].buttons.table || [],
            dt_buttons = x.dt_buttons || [],
            loadView = x.loadView || [],
            dispatcherCondition = (autorizationLevel.dispatcher()) ? ((!USER.dc)?false:true) : true,
            actions = x.actions || {};
            
        var details = {
            create: {
                tooltipTitle: "Create New Record",
                text: "Create",
                class: "create-btn", 
                icon: "la-plus"
            },
            import: {
                tooltipTitle: "Import Batch File",
                text: "Import",
                class: "import-btn", 
                icon: "la-file-upload"
            },
            refresh: {
                tooltipTitle: "Refresh Table",
                icon: "la-refresh"
            },
            filter: {
                tooltipTitle: "Filter",
                icon: "la-filter"
            },
            export: {
                tooltipTitle: "Export Options",
                icon: "la-file-export"
            },
            report: {
                tooltipTitle: "Generate Report",
                icon: "la-download"
            },
            column: {
                tooltipTitle: "Customize Display Options",
                icon: "la-columns"
            },
            search: {
                tooltipTitle: "Search Table",
                icon: "la-search"
            },
            clone: {
                tooltipTitle: "Clone Data from Production",
                icon: "la-copy"
            },
            data_maintenance: {
                tooltipTitle: "Data Maintenance",
                text: "Data Maintenance",
                class: "data_maintenance-btn",
                icon: "la-tasks"
            },
        };
        function addToDtButtons(val){
            var button = details[val];
            var condClass = (dispatcherCondition == null || dispatcherCondition == true) ? "" : "dispatcherCondition";
            var icon = (loadView.includes(val)) ? "la-spin la-spinner" : button.icon;
            var className = (dt_buttons.length == 0) ? "ml-1" : "";
            className += (loadView.includes(val)) ? " disabled" : "";

            dt_buttons.push({
                text: `<i class="la ${icon}" data-toggle="tooltip" title="${button.tooltipTitle}"></i> ${button.text||""}`,
                className: `${button.class||""} ${className} ${condClass}`,
                action: function ( e, dt, node, config ) {
                    if (typeof actions[val] === 'function') { actions[val](); }
                },
            });
        }
        pageButtons.forEach(val => {
            if(["create","import"].includes(val)){
                if(PERMISSION[goto].create != "none"){
                    addToDtButtons(val);
                }
            } else {
                addToDtButtons(val);
            }
        });
        _this.dataTableOptions.buttons = dt_buttons;
    }
    initialize(){
        const _this = this;

        LIST[this.urlPath] = LIST[this.urlPath] || [];

        if ($.fn.DataTable.isDataTable(this.id) ) {
            $(_this.id).DataTable().clear().destroy();
        } else {
            PAGE.DISPLAY();
        }

        $(`.dt-button .la-refresh`).addClass("la-spin disabled");
        $(`.dt-button .la-refresh`).parents(".dt-button").addClass("disabled");
        $(`.cb-container .la-refresh`).addClass("la-spin disabled");
        
        this.dt = $(this.id).DataTable(this.dataTableOptions);

        if(ISMOBILE){
            $(`.dt-buttons`).addClass("d-inline-block");
            $(`.dataTables_wrapper`).css("text-align","center");
            $(`.table.dataTable`).css("text-align","unset");
        }

        $(_this.id).on('page.dt length.dt draw.dt order.dt', function () {
            PAGE.TOOLTIP();
            TABLE.FINISH_LOADING.START_CHECK();
            // TABLE.FINISH_LOADING.UPDATE(); // will make button enabled even if not yet done loading

            $(`${_this.id} thead tr th`).each((i,el) => {
                if(!$(el).is(":visible")){
                    $(`${_this.id} tr:not(.child)`).each((i1,el1) => {
                        $(el1).find("td").eq(i).hide();
                    });
                }
            });
        });

        $(`.dt-button [data-toggle="tooltip"]`).each((i,el) => {
            var title = $(el).attr("data-original-title") || $(el).attr("title");
            $(el).parents(".dt-button").attr({"data-toggle":"tooltip","data-original-title":title});
            $(el).removeAttr("data-toggle data-original-title");
        });
        PAGE.TOOLTIP();

        if(_this.perColumnSearch){
            $(_this.id).find('thead').append('<tr class="row-filter"><th></th><th></th><th></th><th></th><th></th></tr>');
            $(_this.id).find('thead .row-filter th:not(:last-child)').each(function() {
                $(this).html('<input type="text" class="form-control input-sm" placeholder="Search...">');
            });
            $(_this.id).find('.row-filter input').on('keyup change', function() {
                _this.dt.column($(this).parent().index() + ':visible')
                    .search(this.value)
                    .draw();
            });
        }

        $(`.row-filter`).hide();
        TABLE.WATCH({
            urlPath:_this.urlPath,
            rowData:_this.addRow,
            options:function(){TABLE.FINISH_LOADING.START_CHECK();}
        });
        if (typeof this.filterListener === 'function') { this.filterListener(); }


        // always put end of datatable
        if (typeof this.initializeCallback === 'function') { this.initializeCallback(); }
    }
    hideProgressBar(){
        $(`#progress-striped-active .progress-bar`).css("width",`0%`).html(`0%`);
        $("div.tbl-progress-bar").hide();
    }
    retrieveData(length){
        var _this = this;
        if(length == null && _this.progressBar){
            _this.progressBar.reset();
        }
        if(length == null || length == LIMIT){
            var filterExtend = (_this.filter)?`/${JSON.stringify(_this.filter)}`:``;

            $.ajax({
                url: `/api/${_this.url}${filterExtend}/${_this.skip}/${LIMIT}`,
                method: "GET",
                timeout: 90000, // 1 minute and 30 seconds
                headers: {
                    "Authorization": SESSION_TOKEN
                },
                async: true
            }).done(function (docs) {
                // console.log(`${_this.goto}:`,docs);
                if(!docs.error){
                    length = docs.length;

                    _this.display();

                    if(docs.error){
                        toastr.error(docs.error.message);
                    } else {
                        _this.skip += length;
                        
                        if([_this.goto].includes(PAGE.GET())){
                            if (typeof _this.populateRows === 'function') { _this.populateRows(docs); }
                            ($(_this.id).length > 0) ? _this.retrieveData(length) : null;
                        }
                    }
                    TABLE.FINISH_LOADING.START_CHECK();
                }
            });
        } else {
            _this.hideProgressBar();
            _this.display();
        }
    }
    display(){
        if (typeof FILTER.CALLBACK === 'function') { FILTER.CALLBACK(true); }
        $(`#filter-btn`).html("Apply").removeClass("disabled");
        
        $(`.dt-button .la-refresh`).removeClass("la-spin");
        $(`.dt-button .la-refresh`).parents(".dt-button").removeClass("disabled");
        if(FILTER.STATUS == "reset") $(`.cb-container .la-refresh`).removeClass("la-spin");
        else $(`.cb-container .la-refresh`).removeClass("la-spin disabled");

        $(`#filter-container input,#filter-container select`).attr("disabled",false);
        $(`#filter-container button,#filter-container a`).removeClass("disabled");
    }
    watch(){

    }
    populateRows(data){
        const _this = this;
        
        if($(_this.id).length > 0 && data.length > 0){
            // donePopulate = true; - dispatch only
            // $(`#search-btn`).css({"pointer-events":"","color":""});  - dispatch only
            
            var rows = [];
            $.each(data, function(i,val){
                var index = LIST[_this.urlPath].findIndex(x => x._id.toString() == val._id.toString());
                
                (val._row) ? null : val._row = GENERATE.RANDOM(36);
                (index > -1) ? LIST[_this.urlPath][index] = val : LIST[_this.urlPath].push(val);

                rows.push(_this.addRow(val));
            });
            _this.dt.rows.add(rows).draw(false);

            TABLE.FINISH_LOADING.START_CHECK();
            // TABLE.FINISH_LOADING.UPDATE(); // will make button enabled even if not yet done loading

            
            $("div.tbl-progress-bar").show();

            _this.progressBar ? _this.progressBar.calculate() : null;
        }
        
        // initializeOtherSettings();
    }
    updateRows(data){
        const _this = this;
        
        if($(_this.id).length > 0 && data.length > 0){
            $.each(data, function(i,val){
                var rowNode = _this.dt.row(`[_row="${val._row}"]`).node();
                (rowNode) ? _this.dt.row(rowNode).data(_this.addRow(val)) : null;
            });
        }
    }
    countRows(){
        const _this = this;
        $.ajax({
            url: `/api/${_this.urlPath}/${CLIENT.id}/${USER.username}/all/${JSON.stringify(_this.filter)}/count`,
            method: "GET",
            timeout: 90000, // 1 minute and 30 seconds
            headers: {
                "Authorization": SESSION_TOKEN
            },
            async: true
        }).done(function (count) {
            console.log("count",count);

            _this.progressBar = new ProgressBar(count);
            _this.skip = 0;
            LIST[_this.urlPath] = [];
            
            if(_this.dt) { //  && !disableClearTable - dispatch only
                _this.dt.clear().draw();
                $(".dataTables_empty").text("Loading...");
            }
            
            _this.retrieveData();
        });
    }
    preLoadData(){
        
    }
}
/************** END CLASSES **************/

/************** USER INTERFACE **************/
var PROFILE = {
    FUNCTION:{
        init:function(){
            var doc = null,
                myRegions = [],
                myClusters = [],
                myGeofences = [],
                _new_ = false;
            
            PAGE.DISPLAY();

            if(ISMOBILE){
                $(`#dl-btn,#dl-odb-btn,#edit-btn`).parent().addClass("m-2");
                $(`#dl-btn,#dl-odb-btn,#edit-btn`).css("width","100%");
                $(`#dl-btn,#dl-odb-btn`).css("margin-top","20px");
                $(`#edit-btn,#dl-odb-btn`).removeClass("mt-2").addClass("mt-0");
                $(`.panel.panel-profile`).addClass("mb-0");
                $(`.page-box`).addClass("p-0");
                $(`.main-content`).addClass("p-0");
            }

            $.ajax({ 
                url:  `/api/users/${CLIENT.id}/${USER.username}/${USER.username}/incharge`,
                method: "GET", 
                timeout: 90000, 
                headers: {
                    "Authorization": SESSION_TOKEN
                },
                async: true
            }).done(function (docs) {
                doc = docs[0];
                if(doc){
                    USER.fullName = doc.name;
                    USER.email = doc.email;
                    USER.phoneNumber = doc.phoneNumber;
                    TABLE.FINISH_LOADING.START_CHECK();
                }
            });

            var tries = 0;
            $(`#dl-btn`).click(function(){
                $(`#dl-btn,#dl-odb-btn,#edit-btn`).attr("disabled",true);
                $(`#dl-btn i`).removeClass("la-user").addClass("la-spin la-spinner");
                $.ajax({
                    "url": `https://${CLIENT.ggsURL}/comGpsGate/api/v.1/applications/${CLIENT.appId}/users/${USER.username}?Identifier=Username`,
                    "method": "GET",
                    "headers": {
                        "Authorization": USER.apiKey
                    },
                    timeout: 90000,
                    async: true
                }).done(function (docs) {
                    tries = 0;
                    var body = {}
                        name = `${docs.name} ${docs.surname}`._trim();
                    if(name) body.name = name;
                    if(docs.email) body.email = docs.email;
                    if(docs.phoneNumber) body.phoneNumber = docs.phoneNumber;

                    if(Object.keys(body).length > 0){
                        GET.AJAX({
                            url: `/api/users/${CLIENT.id}/${USER.username}/${USER.username}`,
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json; charset=utf-8",
                                "Authorization": SESSION_TOKEN
                            },
                            data: JSON.stringify(body)
                        }, function(docs){
                            $(`#dl-btn,#dl-odb-btn,#edit-btn`).attr("disabled",false);
                            $(`#dl-btn i`).addClass("la-user").removeClass("la-spin la-spinner");
                            toastr.success("Profile updated successfully.");
                        });
                    } else {
                        toastr.warning("You profile in WRU Main is empty. No changes has been made.");
                    }
                }).fail(function(error){
                    if(error.status == 0 && tries < MAX_TRIES){
                        tries++;
                        $(`#dl-btn`).click();
                    }
                    TOASTR.ERROR(error);
                });
            });
            $(`#dl-odb-btn`).click(function(){
                $(`#dl-btn,#dl-odb-btn,#edit-btn`).attr("disabled",true);
                $.ajax({
                    url: `/api/users/${CLIENT.id}/${USER.username}/download/${CLIENT.allowDownloadFromOtherDB.toLowerCase()}`,
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                        "Authorization": SESSION_TOKEN
                    },
                    async: true,
                    data: JSON.stringify({}),
                    timeout: 90000, // 1 minute and 30 seconds
                }).done(function (docs) {
                    $(`#dl-btn,#dl-odb-btn,#edit-btn`).attr("disabled",false);
                    $(`#dl-odb-btn i`).addClass("la-user").removeClass("la-spin la-spinner");
                    toastr.success("Profile updated successfully.");
                });
            });
            $(`#edit-btn`).click(function(){
                var subtitle = `This will only update you profile in WRU Dispatch and not in <u data-toggle="tooltip" title="${CLIENT.ggsURL}">WRU Main</u>.`;
                $(`body`).append(modalViews.user.create("Edit Profile",null,USER,subtitle));

                PAGE.TOOLTIP();
                
                $(`#modal #role,#modal #priv-title`).parent().remove();
                $(`#modal .modal-dialog.modal-md`).removeClass("modal-md").addClass("modal-sm").css({"width":""});
                $(`#modal .modal-body > div`).removeClass("col-sm-5").addClass("col-sm-12");

                GET.INTLTELINPUT("#modal #phoneNumber");

                $(`#modal #submit`).click(function(){
                    var body = {}
                        name = $(`#modal #name`).val()._trim(),
                        email = $(`#modal #email`).val()._trim(),
                        __phoneNumber = $("#modal #phoneNumber").val()._trim(),
                        phoneNumber = GET.INTLTELINPUT_VALUE("#modal #phoneNumber");
                    if(name) body.name = name;
                    if(email) body.email = email;
                    if(__phoneNumber) body.phoneNumber = phoneNumber;

                    if(ALERT.REQUIREDFIELDS("#modal-error",$(this).parents("#overlay"))){}
                    else {
                        $(`#modal #submit`).attr("disabled",true).html(`<i class="la la-spin la-spinner"></i> Submit`);
                        $(`#dl-btn,#dl-odb-btn,#edit-btn`).attr("disabled",true);
                        $.ajax({
                            url: `/api/users/${CLIENT.id}/${USER.username}/${USER.username}`,
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json; charset=utf-8",
                                "Authorization": SESSION_TOKEN
                            },
                            async: true,
                            data: JSON.stringify(body),
                            timeout: 90000, // 1 minute and 30 seconds
                        }).done(function (docs) {
                            toastr.success("Profile updated successfully.");
                            $(`#overlay`).remove();
                            $(`#dl-btn,#dl-odb-btn,#edit-btn`).attr("disabled",false);
                        });
                    }
                });
            });

            
            /******** TABLE CHECK ********/
            TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                isFinishedLoading(["REGIONS","CLUSTERS","GEOFENCES"], true, function(){
                    var obj = (LIST["geofences"]) ? (getGeofence(USER.dc) || {}) : {};
                    $(`[granted_dc]`).html(obj.short_name || "N/A");
                });
                if(doc && !_new_){
                    console.log(doc);
                    _new_ = true;

                    function getLocationsInCharge(obj){
                        function isInCharge(escalation,type){
                            return (obj[`${escalation}_${type}`]||[]).includes(USER.username);
                        }

                        var lq = [], oc = [], ot = [];

                        isInCharge("esc1","lq") ? lq.push("E-1") : null;
                        isInCharge("esc1","oc") ? oc.push("E-1") : null;
                        isInCharge("esc1","ot") ? ot.push("E-1") : null;
                        isInCharge("esc2","lq") ? lq.push("E-2") : null;
                        isInCharge("esc2","oc") ? oc.push("E-2") : null;
                        isInCharge("esc2","ot") ? ot.push("E-2") : null;
                        isInCharge("esc3","lq") ? lq.push("E-3") : null;
                        isInCharge("esc3","oc") ? oc.push("E-3") : null;
                        isInCharge("esc3","ot") ? ot.push("E-3") : null;

                        
                        var text = [];
                        (lq.length > 0) ? text.push(`Long Queueing - ${lq.join(",")}`) : null;
                        (oc.length > 0) ? text.push(`Over CICO - ${oc.join(",")}`) : null;
                        (ot.length > 0) ? text.push(`Over Transit - ${ot.join(",")}`) : null;

                        return text;
                    }
                    doc.myRegions.forEach((val,i) => {
                        myRegions.push(`${val.region || "-"}<div class="font-italic font-11 text-muted mb-1">${getLocationsInCharge(val).join(" | ")}</div>`);
                    });
                    doc.myClusters.forEach((val,i) => {
                        myClusters.push(`${val.cluster || "-"}<div class="font-italic font-11 text-muted mb-1">${getLocationsInCharge(val).join(" | ")}</div>`);
                    });
                    doc.myGeofences.forEach((val,i) => {
                        myGeofences.push(`${val.short_name || "-"}<div class="font-italic font-11 text-muted mb-1">${getLocationsInCharge(val).join(" | ")}</div>`);
                    });
                    $(`[regions]`).html(myRegions.join("") || "-");
                    $(`[clusters]`).html(myClusters.join("") || "-");
                    $(`[geofences]`).html(myGeofences.join("") || "-");
                }
            }
            TABLE.FINISH_LOADING.START_CHECK();
            /******** END TABLE CHECK ********/
        },
    }
};
var SETTINGS = {
    FUNCTION:{
        stream:null,
        init:function(){
            var table = new Table({
                id: "#tbl-sessions",
                urlPath: "sessions",
                goto: "settings",
                dataTableOptions: {
                    columns: CUSTOM.COLUMN.settings,
                    paging: false,
                    order: [[ 1, "desc" ]],
                    createdRow: function (row, data, dataIndex) {
                        var style = (SESSION_TOKEN == data._id)?`background-color: #ebf8f0`:"",
                            _row = data._row;
                        $(row).attr(`_row`, data._row);
                        $(row).attr('style', style);
                        table.rowListeners(_row,data._id);
                    },
                }
            });
            table.addRow = function(obj){
                var isCurrentSession = (obj._id == SESSION_TOKEN),
                    device_info = obj.device_info || {metadata:{}},
                    logout_btn = (isCurrentSession)?"<small><small>CURRENT SESSION</small></small>":`<td><button class="btn btn-danger pl-2 pr-2 pt-1 pb-1" logout><small>Logout</small></button></td>`,
                    icon = (device_info.device == "mobile") ? "la la-mobile" : "la la-desktop";
    
                return {
                    '_id': obj._id,
                    '_row':  obj._row,
                    'Device Info': `<div>
                                        <i style="font-size: 30px;" class="${icon} mr-2"></i>
                                        <div class="d-inline-block">
                                            <div>${device_info.browser}</div>
                                            <small class="text-muted">${device_info.metadata.ip}</small>
                                        </div>
                                    </div>`,
                    'Last Accessed': DATETIME.FORMAT(obj.timestamp,"MM/DD/YYYY hh:mm A"),
                    'Expiry': DATETIME.FORMAT(obj.expiry,"MM/DD/YYYY hh:mm A"),
                    'Location': `${device_info.metadata.city}, ${device_info.metadata.region}, ${device_info.metadata.country}`,
                    'Action': logout_btn,
                };
            };
            table.rowListeners = function(_row,_id){
                const _this = this;
                $(_this.id).on('click', `[_row="${_row}"] [logout],[_row="${_row}"] + tr.child [logout]`,function(e){
                    e.stopImmediatePropagation();
                    var obj = LIST[_this.urlPath].find(x => x._id.toString() == _id.toString());
                    if(obj){
                        MODAL.CONFIRMATION({
                            confirmCloseCondition: true,
                            confirmCallback: function(){
                                $.ajax({ 
                                    url: `/api/sessions/${CLIENT.id}/${USER.username}/${obj._id}`, 
                                    method: "DELETE", 
                                    timeout: 90000,
                                    headers: {
                                        "Authorization": SESSION_TOKEN
                                    },
                                    async: true
                                }).done(function (docs) {
                                    if(docs.ok == 1){
                                        $(`#confirm-modal`).remove();
                                        $(_this.id).DataTable().row(`[_row="${_row}"]`).remove().draw(false);
                                    }
                                });
                            }
                        });
                    }
                });
            };
            table.filterListener = function(_row,_id){
                // push_notification
                var default_push_notification = USER.settings.push_notification || "toast";

                $(`[name="push_notification"][value="${default_push_notification}"]`).prop("checked",true);

                $(`[name="push_notification"]`).change(function(){
                    var push_notification = $(this).val();
                    var element = $(this);

                    console.log("push_notification",push_notification);
                    if(push_notification == "desktop"){
                        try {
                            Notification.requestPermission().then(function(result) {
                                console.log(result);
                                if(result == "granted"){
                                    updateSettings();
                                } else {
                                    alert("Push notification request was denied. Please enable them in your browser if you've changed your mind.");
                                    $(`[name="push_notification"][value="${default_push_notification}"]`).prop("checked",true);
                                }
                            });
                        } catch(error){}
                    } else {
                        updateSettings();
                    }
                    function updateSettings(){
                        $(element).parent().parent().append(`<i class="ml-2 la la-spin la-spinner"></i>`);
                        $(`[name="push_notification"]`).parents(".fancy-radio").css({"pointer-events":"none","color":"#c4c4c4"});

                        GET.AJAX({
                            url: `api/users/${CLIENT.id}/${USER.username}/${USER.username}`,
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json; charset=utf-8",
                                "Authorization": SESSION_TOKEN
                            },
                            data: JSON.stringify({"settings.push_notification":push_notification})
                        }, function(docs){
                            toastr.success("Push notification settings updated successfully.",null,{timeOut: 1500});
                            console.log("Update Settings push_notification: ",docs);
                            $(`[name="push_notification"]`).parents(".fancy-radio").find(".la-spinner").remove();
                            $(`[name="push_notification"]`).parents(".fancy-radio").css({"pointer-events":"unset","color":"unset"});
                        }, function(error){
                            console.log("error",error);
                        });
                    }
                });

                $(`#toast-test`).click(function(){
                    
                    var sound = document.getElementById("audio01");
                    sound.play();

                    var redDot = `<span style="background-color:red; display:inline-block;border-radius:20px; width:7px;height:7px;margin-right:4px;"></span>`;
                    toastr.error(`${redDot}<b>00000000</b> | Escalation 1<br>Running CICO Duration: 04:35`,"",{
                        positionClass: "toast-bottom-right toastr-white-bg",
                        showDuration: "300",
                        closeButton: true,
                        hideDuration: "1000",
                        timeOut: "20000",
                    });
                });

                $(`#desktop-test`).click(function(){
                    try {
                        Notification.requestPermission().then(function(result) {
                            console.log(result);
                            if(result == "granted"){
                                var sound = document.getElementById("audio01");
                                sound.play();
                                new Notification(`00000000 | Escalation 1`, { body: `Running CICO Duration: 04:35` });
                            } else {
                                alert("Push notification request was denied. Please enable them in your browser if you've changed your mind.");
                            }
                        });
                    } catch(error){}
                });

                // end push_notification
            };
            table.initialize();
            table.countRows();
        }
    }
};
var DASHBOARD = {
    FUNCTION: {
        init:function(){
            USER.filters.dashboard = USER.filters.dashboard || {};
            
            try {
                USER.filters.dashboard = JSON.parse(USER.filters.dashboard);
            } catch(error) {}

            PAGE.DISPLAY();

            if(Object.keys(USER.filters.dashboard).length > 0){
                $(`#reset-btn`).show();
            }
            $(`#reset-btn`).click(function(){
                saveFilter({});
            });

            if(ISMOBILE){
                $(`.panel.panel-profile`).addClass("mb-0");
                $(`.main-content`).addClass("p-0");
                $(`#dashboard-page`).css({"padding":"15px","padding-bottom":"0px","margin-top":"50px"});
                $(`.summary-parent`).parent().addClass("p-1");
                $(`.summary-parent`).parent().next().addClass("p-1");
                $(`.summary-parent`).removeClass("mr-1").addClass("mr-0");
                $(`#_date`).parents(".col-sm-12").addClass("pl-1 pr-1");
                $(`#_date`).parents(".col-sm-12").find("span.float-right").css({width:"49.5%","max-width":"unset"});
                $(`#_regions`).addClass("nav-tabs-mobile");
                $(`#_regions`).parent().removeClass().addClass("col-sm-12 p-0");
                $(`.switch-toggle`).parent().css("width","49.5%");
                $(`.switch-toggle`).css("height","34px");
                $(`.switch-toggle > label`).css("line-height","34px");
                $(`#_site`).parent().removeAttr("style").css({position:"fixed",top:"69px",width:"100%",background:"white","box-shadow":"0 4px 8px -4px #c6c6c6",height:"28px"});
                $(`#_site`).css("width","100%");
            }
            console.log("CUSTOM.COLUMN.dispatch()",CUSTOM.COLUMN.dispatch())

            var table_id = "#tbl-dashboard",
                urlPath1 = "dashboard",
                urlPath = "dispatch",
                done = false,
                _new_ = {},
                newlyLoaded = true,
                filter = USER.filters.dashboard.region || "ALL",
                _siteFilter = USER.filters.dashboard.baseplant || "",
                selectedDate = USER.filters.dashboard.selectedDate || new Date(),
                currentView = USER.filters.dashboard.currentView || "destination",
                summary = null,
                columnIndexes = {},
                resetSummaryData = function(){
                    summary = {
                        in_transit: 0,
                        total_shipment: 0,
                        incomplete: 0,
                        scheduled: 0,
                        assigned: 0,
                        queueingAtOrigin: 0,
                        processingAtOrigin: 0,
                        onSite: 0,
                        returning: 0,
                        complete: 0,
                    }; 
                },
                dt = $(table_id).DataTable({
                    columns: TABLE.COL_ROW(CUSTOM.COLUMN.dashboard()).column,
                    order: [[ 1, "asc" ]],
                    dom: 't',
                    pageLength: 1000,
                    scrollX: true,
                    scrollY: "calc(100vh - 340px)",
                    paging: false,
                    createdRow: function (row, data, dataIndex) {
                        var _row = data._row;
                        $(row).attr(`_row`, _row);

                        function miniDTListener(columnTitle,status){
                            var columnIndex = columnIndexes[columnTitle] || -1;
                            if(columnIndex >= 0){
                                $($(row).find("td").eq(columnIndex)).click(function(){ addDataToDT({status, el:this}); });
                            }
                        }
                        
                        miniDTListener("In Transit",["in_transit"]);
                        miniDTListener("Total Shipment",null);
                        miniDTListener("Incomplete",["incomplete"]);
                        miniDTListener("Scheduled",["scheduled"]);
                        miniDTListener("Assigned",["assigned"]);
                        miniDTListener("Queueing",["queueingAtOrigin"]);
                        miniDTListener("Processing",["processingAtOrigin"]);
                        miniDTListener("On-Site",["onSite"]);
                        miniDTListener("Returning",["returning"]);
                        miniDTListener("Complete",["complete"]);

                        // Within CICO Time
                        // $($(row).find("td").eq(8)).click(function(){ addDataToDT({status: null, el:this, w_in_cico:true}); });
                    },
                }),
                random = GENERATE.RANDOM(36),
                populatePage = function(_r_){
                    resetSummaryData();
                    done = false;
                    $(`#icon-date`).removeClass("la-calendar").addClass("la-spin la-spinner");
                    $(`#_regions`).css("pointer-events","none");
                    $(`[name="view-d"]`).attr("disabled",true);
                    $(`.switch-toggle`).css("opacity","0.7");
                    LIST[urlPath1] = {};
                    LIST[urlPath] = [];
                    
                    if(random != _r_){
                        random = _r_;
                    }

                    $(`#dashboard-page .summary-container b`).html(`<i class="la la-spin la-spinner" style="opacity: 0.3;"></i>`);
                    $(`#_date`).attr("disabled",true);
                    if(dt) {
                        dt.clear().draw();
                        $(".dataTables_empty").text("Loading...");
                    }

                    var skip = 0,
                        errorTries = 0,
                        getData = function(length){
                            if(length == null || length == LIMIT){
                                // , status:{$ne:"plan"} - plan is still counted in TOTAL SHIPMENT
                                var  dateFilter = FILTER.DATERANGE(DATETIME.FORMAT(new Date(selectedDate),"MM/DD/YYYY")),
                                    _filter = {posting_date: dateFilter};
                                if(clientCustom.filterType.dashboard == "postingDate-scheduledDate"){
                                    if(moment(selectedDate).format("MM/DD/YYYY") == DEFAULT_DATE){
                                        _filter = {
                                            $or: [
                                                {  
                                                    $and: [
                                                        {
                                                            posting_date: dateFilter
                                                        },
                                                        {
                                                            $or: [
                                                                {
                                                                    scheduled_date: {
                                                                        $exists: false
                                                                    }
                                                                },
                                                                {
                                                                    scheduled_date: dateFilter
                                                                }
                                                            ]
                                                            
                                                        },
                                                        {
                                                            status: {$nin:["plan"]}
                                                        }
                                                    ]
                                                },
                                                {
                                                    $and: [
                                                        {
                                                            scheduled_date: dateFilter
                                                        },
                                                        {
                                                            status: {$nin:["plan"]}
                                                        }
                                                    ]
                                                },
                                                {
                                                    $and: [
                                                        {
                                                            scheduled_date: {
                                                                $gte: dateFilter.$lt,
                                                                $lt: dateFilter.$gte,
                                                            }
                                                        },
                                                        {
                                                            posting_date: {
                                                                $gte: dateFilter.$lt,
                                                                $lt: dateFilter.$gte,
                                                            }
                                                        },
                                                        {
                                                            status: {$nin:["plan","complete","incomplete"]}
                                                        }
                                                    ]
                                                }
                                            ],
                                        };
                                    } else {
                                        _filter = {
                                            $or: [
                                                {  
                                                    $and: [
                                                        {
                                                            posting_date: dateFilter
                                                        },
                                                        {
                                                            $or: [
                                                                {
                                                                    scheduled_date: {
                                                                        $exists: false
                                                                    }
                                                                },
                                                                {
                                                                    scheduled_date: dateFilter
                                                                }
                                                            ]
                                                            
                                                        },
                                                        {
                                                            status: {$nin:["plan"]}
                                                        }
                                                    ]
                                                },
                                                {
                                                    $and: [
                                                        {
                                                            scheduled_date: dateFilter
                                                        },
                                                        {
                                                            status: {$nin:["plan"]}
                                                        }
                                                    ]
                                                },
                                            ],
                                        };
                                    }
                                }
                                GET.AJAX({
                                    url: `api/${urlPath}/${CLIENT.id}/${USER.username}/all/${JSON.stringify(_filter)}/${skip}/${LIMIT}`,
                                    method: "GET",
                                    headers: {
                                        "Authorization": SESSION_TOKEN
                                    },
                                }, function(docs){
                                    console.log("Dashboard",docs);
                                    if(random == _r_){
                                        if(!docs.error){
                                            length = docs.length;

                                            if (typeof DASHBOARD.FUNCTION.addDataToTable === 'function') { docs = DASHBOARD.FUNCTION.addDataToTable(docs); }
                                            
                                            // ADD _ROW
                                            LIST[urlPath] = LIST[urlPath].concat(docs); // always put after loop. Adding other docs inside loop
                                            $(`#_regions`).css("pointer-events","unset");
                                            skip+=length;
                                            getData(length);
                                            
                                            _new_.GEOFENCES = false;
                                            TABLE.FINISH_LOADING.START_CHECK();
                                        } else {
                                            if(errorTries < 5){
                                                errorTries++;
                                                getData(length);
                                            } else {

                                            }
                                        }
                                    }
                                }, function(error){
                                    console.log("error",error);
                                    if(errorTries < 5){
                                        errorTries++;
                                        getData(length);
                                    } else {

                                    }
                                });
                            
                            } else {
                                $(`#dashboard-page [in_transit]`).html(summary.in_transit);
                                $(`#dashboard-page [total_shipment]`).html(summary.total_shipment);
                                $(`#dashboard-page [incomplete]`).html(summary.incomplete);
                                $(`#dashboard-page [scheduled]`).html(summary.scheduled);
                                $(`#dashboard-page [assigned]`).html(summary.assigned);
                                $(`#dashboard-page [queueingAtOrigin]`).html(summary.queueingAtOrigin);
                                $(`#dashboard-page [processingAtOrigin]`).html(summary.processingAtOrigin);
                                $(`#dashboard-page [onSite]`).html(summary.onSite);
                                $(`#dashboard-page [returning]`).html(summary.returning);
                                $(`#dashboard-page [complete]`).html(summary.complete);

                                $(`#_date`).attr("disabled",false);
                                $(`#icon-date`).removeClass("la-spin la-spinner").addClass("la-calendar");
                                $(`[name="view-d"]`).attr("disabled",false);
                                $(`.switch-toggle`).css("opacity","1");
                                // countdown(5);
                                done = true;
                                
                                if(done && _new_.REGIONS  && _new_.GEOFENCES){
                                    loadFilter();
                                }
                            }
                        };

                    getData();
                },
                populateWithGeofence = function(){
                    resetSummaryData();

                    Object.keys(LIST[urlPath1]).forEach(key => {
                        var oldData =  JSON.stringify(LIST[urlPath1][key]);

                        LIST[urlPath1][key].w_in_cico = 0;
                        var location_id = LIST[urlPath1][key].location_id;
                        var geofence = getGeofence(location_id);
                        if(geofence){
                            // console.log(filter,geofence.region_id,(filter == "ALL" || filter.toString() == geofence.region_id.toString()))
                            // do not merge condition. it removes the data from table. (check else statement)
                            if(filter == "ALL" || filter.toString() == geofence.region_id.toString()){
                                LIST[urlPath1][key].plant = geofence.short_name;
                                LIST[urlPath1][key].region_id = geofence.region_id;
                                
                                updateTableAndSummary(key, (oldData != JSON.stringify(LIST[urlPath1][key])));
                            }
                        } else {
                            console.log("NONE",location_id)
                            LIST[urlPath1][key].plant = "-";
                            updateTableAndSummary(key, (oldData != JSON.stringify(LIST[urlPath1][key])));
                            // dt.row(`[_row="${LIST[urlPath1][key]._row}"]`).remove().draw(false);
                        }
                    });
                    console.log("summary",summary);
                },
                saveFilter = function(setFilter){
                    if(!newlyLoaded){
                        var __filter__ = {};
                        if(new Date(selectedDate).toDateString() != new Date().toDateString()) __filter__.selectedDate = selectedDate;
                        if(filter != "ALL") __filter__.region = filter;
                        if(_siteFilter != "") __filter__.baseplant = _siteFilter;
                        if(currentView != "destination") __filter__.currentView = currentView;
                        
                        USER.filters.dashboard = setFilter || __filter__;
                        GET.AJAX({
                            url: `/api/users/${CLIENT.id}/${USER.username}/${USER.username}`,
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json; charset=utf-8",
                                "Authorization": SESSION_TOKEN
                            },
                            data: JSON.stringify({"filter.dashboard":JSON.stringify(USER.filters.dashboard)})
                        }, function(docs){
                            if(setFilter){
                                PAGE.GO_TO();
                            }
                            console.log("docs",docs);
                        });    
                    }
                },
                loadFilter = function(){
                    if(Object.keys(USER.filters.dashboard).length > 0){
                        $(`#reset-btn`).attr("style","text-decoration: underline;");
                    }
                    $(`#_regions #${filter}`).trigger("click");
                    $(`#_site`).val(_siteFilter).trigger("change");
                    newlyLoaded = false;
                },
                setColumnIndexes = function(){
                    dt.columns().every( function () {
                        columnIndexes[this.header().textContent._trim()] = this.index()-1;
                    });
                },
                addDataToDT = function(x){
                    var modal_parent_id = (ISMOBILE) ? "#mini-monitor-container" : "#tbl-mini-monitor",
                        _dt = null,
                        initializeModalDT = function(){
                            _dt =  $(modal_parent_id).DataTable({
                                columns: CUSTOM.COLUMN.dispatch(),
                                dom: 'lBfrtip',
                                language: { search: '', searchPlaceholder: "Search", sLengthMenu: "_MENU_" },
                                buttons: TABLE.BUTTONS({
                                    goto: PAGE.GET(),
                                    actions:{
                                        column: function(){
                                            $(`#cv-container`).toggle("slide", {direction:'right'},100);
                                        }
                                    }
                                }),
                                order: [[ 19, "desc" ]],
                                createdRow: function (row, data, dataIndex) {
                                    var _row = data._row,
                                        _id = data._id;
                                    $(row).attr(`_row`, _row);
                                    
                                    TABLE.ROW_LISTENER({table_id: modal_parent_id,_row,urlPath:urlPath,_id,
                                        additionalListeners: function(){
                                            $(modal_parent_id).on('click', `[_row="${_row}"] [view],[_row="${_row}"] + tr.child [view]`,function(e){
                                                e.stopImmediatePropagation();
                                                $(`body`).append(modalViews.dispatch.fullView(_id));
                                                $("html, body,#modal").animate({ scrollTop: 0 }, "fast");
                                            });
                                        }
                                    });
                                },
                            });

                            $(`#overlay`).append(SLIDER.COLUMN_VISIBILITY(CUSTOM.COLUMN.dispatch()));
                            $(`#cv-container`).css({"top":"0px","height":"100%"});
                            $('span.toggle-vis').on( 'click', function (e) {
                                var index = $(this).attr('data-column'),
                                    column = _dt.column(index);

                                column.visible( ! column.visible() );
                                CUSTOM.COLUMN.dispatch()[index].visible = column.visible();
                                CUSTOM.COLUMN.dispatch()[index].bVisible = column.visible();
                                $(modal_parent_id).attr("style","");

                                $(`${modal_parent_id} thead tr th`).each((i,el) => {
                                    if(!$(el).is(":visible")){
                                        $(`${modal_parent_id} tr:not(.child)`).each((i1,el1) => {
                                            $(el1).find("td").eq(i).hide();
                                        });
                                    }
                                });
                            });
                            
                            $(modal_parent_id).on('page.dt length.dt draw.dt', function () {
                                $(`${modal_parent_id} thead tr th`).each((i,el) => {
                                    if(!$(el).is(":visible")){
                                        $(`${modal_parent_id} tr:not(.child)`).each((i1,el1) => {
                                            $(el1).find("td").eq(i).hide();
                                        });
                                    }
                                });
                            });
                        };
                    if(done === true){
                        var _rows = [];
                        var _obj_ = Object.keys(LIST[urlPath1]).filter(key => LIST[urlPath1][key]._row == $(x.el).parent().attr("_row")).map(key => LIST[urlPath1][key])[0] || {};
                        console.log("_obj_",_obj_)
                        var location_id = _obj_.location_id;
                        var geofence = getGeofence(location_id) || {cico:0};
                        var addtnlTitle = (x.w_in_cico) ? `<h5 class="mt-1 mb-0 text-muted font-lighter">In CICO Time</h5>` : "";
                        var statusFunction = function(){
                            var arr = [];
                            x.status.forEach(val => {
                                arr.push(GET.STATUS(val).text.capitalize());
                            });
                            return arr.join(", ");
                        };
                        var titleStatus = (x.title) ? x.title : ((x.status) ? statusFunction() : "All Status");

                        $(`body`).append(MODAL.MINI_MONITOR({title:`<h3 class="mb-0 mt-0 font-lighter">${_obj_.plant}</h3><h5 class="mt-1 mb-0 text-muted font-lighter">${titleStatus.capitalize()}</h5>${addtnlTitle}`}));
                        if(!ISMOBILE){
                            initializeModalDT();
                        }
                        LIST[urlPath].forEach((obj,i) => {
                            obj.destination[0] = obj.destination[0] || {};
                            var otherCondition = (x.w_in_cico) ? ((obj.actual_time_lapse <= geofence.cico) ? true : false) : true,
                                key = (currentView == "destination") ? obj.destination[0].location_id : obj.origin_id;

                            // console.log(x.status,obj._id,obj.status,key==location_id,otherCondition,((!x.status || x.status.includes(obj.status)) && key == location_id && otherCondition))
                            if((!x.status || x.status.includes(obj.status)) && key == location_id && otherCondition){
                                var de = new Dispatch(obj,null,true);

                                if(ISMOBILE){
                                    $(modal_parent_id).append(de.html());

                                    $(`[_row="${obj._row}"] > .container-header`).click(function(){
                                        var el = $(this).parent(),
                                            index = LIST[urlPath].findIndex(x => x._row == $(el).attr("_row")),
                                            obj = LIST[urlPath][index] || {},
                                            removeActive = function(_el){
                                                $(_el).removeClass("active");
                                                $(_el).find(".container-body").slideUp(100,null,function(){
                                                    $(_el).find(".container-header-body").slideDown(50);
                                                });
                                                $(_el).find(".la-angle-up").hide();
                                                $(_el).find(".container-header-title .ongoing").css("opacity",1);
                                                $(_el).find(".container-header-title > [status]").remove();
                                            };
                                        if($(el).hasClass("active")){
                                            removeActive(el);
                                        } else {
                                            $(`.container-parent`).each((i,el1) => { removeActive(el1); });
                                            $(el).addClass("active");
                                            $(el).find(".container-body").slideDown(100,null,function(){
                                                $(el).find(".container-header-body").slideUp(50);
                                                $(el).find(".la-angle-up").slideDown(50);
                                            });
                                            $(el).find(".container-header-title .ongoing").css("opacity",0);
                                            $(el).find(".container-header-title").append(`<span status> - ${obj.status.capitalize()}</span>`);
                                        }
                                    });    
                                } else {
                                    _rows.push(de.row());
                                }
                            }
                        });
                        if(!ISMOBILE){
                            _dt.rows.add(_rows).draw(false);
                        }
                    } else {
                        toastr.info("Please wait while data is loading.");
                    }
                };
            setColumnIndexes();
            $(`[name="view-d"][value="${currentView}"]`).prop("checked",true);

            
            TABLE.WATCH({urlPath});

            function updateTableAndSummary(key,condition){
                if(_siteFilter == LIST[urlPath1][key].plant || !_siteFilter){
                    var scheduledCount = LIST[urlPath1][key].scheduled,
                        queueingCount = LIST[urlPath1][key].queueingAtOrigin,
                        processingCount = LIST[urlPath1][key].processingAtOrigin,
                        onSiteCount = LIST[urlPath1][key].onSite,
                        returningCount = LIST[urlPath1][key].returning,
                        complete = LIST[urlPath1][key].complete,
                        _data = {
                            '_row': LIST[urlPath1][key]._row,
                            'Region':  LIST[urlPath1][key].region_id || "-",
                            'Plant':  LIST[urlPath1][key].plant || `<small class="font-italic text-muted">loading...</small>`,
                            'In Transit': LIST[urlPath1][key].in_transit,
                            'Total Shipment': LIST[urlPath1][key].total_shipment,
                            'Incomplete': LIST[urlPath1][key].incomplete,
                            'Scheduled': scheduledCount,
                            'Assigned': LIST[urlPath1][key].assigned,
                            'Queueing': queueingCount,
                            'Processing': processingCount,
                            'On-Site': onSiteCount,
                            'Returning': returningCount,
                            'Complete': complete,
                        },
                        htmlRow = $(`[_row="${LIST[urlPath1][key]._row}"]`).length,
                        rowNode = dt.row(`[_row="${LIST[urlPath1][key]._row}"]`).node();
                        
                    if (condition == null || condition == true) (rowNode) ? dt.row(rowNode).data(_data).draw(false) : dt.row.add(_data).draw(false);

                    // console.log(condition,LIST[urlPath1][key]);
                    summary.in_transit += LIST[urlPath1][key].in_transit;
                    summary.total_shipment += LIST[urlPath1][key].total_shipment;
                    summary.incomplete += LIST[urlPath1][key].incomplete;
                    summary.scheduled += LIST[urlPath1][key].scheduled;
                    summary.assigned += LIST[urlPath1][key].assigned;
                    summary.queueingAtOrigin += LIST[urlPath1][key].queueingAtOrigin;
                    summary.processingAtOrigin += LIST[urlPath1][key].processingAtOrigin;
                    summary.onSite += LIST[urlPath1][key].onSite;
                    summary.returning += LIST[urlPath1][key].returning;
                    summary.complete += LIST[urlPath1][key].complete;
                }
                
                $(`#dashboard-page [in_transit]`).html(summary.in_transit);
                $(`#dashboard-page [total_shipment]`).html(summary.total_shipment);
                $(`#dashboard-page [incomplete]`).html(summary.incomplete);
                $(`#dashboard-page [scheduled]`).html(summary.scheduled);
                $(`#dashboard-page [assigned]`).html(summary.assigned);
                $(`#dashboard-page [queueingAtOrigin]`).html(summary.queueingAtOrigin);
                $(`#dashboard-page [processingAtOrigin]`).html(summary.processingAtOrigin);
                $(`#dashboard-page [onSite]`).html(summary.onSite);
                $(`#dashboard-page [returning]`).html(summary.returning);
                $(`#dashboard-page [complete]`).html(summary.complete);
            }
            
            DASHBOARD.FUNCTION.addDataToTable = function(data,fetched,deletedObj){
                if(data){
                    if(data.length > 0){
                        data.forEach((val,i) => {
                            if(new Date(val.posting_date).setHours(0,0,0,0) == new Date(selectedDate).setHours(0,0,0,0) || 
                                new Date(val.scheduled_date).setHours(0,0,0,0) == new Date(selectedDate).setHours(0,0,0,0) || 
                                ["scheduled","assigned","queueingAtOrigin","processingAtOrigin","idlingAtOrigin","in_transit","onSite","returning"].includes(val.status)) {
                                var destination = val.destination[0] || {},
                                    key = (currentView == "destination") ? destination.location_id : val.origin_id,
                                    oldData = (LIST[urlPath1][key]) ? LIST[urlPath1][key].data[val._id] : null;
                                if(key){
                                    (data[i]._row) ? null : data[i]._row = GENERATE.RANDOM(36);
            
                                    if(LIST[urlPath1][key]){
                                        if(oldData){
                                            LIST[urlPath1][key][oldData.status] --;
                                        } else {
                                            (val.status != "plan") ? LIST[urlPath1][key].total_shipment ++ : null;
                                        }
                                    } else {
                                        LIST[urlPath1][key] = {
                                            _row: GENERATE.RANDOM(36),
                                            // _id: val._id,
                                            // plant: val.destination[0].location_id,
                                            location_id: key,
                                            destination_id: destination.location_id,
                                            in_transit: 0,
                                            total_shipment: 0,
                                            incomplete: 0,
                                            scheduled: 0,
                                            assigned: 0,
                                            queueingAtOrigin: 0,
                                            processingAtOrigin: 0,
                                            onSite: 0,
                                            returning: 0,
                                            complete: 0,
                                            data: {}
                                        };
                                        (val.status != "plan") ? LIST[urlPath1][key].total_shipment ++ : null;
                                    }
                                    LIST[urlPath1][key].data[val._id] = {status:val.status};
                                    if(LIST[urlPath1][key][val.status] != null){
                                        LIST[urlPath1][key][val.status] ++;
                                    }
                                }
                            }
                        });
    
                        resetSummaryData();
                        
                        Object.keys(LIST[urlPath1]).forEach(key => { updateTableAndSummary(key); });
                    } 
                } else {
                    var destination = deletedObj.destination[0] || {},
                        key = (currentView == "destination") ? destination.location_id : deletedObj.origin_id,
                        oldData = (LIST[urlPath1][key]) ? LIST[urlPath1][key].data[deletedObj._id] : null;
                    if(oldData){
                        LIST[urlPath1][key][oldData.status] --;
                        delete LIST[urlPath1][key].data[deletedObj._id];
                    }
                    LIST[urlPath1][key].total_shipment --;
                    resetSummaryData();

                    if(LIST[urlPath1][key].total_shipment === 0){
                        $(`#dashboard-page [in_transit]`).html(summary.in_transit);
                        $(`#dashboard-page [total_shipment]`).html(summary.total_shipment);
                        $(`#dashboard-page [incomplete]`).html(summary.incomplete);
                        $(`#dashboard-page [scheduled]`).html(summary.scheduled);
                        $(`#dashboard-page [assigned]`).html(summary.assigned);
                        $(`#dashboard-page [queueingAtOrigin]`).html(summary.queueingAtOrigin);
                        $(`#dashboard-page [processingAtOrigin]`).html(summary.processingAtOrigin);
                        $(`#dashboard-page [onSite]`).html(summary.onSite);
                        $(`#dashboard-page [returning]`).html(summary.returning);
                        $(`#dashboard-page [complete]`).html(summary.complete);
                        dt.row(`[_row="${LIST[urlPath1][key]._row}"]`).remove().draw(false);

                        delete LIST[urlPath1][key];
                    }
                        
                    Object.keys(LIST[urlPath1]).forEach(key => { updateTableAndSummary(key); });
                }

                if(fetched === false){
                    _new_.GEOFENCES = false;
                    TABLE.FINISH_LOADING.START_CHECK();
                }
                return data;
            };
                
            PAGE.TOOLTIP(); // add after dt is initialized

            populatePage(random);

            /******** EVENT LISTENER ********/
            $(`#_date`).daterangepicker({
                opens: 'left',
                singleDatePicker:true,
                autoUpdateInput: false,
                maxDate: new Date(),
                startDate: DATETIME.FORMAT(new Date(selectedDate),"MM/DD/YYYY")
            }, function(start, end, label) {
                $($(this)["0"].element).val(DATETIME.FORMAT(new Date(start),"MM/DD/YYYY"));
                selectedDate = new Date(start);
                saveFilter();
                populatePage(GENERATE.RANDOM(36));
            }).val(DATETIME.FORMAT(new Date(selectedDate),"MM/DD/YYYY"));  
            
            $(`[name="view-d"]`).change(function(){
                currentView = $(`[name="view-d"]:checked`).val();
                saveFilter();
                populatePage(GENERATE.RANDOM(36));
            });
            /******** END EVENT LISTENER ********/

            /******** TABLE CHECK ********/
            var loadFilterGeofence = false;
            TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                if(GGS.STATUS.GEOFENCES && _new_.GEOFENCES === false){ // must include "false"
                    _new_.GEOFENCES = true;
                    populateWithGeofence();
                    if(done && _new_.REGIONS  && _new_.GEOFENCES && !loadFilterGeofence){
                        loadFilterGeofence = true;
                        loadFilter();
                    }
                }
                if(GGS.STATUS.REGIONS && !_new_.REGIONS){
                    _new_.REGIONS = true;
                    var _regionData = SORT.ARRAY_OBJECT(LIST["regions"],"sequence",{sortType:"asc"});
                    $(`#_regions`).append(`<li class="active"><a id="ALL" class="summary-tab" href="javascript:void(0)" role="tab" data-toggle="tab">ALL</a></li>`);
                    _regionData.forEach(val => {
                        $(`#_regions`).append(`<li><a id="${val._id}" class="summary-tab" href="javascript:void(0)" role="tab" data-toggle="tab">${val.region}</a></li>`);
                    });
                    $(`.summary-tab`).css({"border-radius":"2px","margin-bottom":"3px"});
                    $(`#_regions [role="tab"]`).click(function(){
                        filter = $(this).attr("id");
                        
                        var _filter = (filter == "ALL") ? "" : filter,
                            TBL = $(table_id).DataTable();
                        console.log(filter,_filter,_siteFilter);
                        // $(table_id).DataTable().search(`${_filter} ${_siteFilter}`).draw();
                        TBL.column(0).search(_filter).draw();
                        TBL.column(1).search(_siteFilter,true,false).draw();

                        saveFilter();
                        populateWithGeofence();

                    });
                    $(`#_site`).show().select2({placeholder: "Choose Site (Base Plant)",allowClear: true}).val("").change(function(){
                        _siteFilter = $(this).val() || "";
                        
                        var _filter = (filter == "ALL") ? "" : filter,
                            TBL = $(table_id).DataTable();
                        // console.log(filter,_filter,_siteFilter);
                        // TBL.search(`${_filter} ${_siteFilter}`).draw();
                            
                        TBL.column(0).search(_filter).draw();
                        TBL.column(1).search(_siteFilter,true,false).draw();

                        saveFilter();

                        resetSummaryData();
                        Object.keys(LIST[urlPath1]).forEach(key => { updateTableAndSummary(key); });
                    });
                    if(done && _new_.REGIONS  && _new_.GEOFENCES){
                        loadFilter();
                    }
                }
            }
            /******** END TABLE CHECK ********/


            /******** GET TAGS ********/
            var getTag = function(tries){
                    GET.AJAX({
                        "url": `https://${CLIENT.ggsURL}/comGpsGate/api/v.1/applications/${CLIENT.appId}/tags?FromIndex=0&PageSize=1000`,
                        "method": "GET",
                        "headers": {
                            "Authorization": USER.apiKey
                        },
                    }, function(response){
                        console.log("Tags:",response);
                        var _siteOptions = `<option value="">Choose Site (Base Plant)</option>`;
                        response.forEach(val => {
                            if(val.name.indexOf("A_Base Plant:") > -1){
                                
                                var tempName = val.name.split(": "),
                                    plant = tempName[1];
                                if(plant == "STA ROSA PL") plant = "STAROSA PL";
                                _siteOptions += `<option value="${plant}">${plant}</option>`;
                            }
                        });
                        $(`#_site`).html(_siteOptions);
                    }, function(error){
                        console.log(error);
                        if(error.status == 0 && tries < MAX_TRIES){
                            tries++;
                            getTag(tries);
                        }
                        TOASTR.ERROR(error);
                    });
                };
            getTag(0);
            /******** END GET TAGS ********/
        }
    }
};
var DE_DASHBOARD = {
    FUNCTION: {
        init:function(){
            PAGE.DISPLAY();
            DE_DASHBOARD.FUNCTION.setBadge();
            $(`#_regions`).parent().addClass("mb-1");
            $(`#_regions`).css("border","none");

            var table_id = "#tbl-ot,#tbl-lq,#tbl-oc",
                urlPath = "notifications",
                _new_ = {},
                filter = "ALL",
                basePlants = [],
                _siteFilter = [],
                _baseplantFilter = "",
                selectedDate = new Date(),
                dt_options = function(title){
                    return {
                        columns: TABLE.COL_ROW(CUSTOM.COLUMN.de_dashboard).column,
                        order: [[ 0, "asc" ]],
                        dom: 't',
                        // scrollX: "100%",
                        scrollY: "350px",
                        paging: false,
                        createdRow: function (row, data, dataIndex) {
                            $(row).attr(`_row`, data._row);
                            $($(row).find("td").eq(0)).hover(function(e) {
                                $(this).css({"text-decoration":e.type === "mouseenter"?"underline":"none",
                                                "cursor":e.type === "mouseenter"?"pointer":"default"});
                            });
                            $($(row).find("td").eq(0)).click(function(){ 
                                moreInfoModal(data);
                            });
                        }
                    };
                },
                populatePage = function(){
                    done = false;
                    $(`#filter-container`).css("pointer-events","none");
                    $(`.switch-toggle`).css("opacity","0.7");

                    $(`#dashboard-page .summary-container b`).html(`<i class="la la-spin la-spinner" style="opacity: 0.3;"></i>`);

                    $(".dataTables_empty").text("Loading...");
                    GET.AJAX({
                        url: `api/${urlPath}/${CLIENT.id}/${USER.username}/all/de/${JSON.stringify({timestamp: FILTER.DATERANGE()})}/0/0`,
                        method: "GET",
                        headers: {
                            "Authorization": SESSION_TOKEN
                        },
                    }, function(docs){
                        $(`#filter-container`).css("pointer-events","unset");
                        console.log(`DE Dashboard`,docs);

                        function perDelayType(table_id,delay_type,_dt_){
                            var rows = [],
                                _dt = $(table_id).DataTable(),
                                filtered = docs.filter(x => x.delay_type == delay_type);
                            $.each(filtered, function(i,val){
                                var same = LIST[urlPath].find(x=> x.dispatch_id == val.dispatch_id && x.delay_type == val.delay_type);
                                var statusArr = [];
                                if(_dt_ == "lq") statusArr = ["queueingAtOrigin"];
                                if(_dt_ == "oc") statusArr = ["processingAtOrigin","idlingAtOrigin"];
                                if(_dt_ == "ot") statusArr = ["in_transit"];

                                if(!same && statusArr.includes(val.dispatch_status)){
                                    rows.push(DE_DASHBOARD.FUNCTION.createRow(val));
                                }
                            });
                            _dt.rows.add(rows).draw(false);
                            DE_DASHBOARD.FUNCTION.setSummary(_dt_);
                        }
                            
                        perDelayType("#tbl-lq","Long Queueing","lq");
                        perDelayType("#tbl-oc","Over CICO","oc");
                        perDelayType("#tbl-ot","Over Transit","ot");

                    }, function(error){
                        console.log("error",error);
                    });
                },
                moreInfoModal = function(x={}){
                    GET.AJAX({
                        url: `/api/dispatch/${CLIENT.id}/${USER.username}/${x.SN}`,
                        method: "GET",
                        headers: {
                            "Authorization": SESSION_TOKEN
                        },
                    }, function(docs){
                        console.log("docs",docs);
                        var obj = docs[0];
                        if(obj){
                            // obj.id = obj._id;
                            $("html, body,#modal").animate({ scrollTop: 0 }, "fast");

                            var de = new Dispatch(obj);
                            $(`body`).append(de.de_html(x));

                        } else {

                        }
                        
                    });
                };
            // moreInfoModal({SN:"21715099","Delay Type":"Long Queueing","Duration":"00:01","Destination":"AAA","Escalation":"1"})
            $(`#tbl-lq,#tbl-oc`).DataTable(dt_options("Location"));
            $(`#tbl-ot`).DataTable(dt_options("Destination"));

            
            $(".dataTables_empty").text("Loading...");

            DE_CHECKDUPS = setInterval(function(){
                // duration
                // console.log("LIST[urlPath]",LIST[urlPath]);
                if(LIST[urlPath]){
                    LIST[urlPath].forEach(val => {
                        // console.log(val);
                        var diff = new Date().getTime() - new Date(val.timestamp).getTime();
                        var dh = DATETIME.DH(diff);
                        var sum = dh + Number(val.timelapse);
                        var hhmm = DATETIME.HH_MM(null,sum);
                        
                        $($(`[_row="${val._row}"] > td`)[2]).html(hhmm.hour_minute);
                        $(`#overlay[attr_row="${val._row}"] [_duration]`).html(`: ${hhmm.hour_minute}`);

                        var _table_id_ = "";
                        if(val.delay_type == "Long Queueing") _table_id_ = "#tbl-lq";
                        if(val.delay_type == "Over CICO") _table_id_ = "#tbl-oc";
                        if(val.delay_type == "Over Transit") _table_id_ = "#tbl-ot";

                        if(BASE_PLANTS){
                            var dt = $(_table_id_).DataTable();
                            var currentValue = $($(`[_row="${val._row}"] > td`)[4]).text();
                            var base = BASE_PLANTS.find(x => x.usersIds.includes(val.dispatch_vehicle_id));
                            if(base){
                                if(currentValue != base.plant){
                                    var rowNode = dt.row(`[_row="${val._row}"]`).node();
                                    var rowIndex = dt.row(rowNode).index();
                                    dt.cell({row: rowIndex, column:7}).data(base.plant).draw(false);
                                }
                            } else {
                                $($(`[_row="${val._row}"] > td`)[4]).text("-");
                            }
                        }
                        //attr_row
                    });
                }
                // end duration

                var types = ["lq","oc","ot"];

                types.forEach(val => {
                    var arr = [],
                        rowIndexes = [],
                        statusArr = [];
                    $(`#tbl-${val}`).DataTable().column(2).data().sort().each(v => { arr.push(v); }); // get all data (column 2)
                    
                    if(val == "lq") statusArr = ["queueingAtOrigin"];
                    if(val == "oc") statusArr = ["processingAtOrigin","idlingAtOrigin"];
                    if(val == "ot") statusArr = ["in_transit"];

                    var tempArr = [];
                    // Fix Delay Escalation Dashboard showing Queueing (Destination) etc
                    arr.forEach(sn => { // must be BEFORE the filter
                        var de = LIST["dispatch"].find(x => x._id == sn);
                        if(de && !statusArr.includes(de.status)){
                            tempArr.push(sn);
                            tempArr.push(sn); // push twice
                        }
                    });
                    arr = arr.filter((e, i, a) => a.indexOf(e) !== i); // filter duplicate data

                    arr = arr.concat(tempArr);

                    $(`#tbl-${val}`).DataTable().rows( function ( idx, data, node ) {             
                        if(arr.includes(data.SN)){
                            rowIndexes.push(idx);
                            arr = jQuery.grep(arr, function(value) { return value != data.SN; });  // remove the duplicate from array           
                        }
                        return false;
                    });   

                    rowIndexes.forEach(idx => {
                        // remove duplicate row/s
                        $(`#tbl-${val}`).DataTable().row(idx).remove().draw(false);
                    });
                });
            },1000);
            
            $(`.dataTables_scrollBody`).css("overflow-x","hidden");
            $(`.summary-container`).css({"margin-right":"unset","border":"unset"});
            TABLE.WATCH({urlPath:"dispatch"});

            /******** EVENT LISTENER ********/
            /******** END EVENT LISTENER ********/

            /******** TABLE CHECK ********/
            TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                if(GGS.STATUS.GEOFENCES && !_new_.GEOFENCES && GGS.STATUS.VEHICLES && !_new_.VEHICLES){
                    _new_.GEOFENCES = true;
                    _new_.VEHICLES = true;

                    var _siteOptions = ``;
                    LIST["geofences"].forEach(val => {
                        _siteOptions += `<option value="${val.short_name}">${val.short_name}</option>`;
                    });
                    $(`#_site`).html(_siteOptions);
                    
                    LIST[urlPath] = [];
                    populatePage();
                }
                if(GGS.STATUS.REGIONS && !_new_.REGIONS){
                    _new_.REGIONS = true;

                    var _regionData = SORT.ARRAY_OBJECT(LIST["regions"],"sequence",{sortType:"asc"});
                    $(`#_regions`).append(`<li class="active"><a id="ALL" class="summary-tab" href="javascript:void(0)" role="tab" data-toggle="tab">ALL</a></li>`);
                    _regionData.forEach(val => {
                        $(`#_regions`).append(`<li><a id="${val._id}" class="summary-tab" href="javascript:void(0)" role="tab" data-toggle="tab">${val.region}</a></li>`);
                    });
                    $(`.summary-tab`).css({"border-radius":"2px","margin-bottom":"3px"});
                    $(`#_regions [role="tab"]`).click(function(){
                        filter = $(this).attr("id");

                        _siteFilter = (_siteFilter || []).filter(x => x);

                        var _filter = (filter == "ALL") ? "" : filter;
                        $(table_id).DataTable().columns(0).search(_filter); // REGION
                        $(table_id).DataTable().columns(4).search(_siteFilter.join("|"),true,false); // SITE
                        $(table_id).DataTable().columns(7).search(_baseplantFilter); // BASE PLANT
                        $(table_id).DataTable().draw();

                        DE_DASHBOARD.FUNCTION.setSummary(null,{region_id:_filter,site:_siteFilter,base:_baseplantFilter});
                    });
                    
                    $(`#_site`).show().select2({placeholder: "Choose Site",allowClear: true}).change(function(){
                        $(`#_site`).parent().find(".select2").css({width:"unset","min-width":"160px"});
                        _siteFilter = $(this).val();

                        _siteFilter = (_siteFilter || []).filter(x => x);

                        var _filter = (filter == "ALL") ? "" : filter;
                        $(table_id).DataTable().columns(0).search(_filter); // REGION
                        $(table_id).DataTable().columns(4).search(_siteFilter.join("|"),true,false); // SITE
                        $(table_id).DataTable().columns(7).search(_baseplantFilter); // BASE PLANT
                        $(table_id).DataTable().draw();

                        DE_DASHBOARD.FUNCTION.setSummary(null,{region_id:_filter,site:_siteFilter,base:_baseplantFilter});
                    });
                    $(`#_site`).parent().find(".select2").css({width:"160px"});
                    $(`#_site`).parent().find(".select2-selection").css({height:"32px"});
                    $(`#_baseplant`).show().select2({placeholder: "Choose Unit Base Plant",allowClear: true}).val("").change(function(){
                        _baseplantFilter = $(this).val();

                        _siteFilter = (_siteFilter || []).filter(x => x);

                        var _filter = (filter == "ALL") ? "" : filter;
                        $(table_id).DataTable().columns(0).search(_filter); // REGION
                        $(table_id).DataTable().columns(4).search(_siteFilter.join("|"),true,false); // SITE
                        $(table_id).DataTable().columns(7).search(_baseplantFilter); // BASE PLANT
                        $(table_id).DataTable().draw();

                        DE_DASHBOARD.FUNCTION.setSummary(null,{region_id:_filter,site:_siteFilter,base:_baseplantFilter});
                    });
                    $(`#_baseplant`).parent().find(".select2-selection").css({height:"32px"});
                }
            };
            TABLE.FINISH_LOADING.CHECK();
            /******** END TABLE CHECK ********/
        
            /******** GET TAGS ********/
            BASE_PLANTS = null;
            var getTag = function(tries){
                GET.AJAX({
                    "url": `https://${CLIENT.ggsURL}/comGpsGate/api/v.1/applications/${CLIENT.appId}/tags?FromIndex=0&PageSize=1000`,
                    "method": "GET",
                    "headers": {
                        "Authorization": USER.apiKey
                    },
                }, function(response){
                    BASE_PLANTS = BASE_PLANTS || [];
                    console.log("Tags:",response);
                    var _baseplantOptions = `<option value="">Choose Unit Base Plant</option>`;
                    response.forEach(val => {
                        if(val.name.indexOf("A_Base Plant:") > -1){
                            var tempName = val.name.split(": "),
                                plant = tempName[1];
                            if(plant == "STA ROSA PL") plant = "STAROSA PL";

                            _baseplantOptions += `<option value="${plant}">${plant}</option>`;

                            BASE_PLANTS.push({
                                plant,
                                usersIds: val.usersIds
                            });
                        }
                    });
                    $(`#_baseplant`).html(_baseplantOptions);
                }, function(error){
                    console.log(error);
                    if(error.status == 0 && tries < MAX_TRIES){
                        tries++;
                        getTag(tries);
                    }
                    TOASTR.ERROR(error);
                });
                };
            getTag(0);
            /******** END GET TAGS ********/

            /******** REAL TIME DATE&TIME ********/
            var interval = setInterval(function() {
                var momentNow = moment();
                $('[_DATE_]').html(momentNow.format('MM/DD/YYYY'));
                $('[_TIME_]').html(momentNow.format('HH:mm')); // hh:mm A
            }, 100);
            /******** END REAL TIME DATE&TIME ********/
        },
        createRow: function(obj,dispatch){
            LIST["dispatch"] = LIST["dispatch"] || [];
            dispatch = dispatch || obj.dispatchDetails || {destination:[]};

            // console.log(dispatch);
            
            var urlPath = "notifications",
                vehicle_id = obj.dispatch_vehicle_id || dispatch.vehicle_id,
                vehicle = getVehicle(vehicle_id),
                destination = dispatch.destination[0] || {location_id:""},
                location_id = obj.dispatch_location_id || destination.location_id,
                geofence = getGeofence(location_id),
                index = LIST[urlPath].findIndex(x => x.id == obj.id),
                dIndex = LIST["dispatch"].findIndex(x => x._id == dispatch._id);
                
            obj.region_id = geofence.region_id;

            if(!obj.dispatch_vehicle_id){
                obj.id = obj._id;
                obj.dispatch_vehicle_id = vehicle_id;
                obj.dispatch_status = dispatch.status;
            }


            (obj._row) ? null : obj._row = GENERATE.RANDOM(36);
            (index > -1) ? LIST[urlPath][index] = obj : LIST[urlPath].push(obj);

            // (dispatch._row) ? null : dispatch._row = GENERATE.RANDOM(36);
            // (dIndex > -1) ? LIST["dispatch"][dIndex] = dispatch : LIST["dispatch"].push(dispatch);

            return TABLE.COL_ROW(null,{
                'Region ID': geofence.region_id,
                'Delay Type': obj.delay_type,
                'SN': obj.dispatch_id,
                '_row':  obj._row,
                'Plate No': vehicle.name || "-",
                'Base Plant': "...",
                'Destination': obj.site || "-",
                'Duration': "...",
                'Escalation': obj.escalation || "-",
            }).row;
        },
        addDataToTable: function(obj){
            return new Promise((resolve,reject) => {
                LIST["dispatch"] = LIST["dispatch"] || [];
                var dispatch = LIST["dispatch"].find(x => x._id == obj.dispatch_id),
                    setColRow = function(){
                        resolve(DE_DASHBOARD.FUNCTION.createRow(obj,dispatch));
                    };
                if(dispatch){
                    setColRow();
                } else {
                    GET.AJAX({
                        url: `/api/dispatch/${CLIENT.id}/${USER.username}/${obj.dispatch_id}`,
                        method: "GET",
                        headers: {
                            "Authorization": SESSION_TOKEN
                        },
                    }, function(docs){
                        var doc = docs[0];
                        if(doc) LIST["dispatch"].push(doc);
                        dispatch = doc || {destination:[]};
                        setColRow();
                    });
                }
            });
        },
        setSummary: function(_dt_,filter){
            var count = {
                ot: {1:0,2:0,3:0},
                lq: {1:0,2:0,3:0},
                oc: {1:0,2:0,3:0},
            },
            fltered = LIST["notifications"];
            if(filter){
                fltered = LIST["notifications"].filter(x => (((filter.region_id)?x.region_id==filter.region_id:true) && 
                                                        ((filter.site && filter.site.length>0)?filter.site.includes(x.site):true) && 
                                                        ((filter.base)?x.site==filter.base:true)));
            }

            $.each(fltered, function(i,val){
                if(val.delay_type == "Over Transit" && (!_dt_ || _dt_ == "ot")) count.ot[val.escalation]++; 
                if(val.delay_type == "Long Queueing" && (!_dt_ || _dt_ == "lq")) count.lq[val.escalation]++; 
                if(val.delay_type == "Over CICO" && (!_dt_ || _dt_ == "oc")) count.oc[val.escalation]++; 
            });
            Object.keys(count).forEach(key => {
                Object.keys(count[key]).forEach(key1 => {
                    if(!_dt_ || _dt_ == key){
                        $(`[${key}_esc_${key1}]`).html(count[key][key1] || "-");
                    }
                });
            });
        },
        setBadge: function(type){
            if(!type || PAGE.GET() == "de_dashboard") DE_NOTIF_COUNT = [];
            // if(type == "add") DE_NOTIF_COUNT ++;
            // if(type == "sub") DE_NOTIF_COUNT --;

            if(DE_NOTIF_COUNT.length == 0 || PAGE.GET() == "de_dashboard"){
                $(`#de_dashboard-badge`).hide();
            } else {
                $(`#de_dashboard-badge`).show();
            }

            $(`#de_dashboard-badge`).html(DE_NOTIF_COUNT.length);
        }
    }
};
var DISPATCH = {
    FUNCTION: {
        monitoring: function(){
            /******** TABLE ********/
            var urlParams = new URLSearchParams(window.location.search),
                __data = CRYPTO.DECRYPT(urlParams.get('data')),
                table_id = '#tbl-dispatch',
                urlPath = "dispatch",
                uniTitle = "Dispatch Entry",
                filter = USER.filters[urlPath] || {},
                dt = null,
                _new_ = true,
                _new2_ = true,
                donePopulate = false,
                rowData = function(obj){
                    var de = new Dispatch(obj,table_id);
                    return TABLE.COL_ROW(null,de.row()).row;
                },
                populateTable = function(newlyLoaded,disableClearTable,doNotClearList,_filter_){
                    if(!doNotClearList) LIST[urlPath] = [];
                    filter = _filter_ || USER.filters[urlPath] || {};
                    try {
                        filter = JSON.parse(filter);
                    } catch(error){}
                    
                    inTransitData = false;

                    // var defaultFilter = {
                    //     $or: [
                    //         {
                    //             posting_date: FILTER.DATERANGE()
                    //         },
                    //         {
                    //             status: {
                    //                 $nin: ["plan","complete","incomplete"]
                    //             }
                    //         }
                    //     ]
                    // };
                    var __filter = ($.isEmptyObject(filter)) ? {posting_date: FILTER.DATERANGE()} : filter;
                    if(clientCustom.filterType.dashboard == "postingDate-scheduledDate"){
                        if(__filter.posting_date && !__filter.scheduled_date){
                            var tempFilter = {
                                $or: [
                                    {
                                        posting_date:  __filter.posting_date
                                    },
                                    {
                                        $and: [
                                            {
                                                scheduled_date:  __filter.posting_date
                                            },
                                            {
                                                status: { $ne: "scheduled" }
                                            }
                                        ]
                                    },
                                    // {
                                    //     status: {
                                    //         $nin: ["plan","complete","incomplete"]
                                    //     }
                                    // }
                                ]
                            };
                            Object.keys(__filter).forEach(key => {
                                if(__filter[key] && key != "posting_date"){
                                    tempFilter[key] = __filter[key];
                                }
                            });
                            __filter = tempFilter;
                        }
                        USER.filters.dispatch = __filter;

                    }
                    console.log(__filter);
                    var dt_buttons = TABLE.BUTTONS({
                        goto: PAGE.GET(),
                        loadView: ["create","create-admin","import"],
                        actions:{
                            "create": function(){ // create-admin
                                $(`body`).append(MODAL.CREATE.EMPTY(`Create New ${uniTitle}`,modalViews.dispatch.form()));
                                DISPATCH.FUNCTION.form({asAdmin:true});
                            },
                            import: function(){
                                $(`body`).append(MODAL.CREATE.EMPTY(`Import Batch File`,modalViews.dispatch.import()));
                                DISPATCH.FUNCTION.import({});
                            },
                            refresh: function(){
                                populateTable(null);
                            },
                            column: function(){
                                $(`#export-container`).hide("slide", {direction:'right'},100);
                                $(`#filter-container`).hide("slide", {direction:'right'},100);
                                $(`#clone-container`).hide("slide", {direction:'right'},100);
                                $(`#cv-container`).toggle("slide", {direction:'right'},100);
                            },
                            filter: function(){
                                $(`#export-container`).hide("slide", {direction:'right'},100);
                                $(`#cv-container`).hide("slide", {direction:'right'},100);
                                $(`#clone-container`).hide("slide", {direction:'right'},100);
                                $(`#filter-container`).toggle("slide", {direction:'right'},100);
                            },
                            export: function(){
                                $(`#filter-container`).hide("slide", {direction:'right'},100);
                                $(`#cv-container`).hide("slide", {direction:'right'},100);
                                $(`#clone-container`).hide("slide", {direction:'right'},100);
                                $(`#export-container`).toggle("slide", {direction:'right'},100);
                            },
                            clone: function(){
                                $(`#export-container`).hide("slide", {direction:'right'},100);
                                $(`#cv-container`).hide("slide", {direction:'right'},100);
                                $(`#filter-container`).hide("slide", {direction:'right'},100);
                                $(`#clone-container`).toggle("slide", {direction:'right'},100);
                            },
                        }
                    });
                    
                    donePopulate = false;
                    if(dt && !disableClearTable) {
                        dt.clear().draw();
                        $(".dataTables_empty").text("Loading...");
                    }
                    GET.AJAX({
                        url: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(__filter)}/count`,
                        method: "GET",
                        headers: {
                            "Authorization": SESSION_TOKEN
                        },
                    }, function(count){
                        var minWidth = 1, maxWidth = 1, origPerc = 0,totalPerc = 0;
                        console.log("count",count);
                        TABLE.POPULATE({
                            url:`${urlPath}/${CLIENT.id}/${USER.username}/all`,
                            goto: PAGE.GET(),
                            commentTitle: uniTitle,
                            withFilter: true,
                            filter: __filter,
                            urlPath,
                            withPagination: true,
                            newlyLoaded,
                            dataTableOptions: {
                                columns: TABLE.COL_ROW(CUSTOM.COLUMN.dispatch()).column,
                                createdRow: function (row, data, dataIndex) {
                                    var _row = data._row,
                                        _id = data._id;
                                    $(row).attr(`_row`, data._row);
                                    
                                    TABLE.ROW_LISTENER({table_id,_row,urlPath:urlPath,_id,
                                        deleteURL: `/api/${urlPath}/${CLIENT.id}/${USER.username}/${_id}`,
                                        editCallback: function(){
                                            $(`body`).append(MODAL.CREATE.EMPTY(`Update ${uniTitle}`,modalViews.dispatch.form()));
                                            DISPATCH.FUNCTION.form({_id:data._id,asAdmin:true});
                                            $("html, body,#modal").animate({ scrollTop: 0 }, "fast");
                                        },
                                        additionalListeners: function(){
                                            $(table_id).on('click', `[_row="${_row}"] [view],[_row="${_row}"] + tr.child [view]`,function(e){
                                                e.stopImmediatePropagation();
                                                $(`body`).append(modalViews.dispatch.fullView(data._id));
                                                $("html, body,#modal").animate({ scrollTop: 0 }, "fast");
                                            });
                                            $(table_id).on('click', `[_row="${_row}"] [statusUpdate],[_row="${_row}"] + tr.child [statusUpdate]`,function(e){
                                                e.stopImmediatePropagation();

                                                var obj = LIST[urlPath].find(x => x._id && x._id.toString() == _id.toString());
                                                if(!obj){}
                                                else {
                                                    $(`body`).append(modalViews.dispatch.statusUpdate(obj._id));
                                                    DISPATCH.FUNCTION.status(_id);
                                                }
                                            });
                                        }
                                    });
                                },
                                order: [[ 1, "desc" ]],
                                dom: 'lB<"toolbar">frti<"tbl-progress-bar">p',
                                buttons: dt_buttons
                            },
                            table_id,
                            initializeCallback: function(data,_dt){
                                dt = _dt;
                                searchEvent();
                                initializeFilter();
                                TABLE.WATCH({urlPath,rowData,options:function(){TABLE.FINISH_LOADING.START_CHECK();}});
                                
                                $(table_id).on( 'search.dt length.dt page.dt', function () {
                                    isFinishedLoading(["GEOFENCES","VEHICLES","TRAILERS","VEHICLES_HISTORY","ROUTES","VEHICLE_PERSONNEL"], true, function(){
                                        TABLE.FINISH_LOADING.UPDATE();
                                        setTimeout(function(){ TABLE.FINISH_LOADING.UPDATE(); },300);
                                    });
                                });

                                // // initialize loading bar
                                $("div.tbl-progress-bar").html(LOADING.PROGRESSBAR.UI()).css({position:"absolute",left:"0px",bottom:"-6px",width:"160px",height:"20px"});
                                LOADING.PROGRESSBAR.INITIALIZE();
                            },
                            populateCallback: function(data){
                                if($(table_id).length > 0){
                                    donePopulate = true;
                                    $(`#search-btn`).css({"pointer-events":"","color":""});
                                    
                                    var rows = [];
                                    $.each(data, function(i,val){
                                        rows.push(rowData(val));
                                    });
                                    dt.rows.add(rows).draw(false);
                                    TABLE.FINISH_LOADING.START_CHECK();

                                    
                                    $("div.tbl-progress-bar").show();
                                    var a = count/LIMIT;
                                    var wholeNumber = Math.floor(a);
                                    var modulo = a % 1;
                                    if(modulo > 0) wholeNumber++
                                    (origPerc) ? null : origPerc = (100 / wholeNumber);
                                    totalPerc = totalPerc + origPerc;
                                    minWidth = maxWidth;
                                    maxWidth = Math.floor(totalPerc);
                                    LOADING.PROGRESSBAR.MOVE(minWidth,maxWidth);
                                    // if(totalPerc >= 100 && !doNotClearList){
                                    //     getInTransitData();
                                    // }
                                }
                            },
                        });
                    });
                },
                // getInTransitData = function(){
                //     if(!inTransitData){
                //         GET.AJAX({
                //             url: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify({status:"in_transit"})}/0/0`,
                //             method: "GET",
                //             headers: {
                //                 "Authorization": SESSION_TOKEN
                //             },
                //         }, function(docs){
                //             inTransitData = true;
                //             console.log("All",docs);
                //             var rows = [];
                //             var inEye = [];
                //             $.each(docs, function(i,val){
                //                 var obj = LIST[urlPath].find(x => x._id == val._id) || {};

                //                 var rowNode = dt.row(`[_row="${obj._row}"]`).node();
                //                 if(rowNode){
                //                     // dt.row(rowNode).data(rowData(val));
                //                 } else {
                //                     val.inEye = true;
                //                     var newVal = rowData(val);
                //                     rows.push(newVal);
                //                     inEye.push(newVal._row);
                //                 }
                //             });
                //             if($(`.la-eye-slash`).length == 1) {
                //                 $.fn.dataTable.ext.search.push(
                //                     function(settings, data, dataIndex) {
                //                         return !inEye.includes($(dt.row(dataIndex).node()).attr('_row'));
                //                     }
                //                 );
                //             }
                //             dt.rows.add(rows).draw(false);
                //         });
                //     }
                // },
                initializeFilter = function(){
                    $(`.page-box`).append(SLIDER.COLUMN_VISIBILITY(CUSTOM.COLUMN.dispatch())); 
                    $('span.toggle-vis').on( 'click', function (e) {
                        var index = $(this).attr('data-column'),
                            column = dt.column(index);

                        column.visible( ! column.visible() );
                        CUSTOM.COLUMN.dispatch()[index].visible = column.visible();
                        CUSTOM.COLUMN.dispatch()[index].bVisible = column.visible();
                        $(table_id).attr("style","");

                        $(`${table_id} thead tr th`).each((i,el) => {
                            if(!$(el).is(":visible")){
                                $(`${table_id} tr:not(.child)`).each((i1,el1) => {
                                    $(el1).find("td").eq(i).hide();
                                });
                            }
                        });
                    });
                    
                    $(`.page-box`).append(SLIDER.EXPORT()); 
                    TABLE.TOOLBAR(dt);
                    $(`.buttons-copy span`).html("Copy Table");
                    $(`.buttons-csv span`).html("Export Table As CSV File");
                    $(`.buttons-excel span`).html("Export Table As Excel File");

                    $(`#_departure_date,#_posting_date,#_scheduled_date,#clone_posting_date`).daterangepicker({
                        opens: 'left',
                        timePicker: true,
                        locale: {
                            format: 'MM/DD/YYYY hh:mm A'
                        },
                        autoUpdateInput: false,
                        autoApply: true
                    }, function(start, end, label) {
                        FILTER.INITIALIZE($(this)["0"].element,start,end,'MM/DD/YYYY hh:mm A');
                        $('.clearable').trigger("input");
                    }).on('apply.daterangepicker', function (ev, picker) {
                        FILTER.INITIALIZE($(this),picker.startDate,picker.endDate,'MM/DD/YYYY hh:mm A');
                        $('.clearable').trigger("input");
                    });
                    $(`#_region`).change(function(){
                        $(`#_cluster`).val("all");
                    });
                    $(`#_cluster`).change(function(){
                        $(`#_region`).val("all");
                    });

                    if(filter.departure_date) FILTER.INITIALIZE(`#_departure_date`,filter.departure_date["$gte"],filter.departure_date["$lt"],'MM/DD/YYYY hh:mm A');
                    if(filter.scheduled_date) FILTER.INITIALIZE(`#_scheduled_date`,filter.scheduled_date["$gte"],filter.scheduled_date["$lt"],'MM/DD/YYYY hh:mm A');
                    if(filter.posting_date) FILTER.INITIALIZE(`#_posting_date`,filter.posting_date["$gte"],filter.posting_date["$lt"],'MM/DD/YYYY hh:mm A');
                    if(filter.status) $(`#_status`).val(filter.status);
                    if(filter.region) $(`#_region`).val(filter.region);
                    if(filter.cluster) $(`#_cluster`).val(decodeURIComponent(filter.cluster));
                    if(filter.departure_date || filter.posting_date || filter.scheduled_date || filter.status || filter.region || filter.cluster) {
                        $(`#filter-container`).toggle("slide", {direction:'right'},100);
                        $('.clearable').trigger("input");
                        FILTER.STATUS = "new";
                    }
                    
                    FILTER.RESET({
                        dateEl: `#_posting_date`,
                        dateElnoVal: `#_departure_date,#_scheduled_date`,
                        selectEl: `#_status,#_region,#_cluster`,
                        urlPath,
                        populateTable
                    });
                    $(`#filter-btn`).click(function(){
                        filter = {};
                        var _departure_date = $(`#_departure_date`).val(),
                            _scheduled_date = $(`#_scheduled_date`).val() || "",
                            _posting_date = (_departure_date || _scheduled_date) ? $(`#_posting_date`).val() : ( $(`#_posting_date`).val() || DEFAULT_DATE),
                            _status = $(`#_status`).val(),
                            _region = $(`#_region`).val(),
                            _cluster = $(`#_cluster`).val()
                            _origin_id = [];
                        console.log("_departure_date",_departure_date,_posting_date);
                        (!_departure_date.isEmpty()) ? filter["departure_date"] = FILTER.DATERANGE(_departure_date,true,true) : null;
                        (!_posting_date.isEmpty()) ? filter["posting_date"] = FILTER.DATERANGE(_posting_date,true,true) : null; 
                        (!_scheduled_date.isEmpty()) ? filter["scheduled_date"] = FILTER.DATERANGE(_scheduled_date,true,true) : null; 
                        (_status != "all") ? filter["status"] = _status : null;
                        if(_region != "all") {
                            filter["region"] = encodeURIComponent(_region);
                            var geofences = LIST["geofences"].filter(x => x.region_id == _region);
                            geofences.forEach(val => {
                                _origin_id.push(val._id);
                            });
                        }
                        if(_cluster != "all") {
                            filter["cluster"] = encodeURIComponent(_cluster);
                            var geofences = LIST["geofences"].filter(x => x.cluster_id == _cluster);
                            geofences.forEach(val => {
                                _origin_id.push(val._id);
                            });
                        }
                        (_origin_id.length > 0) ? filter.origin_id = {$in:_origin_id} : null;

                        // var _data_ = {};
                        if(FILTER.STATUS != "reset") {} else {
                            FILTER.STATUS = "new";
                        }

                        USER.filters.dispatch = filter;
                        
                        GET.AJAX({
                            url: `/api/users/${CLIENT.id}/${USER.username}/${USER.username}`,
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json; charset=utf-8",
                                "Authorization": SESSION_TOKEN
                            },
                            data: JSON.stringify({"filter.dispatch":JSON.stringify(filter)})
                        }, function(docs){
                            console.log("docs",docs);
                        });

                        $(this).html(`<i class="la la-spinner la-spin"></i> Apply`).addClass("disabled");

                        populateTable();
                    });
                    FIXFILTER();





                    $(`#clone-btn`).click(function(){
                        filter = {};
                        var clone_posting_date = $(`#clone_posting_date`).val();
                        console.log("clone_posting_date",clone_posting_date);
                        
                        GET.AJAX({
                            url: `/api/dispatch/${CLIENT.id}/${USER.username}/clone/${JSON.stringify({posting_date: FILTER.DATERANGE(clone_posting_date,true,true)})}`,
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json; charset=utf-8",
                                "Authorization": SESSION_TOKEN
                            }
                        }, function(docs){
                            console.log("Clone",docs);
                            $(`#clone-btn`).html(`Apply`).removeClass("disabled");
                        });

                        $(this).html(`<i class="la la-spinner la-spin"></i> Apply`).addClass("disabled");
                    });
                },
                searchEvent = function(){
                    var searchText = null,
                        origFilter = null,
                        removeSearchResult = false;
                    dt.on('search.dt', function () {
                        if(dt.page.info().recordsDisplay === 0 && dt.search()){
                            if(donePopulate === true){
                                if($(`#search-alert`).html().isEmpty()) {
                                    $(`#search-alert`).html(ALERT.HTML.INFO(`<span id="alert-message">Click <u id="search-btn" style="cursor: pointer;">here</u> to search for Shipment Number: <b id="search-text">${dt.search()}</b> through all records.</span><span id="no-result-message" style="display:none;"></span>`,"m-3",true)).show();
                                    $(`#search-btn`).click(function(){
                                        $(`#search-btn`).css({"pointer-events":"none","color":"#aaadae"});
                                        searchText = dt.search();
                                        // removeSearchResult = false;
                                        origFilter = filter;
                                        filter = {_id:dt.search()};
                                        populateTable(null,true,true,filter);
                                    });
                                } else {
                                    if(searchText === dt.search()){
                                        $(`#alert-message`).hide();
                                        $(`#no-result-message`).html(`No result for Shipment Number: <b id="search-text">${searchText}</b>.`).show();
                                        searchText = null;
                                    } else {
                                        $(`#alert-message`).hide().show();
                                        $(`#no-result-message`).html("").hide();
                                        $(`#search-text`).html(dt.search());
                                    }
                                }
                            }
                        } else {
                            $(`#search-alert`).html("").hide();
                            if(origFilter) {
                                filter = origFilter;
                                origFilter = null;
                            }
                        }
                    });
                },
                FIXFILTER = function(){
                    if(GGS.STATUS.REGIONS && GGS.STATUS.CLUSTERS){
                        var regionOptions = `<option value="all">All</option>`,
                            clusterOptions = `<option value="all">All</option>`;
                        LIST["regions"].forEach(val => {
                            regionOptions += `<option value="${val._id}">${val.region}</option>`;
                        });
                        LIST["clusters"].forEach(val => {
                            clusterOptions += `<option value="${val._id}">${val.cluster}</option>`;
                        });
                        $(`#_region`).html(regionOptions);
                        $(`#_cluster`).html(clusterOptions);
                    }
                };
            __data.for = urlPath;

            
            try {
                filter = JSON.parse(filter);
            } catch (error) {}
            
            LIST[urlPath] = [];
            populateTable(true);
            /******** END TABLE ********/

            /******** TABLE CHECK ********/
            TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                isFinishedLoading(["REGIONS","CLUSTERS","GEOFENCES","VEHICLES","TRAILERS","VEHICLES_HISTORY","ROUTES","USERS","VEHICLE_PERSONNEL"], _new_, function(){
                    _new_ = false;
                    
                    $.each(LIST[urlPath], function(i,val){
                        var rowNode = dt.row(`[_row="${val._row}"]`).node();
                        (rowNode) ? dt.row(rowNode).data(rowData(val)) : null;
                    });
                    
                    TABLE.FINISH_LOADING.UPDATE();
                });
                isFinishedLoading(["GEOFENCES","VEHICLES","TRAILERS","VEHICLES_HISTORY","ROUTES","VEHICLE_PERSONNEL"], true, function(){
                    TABLE.FINISH_LOADING.UPDATE();
                });
                isFinishedLoading(["REGIONS","CLUSTERS"], _new2_, function(){
                    _new2_ = false;
                    FIXFILTER();
                });
            }
            TABLE.FINISH_LOADING.START_CHECK();
            /******** END TABLE CHECK ********/
        },
        form: function(__data){
            console.log("__data",__data)
            var dispatchModule = (CLIENT.id == "wilcon") ? "dispatch_mod2" : "dispatch",
                regex = /^\d{8}$/;

            // LOAD SELECT 2 OPTIONS FOR: ORIGIN,DESTINATION,VEHICLES
            getSelect2Options();

            // remove unwanted fields
            CUSTOM.FORM[dispatchModule]().forEach(val => {
                if(val.remove){
                    if($(val.id).parents(`${val.parent}`).find("input,select,textarea").length >= 1){
                        $(val.id).parents(`${val.parent}`).remove();
                    }
                    $(val.id).remove();
                }
            });

            LIST["dispatch"] = LIST["dispatch"] || [];

            var _id = __data._id,
                __type = __data.type,
                __escalation = Number(__data.escalation), 
                __status = "",
                __tempStat = null,
                __events_captured = {},
                __history = {},
                __vehicleData = null,
                __originalObj = null,
                vehiclesOptions = (clientCustom.editableTrailer) ? G_SELECT2["form-vehicles-admin"] : G_SELECT2["form-vehicles"],
                trailersOptions = G_SELECT2["form-trailers"],
                routesOptions = G_SELECT2["form-routes"],// LIST["routes"],
                shiftScheduleOptions = G_SELECT2["form-shift_schedule"],
                late_data_entry = null,
                vehicleDoneLoading = false,
                ORIGIN_ID,
                DESTINATION_ID,
                TRAILER,
                disabledSumitButton = false,
                vehicleOriginGeofence = null,
                vehicleDestinationGeofence = null,
                initialize_buttons = {
                    new: function(){
                        $(`#submit`).text("Submit");
                        $(`#loading-text`).remove();
                    }
                },
                disableFields = function(status){
                    if(__type || status){
                        if(__type == "delay") {
                            $(`#submit`).html("Submit");
                            $(`#modal input,#modal textarea,#modal select`).attr("disabled",true); // always put before escalation
                            $(`#new-attachment,#new-destination`).remove();
                            $(`#modal table > tbody > tr > td input:disabled`).parents("tr").css("background-color","#eee");
                        } else if(__type == "view") {
                            $(`#modal input,#modal textarea,#modal select`).attr("disabled",true);
                            $(`#submit`).remove();
                            $(`#new-attachment,#new-destination`).remove();
                            $(`#modal table > tbody > tr > td input:disabled`).parents("tr").css("background-color","#eee");
                        } else if(["in_transit"].includes(status)){
                            if(autorizationLevel.administrator()){} 
                            else {
                                $(`#modal input,#modal textarea,#modal select`).attr("disabled",true);
                                $(`#new-destination`).remove();
                                $(`#comments,#new-file`).attr("disabled",false);
                                $(`#modal table > tbody > tr > td input:disabled`).parents("tr").css("background-color","#eee");
                            }
                        }
                    }
                },
                isStatusIncomplete = function(){
                    // check if original status is INCOMPLETE
                    return (__originalObj && __originalObj.status == "incomplete");
                }

            initializeElements();
            
            function initializeElements(){
                var destination_index = 1,
                    checkSelectedVehicleWithinGeofence = function(){
                        return new Promise((resolve,reject) => {
                            var shipment_number = $(`#shipment_number`).val()._trim(),
                                scheduled_date = $(`#scheduled_date`).val(),
                                shift_schedule = $(`#shift_schedule option:selected`).val(),
                                ticket_number = ($(`#ticket_number`).val()||"")._trim(),
                                route = $(`#route`).val()._trim(),
                                vehicle_id = $(`#vehicle option:selected`).val(),
                                trailer = TRAILER,
                                driver_id = $(`#driver_id option:selected`).val(),
                                checker_id = $(`#checker_id option:selected`).val(),
                                helper_id = $(`#helper_id option:selected`).val(),
                                isComplete = true;


                            if(!route) isComplete = false;
                            if(!vehicle_id) isComplete = false;

                            if(CLIENT.id == "wilcon"){
                                if(!ticket_number) isComplete = false;
                                if(!driver_id) isComplete = false;
                                if(!checker_id) isComplete = false;
                                if(!helper_id) isComplete = false;
                            } else { 
                                // trailer is not required for Wilcon
                                if(!trailer) isComplete = false;
                                // shipment number is automated for wilcon
                                if(!shipment_number || !regex.test(shipment_number)) isComplete = false;
                            }
                            
                            if(!["view","delay"].includes(__type) && isComplete){
                                vehicleDoneLoading = false;

                                __tempStat = null;
                                __vehicleData = null;
                                // __events_captured = (__originalObj) ? (__originalObj.events_captured || {}) : {};
                                __events_captured = {};
                                late_data_entry = null;

                                $(`#overlay #alert`).html("");
                                
                                var vehicleUsername  = $(`#vehicle option:selected`).attr("username");
                                var vehicle_id = $(`#vehicle`).val();
                                var geofence =  getGeofence(ORIGIN_ID) || {};
                                var geofenceId = geofence.geofence_id;
    
                                if(geofenceId){
                                    if(CLIENT.id != "wilcon" || (CLIENT.id == "wilcon" && withinSchedule(scheduled_date,shift_schedule))){
                                        console.log("__originalObj",__originalObj);
                                        // check if original route and vehicle is same as current
                                        if((__originalObj && (__originalObj.route == route && __originalObj.vehicle_id == Number(vehicle_id))) && (!vehicleOriginGeofence && !vehicleDestinationGeofence)){
                                            vehicleDoneLoading = true;
                                            resolve();
                                        } else {
                                            if(vehicleUsername && geofenceId && (autorizationLevel.administrator() || !["in_transit","complete","incomplete","scheduled"].includes(__status))){
                                                // $(`#modal #alert`).html(`<i class="la la-spin la-spinner font-18 mb-3"></i>`);
                                                $(`#submit`).html(`<i class="la la-spinner la-spin mr-2"></i>Detecting vehicle's location..`).attr("disabled",true);
                                                
                                                function detectVehicleLocation(tries){
                                                    tries = tries || 0;

                                                    var dGeofence =  getGeofence(DESTINATION_ID) || {};
                                                    var dgeofenceName = dGeofence.short_name;
                                                    var ogeofenceName = geofence.short_name;

                                                    var getIndexOf = function(text,arr,op){
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
                                                    },
                                                    getStat_Time = function(oEvents,dEvents,byPassHourDiff){
                                                        console.log(late_data_entry,oEvents,dEvents,__events_captured);
                                                        var gStat = "assigned",
                                                            gCond = false;
                                                            
                                                        var tempDateTime = new Date().getTime();
                                                        for(var i = oEvents.length-1; i >= 0; i--){
                                                            var val = oEvents[i],
                                                                eventDate = new Date(val.timestamp).getTime(),
                                                                hourDiff = (byPassHourDiff === true) ? 0 : Math.abs(tempDateTime - eventDate) / 36e5;
                                                            console.log("oEvents",val.RULE_NAME,val.stage,!__events_captured[eventDate],hourDiff < 24);
                                                            // in transit
                                                            // do not remove gStat = in_transit.
                                                            if(((val.RULE_NAME == "Inside Geofence" && val.stage == "end") || (val.RULE_NAME == "Outside Geofence" && val.stage == "start")) && late_data_entry == true && gStat != "in_transit" && hourDiff < 24) {
                                                                    gCond = true;
                                                                    gStat = "in_transit";
                                                                    __events_captured[eventDate] = "in_transit";
                                                                    tempDateTime = new Date(val.timestamp).getTime();
                                                                    // console.log("NO: In Transit");
                                                            }
                                                            // idling
                                                            if(getIndexOf(val.RULE_NAME,["Inside","Idle"],"and") && !__events_captured[eventDate] && hourDiff < 24){
                                                                gCond = true;
                                                                __events_captured[eventDate] = "idlingAtOrigin";
                                                                // console.log("NO: Idling");
                                                            }
                                                            // processing
                                                            if(getIndexOf(val.RULE_NAME,["Inside Geofence","Processing"],"and") && !__events_captured[eventDate] && hourDiff < 24){
                                                                gCond = true;
                                                                __events_captured[eventDate] = "processingAtOrigin";
                                                                // console.log("NO: Processing");
                                                            }
                                                            // queueing
                                                            if(getIndexOf(val.RULE_NAME,["Inside Geofence","Queueing"],"and") && !__events_captured[eventDate] && hourDiff < 24){
                                                                gCond = true;
                                                                __events_captured[eventDate] = "queueingAtOrigin";
                                                                // console.log("NO: Queueing");
                                                            }

                                                            // temp Status
                                                            if(!__events_captured[eventDate] && hourDiff < 24){
                                                                __events_captured[eventDate] = "tempStatus";
                                                                // console.log("NO: TempStatus");
                                                            }
                                                        }
                                                        

                                                        // if late entry and no in_transit timestamp
                                                        if(late_data_entry == true && !OBJECT.getKeyByValue(__events_captured,"in_transit")){
                                                            // last timestamp will be in_transit
                                                            __events_captured[new Date().getTime()] = "in_transit";
                                                            console.log("YES: In Transit ~~~");
                                                        }

                                                        console.log("__events_captured",__events_captured);

                                                        // sort events_captured
                                                        var sortedEvents = OBJECT.sortByKey(__events_captured);
                                                        var i = 0;
                                                        var lastTimestamp;
                                                        Object.keys(sortedEvents).forEach(key => {
                                                            if(i == 0){
                                                                i++;
                                                                // if first timestamp is not in transit
                                                                if(sortedEvents[key] != "in_transit"){
                                                                    // console.log("sortedEvents[key]",sortedEvents[key])
                                                                    // change value to entered_origin
                                                                    sortedEvents[key] = "entered_origin";
                                                                }
                                                            }
                                                        });

                                                        // loop to delete tempStatus
                                                        Object.keys(sortedEvents).forEach(key => {
                                                            if(sortedEvents[key] == "tempStatus"){
                                                                delete sortedEvents[key];
                                                            }
                                                        });

                                                        // had to loop again because tempStatus is deleted. Ends up sortedEvents[lastTimestamp] to be undefined
                                                        Object.keys(sortedEvents).forEach(key => { lastTimestamp = key; });
                                                        
                                                        __events_captured = sortedEvents;


                                                        // status will be last timestamp's value
                                                        gStat = sortedEvents[lastTimestamp];
                                                        console.log("sortedEvents",gStat,sortedEvents);
                                                        if(gStat == "entered_origin"){
                                                            gStat = clientCustom.statusWhenTruckEnteredOrigin || "assigned";
                                                        }

                                                        // CICO AT ORIGIN
                                                        if(late_data_entry == true){
                                                            var InTransitDateTime = OBJECT.getKeyByValue(__events_captured,"in_transit");

                                                            gStat = "in_transit";
    
                                                            dEvents.forEach(val => {
                                                                var eventDate = new Date(val.timestamp).getTime(),
                                                                    hourDiff = (byPassHourDiff === true) ? 0 : Math.abs(tempDateTime - eventDate) / 36e5;
    
                                                                // in transit (if no datetime)
                                                                if(val.stage == "start" && !InTransitDateTime && hourDiff < 24){
                                                                    gCond = true;
                                                                    __events_captured[eventDate] = "in_transit";
                                                                }
                                                                // end in transit (if no datetime)

                                                                // HERE!!!!!!!!!

                                                                if(clientCustom.roundtrip) {
                                                                    // onSite
                                                                    if(!((val.RULE_NAME == "Inside Geofence" && val.stage == "end") || (val.RULE_NAME == "Outside Geofence" && val.stage == "start")) && gStat == "in_transit" && !__events_captured[eventDate]){
                                                                        gStat = "onSite";
                                                                        gCond = true;
                                                                        __events_captured[eventDate] = "onSite";
                                                                    }
                                                                    // end onSite
                                                                    

                                                                    // returning
                                                                    if(((val.RULE_NAME == "Inside Geofence" && val.stage == "end") || (val.RULE_NAME == "Outside Geofence" && val.stage == "start")) && gStat == "onSite" && !__events_captured[eventDate]){
                                                                        gStat = "returning";
                                                                        gCond = true;
                                                                        __events_captured[eventDate] = "returning";
                                                                    }
                                                                    // end returning

                                                                    
                                                                    // complete ORIGINNNNN
                                                                    // if(gStat == "returning" && isOrigin === true){
                                                                    //     _ids.complete.push(doc._id);
                                                                    // }
                                                                    // end complete
                                                                } else {
                                                                    // complete
                                                                    if(gStat == "in_transit" && !__events_captured[eventDate] && (Number(InTransitDateTime) < eventDate) && hourDiff < 24){
                                                                        gStat = "complete";
                                                                        gCond = true;
                                                                        __events_captured[eventDate] = "complete";
                                                                    }
                                                                    // end complete
                                                                }

                                                                // HERE!!!!!!!!!
                                                            });
                                                        }
        
                                                        return gStat;
                                                    };

                                                    if(!vehicleOriginGeofence && !vehicleDestinationGeofence){
                                                        var vehicleAjax = function(){
                                                            $(`#submit`).html(`<i class="la la-spinner la-spin mr-2"></i>Adjusting entry status..`).attr("disabled",true);
    
                                                            GET.AJAX({
                                                                url: `/api/vehicles_history/${CLIENT.id}/${USER.username}/${vehicle_id}`,
                                                                method: "GET",
                                                                headers: {
                                                                    "Authorization": SESSION_TOKEN
                                                                },
                                                            }, function(docs){
                                                                vehicleDoneLoading = true;
    
                                                                if(docs.length > 0){
                                                                    var doc = docs[0],
                                                                        loc = doc.location || []; // don't name it 'location', it will refresh page (page.location??)
                        
                                                                    __vehicleData = doc.location;
    
                                                                    if(late_data_entry) {
                                                                        for(var i = loc.length-1; i >= 0; i--){
                                                                            // if i is origin, no destination
                                                                            // if i is destination, look for origin in previous. tag as late entry
                                                                            // if i is not origin or destination, loop reverse. if i-- is origin, tag as late entry
                                                                            // if i is not origin or destination, loop reverse. if i-- is destination, look for origin. tag as late entry
                    
                                                                            /**
                                                                            // if late_data_entry
                                                                            if(i == origin){
                                                                                save location data
                                                                                tag as late entry
                                                                                BREAK;
                                                                            } else {
                                                                                if(i == destination){
                                                                                    for loop before i
                                                                                    check if origin is inside and  where it has not been to destination yet
                                                                                    if(it has been to destination already){
                                                                                        BREAK;
                                                                                    }
                                                                                    if(origin is inside new for loop){
                                                                                        save location data (origin)
                                                                                        save location data (destination)
                                                                                        tag as late entry
                                                                                        BREAK;
                                                                                    } else {
                                                                                        DO NOT tag as late entry
                                                                                        status is dispatch
                                                                                    }
                                                                                }
                                                                            }
                                                                            */
                                                                            
                                                                            if(loc[i].short_name == ogeofenceName){
                                                                                late_data_entry = true;
                                                                                __tempStat = getStat_Time(loc[i].events,[]);
                                                                                // Truck selected has left the origin. This shipment will be tagged as LATE_DATA_ENTRY and will automatically be saved as IN TRANSIT.
                                                                                // modalAlert(`Truck selected has left the origin. This shipment will be tagged as <b>LATE_DATA_ENTRY</b> and will automatically be saved as <b>IN TRANSIT</b>.`,"WARNING");
                                                                                break;
                                                                            } else {
                                                                                if(loc[i].short_name == dgeofenceName){
                                                                                    var prevLoc = loc.slice(0, i),
                                                                                        prevHasOrigin = false;
                                                                                    for(var j = prevLoc.length-1; j >= 0; j--){
                                                                                        if(prevLoc[j].short_name == dgeofenceName){
                                                                                            break;
                                                                                        }
                                                                                        if(prevLoc[j].short_name == ogeofenceName){
                                                                                            late_data_entry = true;
                                                                                            __tempStat = getStat_Time(prevLoc[j].events,loc[i].events);
                                                                                            prevHasOrigin = true;
                                                                                            // modalAlert(`Truck selected has left the origin and is already at destination. This shipment will be tagged as <b>LATE_DATA_ENTRY</b>.`,"WARNING");
                                                                                            // Truck selected has left the origin and is already at destination. This shipment will be tagged as LATE_DATA_ENTRY.
                                                                                            break;
                                                                                        }
                                                                                    }
                                                                                    if(!prevHasOrigin){
                                                                                        late_data_entry = false;
                                                                                        __tempStat = "assigned";
                                                                                        // modalAlert(`Truck selected is <u>not</u> within the origin. It is assumed that the truck is enroute to origin.`,"INFO");
                                                                                        // Truck selected is <u>not</u> within the origin. It is assumed that the truck is enroute to origin.
                                                                                    }
                                                                                    break;
                                                                                }
                                                                            }
                                                                        }
                                                                        if(__tempStat == null) {
                                                                            console.log("__tempStat is null");
                                                                            __tempStat = "assigned";
                                                                            late_data_entry = false;
                                                                            // modalAlert(`Truck selected is <u>not</u> within the origin. It is assumed that the truck is enroute to origin.`,"INFO");
                                                                            // Truck selected is <u>not</u> within the origin. It is assumed that the truck is enroute to origin.
                                                                        }
                                                                    } else {
                                                                        if(loc[loc.length-1].short_name == ogeofenceName){
                                                                            __tempStat = getStat_Time(loc[loc.length-1].events);
                                                                        }
                                                                        if(__tempStat == null) {
                                                                            __tempStat = "assigned";
                                                                            late_data_entry = false;
                                                                            console.log("__tempStat is null but vehicle is inside origin.");
                                                                        }
                                                                        // modalAlert(`Truck selected is within the origin.`,"INFO");
                                                                        // Truck selected is within the origin.
                                                                    }
                                                                } else {
                                                                    // modalAlert(`Truck selected does not exist.`,"ERROR");
                                                                    reject({
                                                                        message: `Truck selected does not exist.`
                                                                    });
                                                                }
    
                                                                var tempEventsCaptured = OBJECT.sortByKey(__events_captured);
                                                                __events_captured = tempEventsCaptured;

                                                                __tempStat = __tempStat || "assigned";
    
                                                                console.log("EYOOOEOEOEOOEOEO",late_data_entry,__tempStat,__events_captured);
    
                                                                resolve();
                                                            });
                                                        };
                                                        
                                                        GET.AJAX({
                                                            "url": `https://${CLIENT.ggsURL}/comGpsGate/api/v.1/applications/${CLIENT.appId}/geofences/${geofenceId}/users?FromIndex=0&PageSize=500`,
                                                            "method": "GET",
                                                            "headers": {
                                                                "Authorization": USER.apiKey
                                                            },
                                                        }, function(response){
                                                            console.log("Vehicles:",response);
                                                            late_data_entry = true;
                                                            response.forEach(val => {
                                                                if(val.username == vehicleUsername){
                                                                    late_data_entry = false;
                                                                }
                                                            });
                                                            vehicleAjax();
                                                        }, function(error){
                                                            if(error.status == 0 && tries < MAX_TRIES){
                                                                tries++;
                                                                detectVehicleLocation(tries);
                                                            }
                                                            TOASTR.ERROR(error);
                                                        });
                                                    } else {
                                                        $(`#submit`).html(`<i class="la la-spinner la-spin mr-2"></i>Adjusting entry status..`).attr("disabled",true);

                                                        vehicleDoneLoading = true;

                                                        if(vehicleOriginGeofence && vehicleDestinationGeofence){
                                                            late_data_entry = true;

                                                            console.log(vehicleDestinationGeofence.short_name,dgeofenceName);
                                                            if(vehicleDestinationGeofence.short_name == dgeofenceName){
                                                                __tempStat = getStat_Time(vehicleOriginGeofence.events,(vehicleDestinationGeofence||{}).events,true);
                                                            } else {
                                                                __tempStat = getStat_Time(vehicleOriginGeofence.events,[],true);
                                                            }

                                                            var tempEventsCaptured = OBJECT.sortByKey(__events_captured);
                                                            __events_captured = tempEventsCaptured;
    
                                                            console.log("EYOOOEOEOEOOEOEO1111111111",late_data_entry,__tempStat,__events_captured);
    
                                                            resolve();
                                                        } else {
                                                            GET.AJAX({
                                                                "url": `https://${CLIENT.ggsURL}/comGpsGate/api/v.1/applications/${CLIENT.appId}/geofences/${geofenceId}/users?FromIndex=0&PageSize=500`,
                                                                "method": "GET",
                                                                "headers": {
                                                                    "Authorization": USER.apiKey
                                                                },
                                                            }, function(response){
                                                                console.log("Vehicles:",response);
                                                                late_data_entry = true;
                                                                response.forEach(val => {
                                                                    if(val.username == vehicleUsername){
                                                                        late_data_entry = false;
                                                                    }
                                                                });
                                                                __tempStat = getStat_Time(vehicleOriginGeofence.events,[],true);

                                                                var tempEventsCaptured = OBJECT.sortByKey(__events_captured);
                                                                __events_captured = tempEventsCaptured;
        
                                                                console.log("EYOOOEOEOEOOEOEO222222222",late_data_entry,__tempStat,__events_captured);
        
                                                                resolve();
                                                            }, function(error){
                                                                if(error.status == 0 && tries < MAX_TRIES){
                                                                    tries++;
                                                                    detectVehicleLocation(tries);
                                                                }
                                                                TOASTR.ERROR(error);
                                                            });
                                                        }
                                                    }
                                                }

                                                detectVehicleLocation();
                                            } else {
                                                late_data_entry = false;
                                                resolve();
                                            }
                                        }
                                    } else {
                                        vehicleDoneLoading = true;
                                        __tempStat = "assigned";
                                        late_data_entry = false;
                                        __events_captured = {};
                                        resolve();
                                    }
                                } else {
                                    vehicleDoneLoading = true;
                                    __tempStat = "plan";
                                    late_data_entry = false;
                                    __events_captured = {};
                                    resolve();
                                }
                            } else {
                                resolve();
                            }
                        });
                    },
                    checkVehicleInfoAndScheduledDateTime = function(){
                        return new Promise((resolve,reject) => {
                            var scheduled_date = $(`#scheduled_date`).val(),
                                shift_schedule = $(`#shift_schedule option:selected`).val(),
                                vehicle_id = $(`#vehicle option:selected`).val(),
                                driver_id = $(`#driver_id option:selected`).val(),
                                checker_id = $(`#checker_id option:selected`).val(),
                                helper_id = $(`#helper_id option:selected`).val();
                            if(CLIENT.id == "wilcon" && vehicle_id && driver_id && checker_id && helper_id && scheduled_date && shift_schedule){
                                $(`#modal #alert`).html(`<i class="la la-spin la-spinner font-18 mb-3"></i>`);
                                disabledSumitButton = true;
                                $(`#submit`).attr("disabled",true);
                                var filter = {
                                    $and: [
                                        {
                                            $or: [
                                                { vehicle_id: Number(vehicle_id), },
                                                { driver_id },
                                                { checker_id },
                                                { helper_id },
                                            ]
                                        },
                                        { scheduled_date: new Date(scheduled_date).toISOString(), },
                                        { shift_schedule, },
                                        { status: { $nin: ["plan","complete","incomplete"]}, }
                                    ],
                                };
                                $.ajax({
                                    url: `/api/dispatch/${CLIENT.id}/${USER.username}/vehicle_info/${JSON.stringify(filter)}`,
                                    method: "GET",
                                    timeout: 90000, // 1 minute and 30 seconds
                                    headers: {
                                        "Authorization": SESSION_TOKEN
                                    },
                                    async: true
                                }).done(function (docs) {
                                    console.log("docs",docs);
                                    if(docs.length > 0){
                                        var message = [];
                                        // var faults = {};
                                        docs.forEach(val => {
                                            if(val._id != _id){
                                                if(val.vehicle_id == Number(vehicle_id)){
                                                    message.push(`• Truck is already assigned to shipment ${val._id}.`);
                                                }
                                                if(val.driver_id.toString() == driver_id.toString()){
                                                    message.push(`• Driver is already assigned to shipment ${val._id}.`);
                                                }
                                                if(val.checker_id.toString() == checker_id.toString()){
                                                    message.push(`• Checker is already assigned to shipment ${val._id}.`);
                                                }
                                                if(val.helper_id.toString() == helper_id.toString()){
                                                    message.push(`• Helper is already assigned to shipment ${val._id}.`);
                                                }
                                            }
                                        });
                                        if(message.length > 0){
                                            $(`#modal #alert`).html(ALERT.HTML.ERROR(`<b>Error:</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${message.join("<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")}`,"ml-0 mr-0 mt-0 mb-3"));
                                            $("#modal").animate({ scrollTop: 0 }, "fast");
                                            disabledSumitButton = true;
                                            $(`#submit`).attr("disabled",true);
                                        } else {
                                            $(`#modal #alert`).html("");
                                            $("#modal").animate({ scrollTop: 0 }, "fast");
                                            disabledSumitButton = false;
                                            $(`#submit`).attr("disabled",false);
                                        }
                                    } else {
                                        $(`#modal #alert`).html("");
                                        $("#modal").animate({ scrollTop: 0 }, "fast");
                                        disabledSumitButton = false;
                                        $(`#submit`).attr("disabled",false);
                                    }
                                    resolve();
                                });
                            } else {
                                resolve();
                            }
                        });
                    };

                /******** ORIGIN ********/
                if((clientCustom.defaultOrigin.roles||[]).includes(USER.role)){
                    var origin = getGeofence(clientCustom.defaultOrigin.id);
                    if(origin) $(`#origin`).val(origin.short_name);
                } 
                /******** END ORIGIN ********/

                /******** SCHEDULED DATE ********/
                var NEXT_DAY = moment(new Date(DEFAULT_DATE)).add(1,"days").format("MM/DD/YYYY");
                $(`#scheduled_date`).daterangepicker({
                    opens: 'left',
                    autoApply: true,
                    singleDatePicker:true,
                    autoUpdateInput: false,
                    minDate: DATETIME.FORMAT(new Date(),"MM/DD/YYYY"),
                    locale: {
                        format: 'MM/DD/YYYY',
                    //   cancelLabel: 'Clear'
                    }
                }, function(start, end, label) { }).on('apply.daterangepicker', function(ev,picker){;
                    var formattedDate = moment(new Date(picker.startDate)).format('MM/DD/YYYY');
                    $(this).val(formattedDate);
                    $(this).data('daterangepicker').setStartDate(formattedDate);
                    $(this).data('daterangepicker').setEndDate(formattedDate);
                    $(`#shift_schedule`).attr("disabled",false);

                    if(formattedDate == DEFAULT_DATE){
                        (LIST["shift_schedule"]||[]).forEach(val => {
                            if(withinSchedule(formattedDate,val._id,true)){
                                $(`#shift_schedule option[value="${val._id}"]`).removeAttr("disabled");
                            } else {
                                $(`#shift_schedule option[value="${val._id}"]`).attr("disabled","disabled");
                            }
                        });
                    } else {
                        $(`#shift_schedule option`).removeAttr("disabled");
                    }
                    $(`#shift_schedule`).val("").select2().attr("disabled",false);

                    setDriverChecker($(`#driver_id`).val(),$(`#checker_id`).val(),$(`#helper_id`).val());
                });
                
                // .on('cancel.daterangepicker', function(ev, picker) {
                //     //do something, like clearing an input
                //     $(this).val('');
                //     var date = DATETIME.FORMAT(moment().startOf('day').toISOString(),"MM/DD/YYYY");
                //     $(this).data('daterangepicker').setStartDate(date);
                //     $(this).data('daterangepicker').setEndDate(date);

                //     $(`#shift_schedule`).val("").select2().attr("disabled",true);
                // });
                /******** END SCHEDULED DATE ********/

                /******** TICKET NUMBER ********/
                // $(`#search-ticket-number`).click(function(){
                //     alert("HI")
                // });
                /******** END TICKET NUMBER ********/

                /******** SHIFT SCHEDULE ********/
                $(`#shift_schedule`).html(shiftScheduleOptions).select2().val("").on("select2:select", function() {
                    // checkSelectedVehicleWithinGeofence();
                    checkVehicleInfoAndScheduledDateTime();
                }).trigger("change").attr("disabled",true);
                /******** END SHIFT SCHEDULE ********/

                /******** TRAILERS ********/
                $(`#trailer`).html(trailersOptions).select2().val("").on("select2:select", function() {
                    // checkSelectedVehicleWithinGeofence(7);
                }).change(function(){
                    if($(this).val() != null){
                        TRAILER = $(this).val() || "";
                        
                        var trailer = getTrailer(TRAILER) || {};
                        $(`td[trailer]`).html(TRAILER || "-");
                        $(`td[cluster]`).html(trailer.cluster || "-");
                        $(`td[base]`).html(trailer.site || "-");
                        $(`td[region]`).html(trailer.region || "-");
                        $(`td[pallet_type]`).html(trailer.pal_cap || "-");
                    }
                }).prop("disabled",true);
                /******** END TRAILERS ********/

                /******** VEHICLES ********/
                var originalVehicle;
                $(`#vehicle`).html(vehiclesOptions).select2({
                    matcher: matcher,
                    templateResult: formatCustom
                }).val("").on("select2:select", function() {
                    // checkSelectedVehicleWithinGeofence(7);
                }).change(function(){
                    if($(this).val()){
                        $(`#trailer`).prop("disabled",false);
                    } else {
                        $(`#trailer`).prop("disabled",true);
                    }

                    var vehicle = getVehicle($(this).val()) || {};
                    var trailer = getTrailer(vehicle.name);
                    var sameVehicleAndTrailer = vehicle.name == vehicle["Trailer"];
                    // Straight Truck
                    if(trailer || sameVehicleAndTrailer) {
                        if(trailer){
                            TRAILER = trailer._id || "";
                        } else {
                            TRAILER = vehicle["Trailer"];
                            trailer = {
                                cluster: vehicle["Cluster"],
                                site: vehicle["Site"],
                                region: vehicle["Region"],
                                pal_cap: vehicle["Pal Cap"],
                            };
                        }

                        $(`#trailer`).prop("disabled",true);
                        if(clientCustom.editableTrailer) $(`#trailer`).val("Straight Truck").change();
                        $(`td[trailer]`).html("Straight Truck");
                    } else {
                        trailer = getTrailer(originalVehicle || vehicle["Trailer"]);
                        if(trailer){
                            TRAILER = trailer._id || "";

                            if(clientCustom.editableTrailer) $(`#trailer`).val(TRAILER).change();
                            $(`td[trailer]`).html(TRAILER || "-");
                        } else {
                            trailer = {};
                        }
                        console.log(2,TRAILER);
                    }
                    originalVehicle = null;
                    
                    // TRAILER = vehicle["Trailer"] || "";
                    // var trailer = getTrailer(TRAILER) || {};

                    $(`td[conduction_number]`).html(vehicle["Tractor Conduction"] || "-");
                    $(`td[cluster]`).html(trailer.cluster || "-");
                    $(`td[base]`).html(trailer.site || "-");
                    $(`td[region]`).html(trailer.region || "-");
                    $(`td[pallet_type]`).html(trailer.pal_cap || "-");

                    setDriverChecker();
                    checkVehicleInfoAndScheduledDateTime();
                    previousCheckIns();
                });
                /******** END VEHICLES ********/


                /******** PREVIOUS CHECK-INS ********/
                function previousCheckIns(){
                    var vehiclesHistory = getVehicleHistory($("#vehicle").val()) || {};
                    
                    $(`#previous-checkins tbody`).html("");
                    $(`[name="checkin"]`).prop("checked",false);
                    vehicleOriginGeofence = null;
                    vehicleDestinationGeofence = null;

                    var loc = (vehiclesHistory.location||[]);
                    var reversedLoc = [...loc].reverse();
                    var countCheckIns = 0;
                    reversedLoc.forEach((val,i) => {
                        if(countCheckIns < 5) {
                            val.events = val.events || [];
                            var destination = reversedLoc[i-1] || {};
                            var first = null;
                            var last = null;
                            var radioButton = `<input type="radio" disabled>`;
                            var originSelected = getGeofence(ORIGIN_ID);
    
                            val.events.forEach(eVal => {
                                (!first && eVal.RULE_NAME.indexOf("Inside") > -1) ? first = eVal : null; // should be the first eVal
                                last = (eVal.RULE_NAME.indexOf("Outside") > -1) ? eVal : {}; // whatever the last Outside eVal detected
                            });
    
                            if(val.short_name == (originSelected||{}).short_name){
                                countCheckIns ++;
                                radioButton = `<input type="radio" name="checkin" value="${i}">`;
    
                                var tr = $(`<tr>
                                            <td>${radioButton}</td>
                                            <td>${DATETIME.FORMAT((first||{}).timestamp)}</td>
                                            <td>${DATETIME.FORMAT((last||{}).timestamp)}</td>
                                            <td>${val.short_name}</td>
                                            <td>${destination.short_name || "-"}</td>
                                        </tr>`);
                                $(`#previous-checkins tbody`).append(tr);
    
                            
    
                                if(__originalObj && first){
                                    Object.keys((__originalObj.events_captured||{})).forEach(key => {
                                        if(moment(Number(key)).format('HH:mm') === moment(first.timestamp).format('HH:mm')){
                                            $(tr).find(`[name="checkin"]`).prop("checked",true);
                                        }
                                    });
                                }
                            }
                        }
                    });

                    if($(`[name="checkin"]:checked`).length == 0){
                        $($(`[name="checkin"]`).get(0)).prop("checked",true);
                    }
                    
                    $(`[name="checkin"]`).change(function(){
                        var checked = $(this).prop("checked");

                        if(checked) {
                            var index = $(this).val();
    
                            vehicleOriginGeofence = reversedLoc[index];
    
                            var destinationSelected = getGeofence(DESTINATION_ID);
                            var destinationIndex = null;
    
                            for(var i = index-1; i >= 0; i--){
                                // console.log("reversedLoc[i]",i,reversedLoc[i]);
                                if(destinationSelected.short_name == reversedLoc[i].short_name){
                                    destinationIndex = i;
                                    break;
                                }
                            }
                            destinationIndex = (!destinationIndex || destinationIndex < 0) ? (index-1) : destinationIndex;
                            vehicleDestinationGeofence = reversedLoc[destinationIndex];
    
                            console.log("INDEX",index);
                            console.log("ORIGIN",vehicleOriginGeofence);
                            console.log("destinationIndex",destinationIndex);
                            console.log("DESTINATION",vehicleDestinationGeofence);
                        }
                    }).trigger("change");
                }
                /******** END PREVIOUS CHECK-INS ********/
            

                /******** VEHICLE PERSONNEL ********/
                $(`#driver_id,#checker_id,#helper_id`).html("").select2();

                function setDriverChecker(driver_id,checker_id,helper_id){
                    if(CLIENT.id == "wilcon"){
                        var __original = __originalObj || {};
                        /******** VEHICLE PERSONNEL ********/
                        function personnelList(occupation,idType,value){
                            var listHTML = `<option value="">&nbsp;</option>`;
                            var tempList = LIST["vehicle_personnel"].filter(x => x.occupation == occupation);
                            var defaultPersonnel = LIST["vehicle_personnel"].find(x => (x.vehicle_id||"").toString() == $(`#vehicle`).val() && $(`#vehicle`).val() && x.occupation == occupation) || {};
                            var originalPersonnel = LIST["vehicle_personnel"].find(x => x.name == value || __original[idType]) || {};
                            var unavailablePersonnel = [];
                            
                            tempList.forEach(val => {
                                var dates = val.dates || {};
                                var scheduled_date = new Date($(`#scheduled_date`).val()).toISOString();
                                var arr = [];

                                Object.keys(dates).forEach(key => {
                                    var selectedDates = dates[key] || [];
                                    if(selectedDates.includes(scheduled_date)){
                                        arr.push(vehiclePersonnelCalendarOptions[key].label);
                                    }
                                });
                                var text = (arr.length > 0) ? ` (${arr.join(", ")})` : "";
                                var disabled = (arr.length > 0) ? "disabled" : "";
                                listHTML += `<option value="${val._id}" ${disabled}>${val.name||"No Name"}${text}</option>`;
                                if(arr.length > 0){
                                    unavailablePersonnel.push(val._id);
                                }
                            });
                            var finalPersonnel = "";
                            (unavailablePersonnel.includes(value)) ? null : finalPersonnel = value;
                            (unavailablePersonnel.includes(originalPersonnel._id)) ? null : finalPersonnel = originalPersonnel._id;
                            (unavailablePersonnel.includes(defaultPersonnel._id)) ? null : finalPersonnel = defaultPersonnel._id;
                            $(`#${idType}`).empty().html(listHTML).select2().val(finalPersonnel).on("select2:select", function() {
                                checkVehicleInfoAndScheduledDateTime();
                            }).trigger("change");
                        }
                        personnelList("Driver","driver_id",driver_id);
                        personnelList("Checker","checker_id",checker_id);
                        personnelList("Helper","helper_id",helper_id);
                        /******** END VEHICLE PERSONNEL ********/
                    }
                }
                /******** END VEHICLE PERSONNEL ********/

                /******** ROUTES ********/
                $(`#route`).html(routesOptions).select2({
                    matcher: matcher,
                    templateResult: formatCustom
                }).val("").on("select2:select", function() {
                    // checkSelectedVehicleWithinGeofence(7);
                }).change(function(){
                    var route = getRoute($(this).val());
                    if(route){
                        var origin = getGeofence(route.origin_id);
                        var destination = getGeofence(route.destination_id);
                        ORIGIN_ID = origin._id;
                        DESTINATION_ID = destination._id;
                        $(`#origin`).val(`${origin.short_name} (${origin.site_name || "-"})`);
                        $(`[location]`).val(`${destination.short_name} (${destination.site_name || "-"})`);
                    } else {
                        if(__type != "view") {
                            // $(`#route`).val("").change();
                            $(`#origin,[location]`).val("");
                            ORIGIN_ID = "";
                            DESTINATION_ID = "";
                            // toastr.warning("The route you have selected is not defined in the database.");
                        }
                    }
                    route_and_transitTime(null,route);
                    previousCheckIns();
                });
                
                if((clientCustom.defaultOrigin.roles||[]).includes(USER.role)){
                    var origin = getGeofence(clientCustom.defaultOrigin.id);
                    $(`#route`).on('select2:open', function (e) {
                        $(".select2-search__field").val(`${origin.short_name},`).focus();
                    });
                }
                /******** END ROUTES ********/

                // should be after all field initializations.
                $(`#scheduled_date`).trigger('apply.daterangepicker',{startDate: NEXT_DAY});

                /******** AUTOFILL ********/
                var id_index = null,
                    has_id = false;
                
                if(_id){
                    $(`.main-content .clearfix`).css({"pointer-events": "none"});
                    $(`#loading-text`).show();
                    has_id = true;
                    id_index = LIST["dispatch"].findIndex(x => x._id == _id);
                    var obj = LIST["dispatch"][id_index];
                    __originalObj = obj;

                    if(!(clientCustom.previousCheckIns.status||[]).includes((__originalObj||{}).status)){
                        $(`#previous-checkins-container`).remove();
                    }
                    
                    if(id_index >= 0){
                        populateDispatchEntry();
                    } else {
                        GET.AJAX({
                            url: `/api/dispatch/${CLIENT.id}/${USER.username}/${_id}`,
                            method: "GET",
                            headers: {
                                "Authorization": SESSION_TOKEN
                            },
                        }, function(docs){
                            $(`.main-content .clearfix`).css({"pointer-events": ""});
                            obj = docs[0];
                            if(obj){
                                __originalObj = obj;
                                populateDispatchEntry();
                            } else {
                                has_id = false;
                                initialize_buttons.new();
                                addNewDestinationRow();	
                                disableFields();
                            }
                        });
                    }
                    function populateDispatchEntry(){
                        $(`#loading-text`).remove();
                        $(`.main-content .clearfix`).css({"pointer-events": ""});

                        if(["complete","incomplete"].includes(obj.status)){
                            if(isStatusIncomplete() && autorizationLevel.administrator()) {
                                $(`#error`).html(`<div class="alert alert-danger alert-dismissible mb-1 role="alert">
                                                    <i class="la la-times-circle"></i> The status of this entry is <b>INCOMPLETE</b>. Any changes made will not affect the status.
                                                </div>`).show();
                            }
                            else {
                                (__type != "delay")? __type = "view" : null;
                            }
                        }

                        __status = obj.status;

                        $.each(obj.destination, function(i,val){
                            addNewDestinationRow(val,obj.route);
                        });

                        originalVehicle = obj.trailer;

                        
                        if(obj.scheduled_date){
                            $(`#scheduled_date`).trigger('apply.daterangepicker',{startDate: obj.scheduled_date});
                        }

                        CUSTOM.FORM[dispatchModule]().forEach(val => {
                            var value = obj[val.key] || val.alternativeValue || "";
                            if(val.dataType == "dateTime"){
                                value = DATETIME.FORMAT(obj[val.key],"MM/DD/YYYY, hh:mm A","");

                                if(val.inputType == "val"){
                                    var date = moment(new Date(obj[val.key])).format("MM/DD/YYYY, hh:mm A");
                                    $(val.id).data('daterangepicker').setStartDate(date);
                                    $(val.id).data('daterangepicker').setEndDate(date);
                                }
                            }
                            if(val.dataType == "date"){
                                value = DATETIME.FORMAT(obj[val.key],"MM/DD/YYYY","");

                                if(val.inputType == "val"){
                                    var date = moment(new Date(obj[val.key])).format("MM/DD/YYYY");
                                    $(val.id).data('daterangepicker').setStartDate(date);
                                    $(val.id).data('daterangepicker').setEndDate(date);
                                }
                            }

                            // set value
                            if(value) $(val.id)[val.inputType](value);

                            // options
                            if(val.readonly) $(val.id).attr("readonly",val.readonly);
                            if(val.trigger) $(val.id).trigger(val.trigger);
                        });

                        ATTACHMENTS.set(obj.attachments,((__type == "delay" || __type == "view")?true:false));
                        
                        if(obj.destination.length == 0){
                            addNewDestinationRow();
                        }
                        route_and_transitTime(obj);
                        disableFields(obj.status);
                    }
                } else {
                    $(`#previous-checkins-container`).remove();
                    initialize_buttons.new();
                    addNewDestinationRow();	
                    disableFields();
                }
                /******** END AUTOFILL ********/

                /******** DESTINATION ********/
                $(`#new-destination`).click(function(){
                    addNewDestinationRow();		
                });
                function addNewDestinationRow(data,routeId){
                    data = data || {};
                    (destination_index < 1) ? destination_index = 1 : null;
                    var noAction = (["delay","view"].includes(__type) || ["queueingAtOrigin","processingAtOrigin","in_transit","queueingAtDestination","processingAtDestination"].includes(__status))?true:false,
                        _row = DISPATCH.FUNCTION.add_row.destination(destination_index,data,routeId,noAction);
                    destination_index ++;	
                    $(`[_row="${_row}"] [delete-destination]`).click(function(){
                        $(this).parent().parent().remove();	
                        if($('#tbl-destination > tbody > tr').length > 0){
                            $('#tbl-destination > tbody > tr').each(function(index, tr) {
                                destination_index = index+1; 
                                $(tr).children().eq(0).html(destination_index);
                            });
                            (destination_index > 0) ? destination_index ++ : null;
                        } else {
                            destination_index = 1;
                        }
                        route_and_transitTime();
                    });
                }
                /******** END DESTINATION ********/
                
                /******** ROUTE & TRANSIT TIME ********/
                function route_and_transitTime(obj,route){
                    obj = obj || {};
                    var __r = route || getRoute(obj.route || $(`#route`).val());
                    if(__r){
                        var transit_hh_mm = DATETIME.HH_MM(null,__r.transit_time),
                            destination = getGeofence(__r.destination_id) || {},
                            cico_hh_mm = DATETIME.HH_MM(null,destination.cico)

                        $(`[transit_time]`).html(`${transit_hh_mm.hour} : ${transit_hh_mm.minute}`);
                        $(`[cico]`).html(`${cico_hh_mm.hour} : ${cico_hh_mm.minute}`);
                    } else {
                        $(`[transit_time],[cico]`).html(`<span class="text-muted">HH</span> : <span class="text-muted">MM</span>`);
                    }
                }
                /******** END ROUTE & TRANSIT TIME ********/

                /******** ATTACHMENT ********/
                ATTACHMENTS.initialize(((__type == "delay" || __type == "view")?true:false));
                /******** END ATTACHMENT ********/

                /******** SUBMIT ENTRY ********/
                $(`#submit`).click(function(){
                    var status = "assigned",
                        body = {},
                        buttonDefaultText = (__type == "delay" || !has_id) ? "Submit" : "Update",
                        buttonLoadingText = (__type == "delay" || !has_id) ? "Submitting.." : "Updating..",
                        button = $(this);
                    
                    $(`#error`).hide();
                    // check if all fields have value
                    var shipment_number = $(`#shipment_number`).val()._trim(),
                        scheduled_date = $(`#scheduled_date`).val(),
                        shift_schedule = $(`#shift_schedule option:selected`).val(),
                        ticket_number = ($(`#ticket_number`).val()||"")._trim(),
                        origin_id = ORIGIN_ID,
                        route = $(`#route`).val()._trim(),
                        destination = [{ location_id: DESTINATION_ID }],
                        vehicle_id = $(`#vehicle option:selected`).val(),
                        trailer = TRAILER,
                        driver_id = $(`#driver_id option:selected`).val(),
                        checker_id = $(`#checker_id option:selected`).val(),
                        helper_id = $(`#helper_id option:selected`).val(),
                        comments = $(`#comments`).val()._trim(),
                        attachments = ATTACHMENTS.get(CLIENT.dsName),
                        incomplete = false,
                        invalid = false,
                        invalid_arr = [],
                        css_default = {"background-color":"white"},
                        css_error = {"background-color":"#ffe4e4"},
                        vehicleChanged = false,
                        historyOptions = {
                            fields: [
                                {
                                    key: "vehicle_id",
                                    customTitle: "Vehicle",
                                    dataExtended: true,
                                    data: LIST["vehicles"],
                                    dataCompareKey: "_id",
                                    dataValueKey: "name",
                                    customExternalFunction: function(){
                                        vehicleChanged = true;
                                    }
                                },
                                {
                                    key: "origin_id",
                                    customTitle: "Origin",
                                    dataExtended: true,
                                    data: LIST["geofences"],
                                    dataCompareKey: "_id",
                                    dataValueKey: "short_name"
                                },
                                {
                                    key: "driver_id",
                                    customTitle: "Driver",
                                    dataExtended: true,
                                    data: LIST["vehicle_personnel"],
                                    dataCompareKey: "_id",
                                    dataValueKey: "name"
                                },
                                {
                                    key: "checker_id",
                                    customTitle: "Checker",
                                    dataExtended: true,
                                    data: LIST["vehicle_personnel"],
                                    dataCompareKey: "_id",
                                    dataValueKey: "name"
                                },
                                {
                                    key: "helper_id",
                                    customTitle: "Helper",
                                    dataExtended: true,
                                    data: LIST["vehicle_personnel"],
                                    dataCompareKey: "_id",
                                    dataValueKey: "name"
                                },
                                {
                                    key: "scheduled_date",
                                    type: "date",
                                    format: "MMM DD, YYYY"
                                },
                                {
                                    key: "status",
                                    type: "status",
                                },
                                {
                                    key: "late_entry",
                                    type: "bool",
                                },
                                {
                                    key: "destination",
                                    custom: true,
                                    customFunction: function(original,updated){
                                        var __fromDestination = getGeofence(original[0].location_id) || {};
                                        var __toDestination = getGeofence(updated[0].location_id) || {};
                                        var isSame = __fromDestination.short_name == __toDestination.short_name;

                                        return (!isSame) ? `• Destination changed from '${__fromDestination.short_name||""}' to '${__toDestination.short_name||""}'.` : null;
                                    }
                                },
                                {
                                    key: "attachments",
                                    type: "attachments"
                                },
                            ]
                        };
                        
                    console.log("TRAILER",TRAILER)
                    _id = shipment_number;

                    if(isStatusIncomplete()){
                        var url = `/api/dispatch/${CLIENT.id}/${USER.username}`,
                            method = "POST";

                        body.origin_id = origin_id;
                        body.route = route;
                        body.destination = destination;
                        body.vehicle_id =  Number(vehicle_id);
                        body.trailer = trailer;
                        body.comments = comments;
                        body.attachments = ATTACHMENTS.get(CLIENT.dsName);
                        body.username = USER.username;
                        
                        if(CLIENT.id == "wilcon"){
                            body.ticket_number = ticket_number;
                            body.driver_id = driver_id;
                            body.checker_id = checker_id;
                            body.helper_id = helper_id;
                            
                            (scheduled_date) ? body.scheduled_date = new Date(scheduled_date).toISOString() : null;
                            (shift_schedule) ? body.shift_schedule = shift_schedule : null;
                        }

                        // check for difference (if update only)
                        historyOptions.excludeKeys = ["status","vehicleData","username"];
                        body = HISTORY.check(__originalObj,body,USER.username,historyOptions);

                        var changesKey = false;
                        Object.keys(body).forEach(key => {
                            (key.indexOf("history.") > -1 ) ? changesKey = key : null;
                        });

                        if(changesKey) {// can make, if no hisotry, submit button will remain disabled..
                            MODAL.CONFIRMATION_W_FIELD({
                                content: `Please provide a reason for updating this entry.`,
                                confirmCloseCondition: true,
                                confirmButtonText: "Submit",
                                cancelButtonText: "Cancel",
                                confirmCallback: function(field_val){
                                    body[changesKey] += `<br><br>Reason for update: ${field_val.bold()}`;
                                    _submit_();
                                },
                                cancelCallback: function(){
                                    $(`#submit`).html(`Submit`).attr("disabled",false);
                                }
                            });
                        } else {
                            _submit_();
                        }
                        // end check for difference (if update only)

                        function _submit_(){
                            $(`.main-content .clearfix`).css({"pointer-events": "none"});
                            $(button).html(`<i class="la la-spinner la-spin mr-2"></i>${buttonLoadingText}`).attr("disabled",true);
                            
                            if(has_id === true){
                                url = `/api/dispatch/${CLIENT.id}/${USER.username}/${_id}`;
                                method = "PUT";
                            } else {
                                if(CLIENT.id != "wilcon"){
                                    body = $.extend(body,{_id});
                                }
                            }
                            // body = $.extend(new_data,body);
                            
                            GET.AJAX({
                                url,
                                method,
                                headers: {
                                    "Content-Type": "application/json; charset=utf-8",
                                    "Authorization": SESSION_TOKEN
                                },
                                data: JSON.stringify(body)
                            }, function(docs){
                                $(`#confirm-modal,#overlay`).remove(); 
                                if(docs.ok == 1){
                                    console.log(docs);
                                    var message,sticky = false;
                                    if(clientCustom.autoGeneratedId === true){
                                        message = `<br>Shipment Number: <b>${docs.sequence}</b>`;
                                        sticky = true;
                                    }
                                    (method == "PUT") ? TOASTR.UPDATEDSUCCESSFULLY() : TOASTR.CREATEDSUCCESSFULLY(message,sticky);
                                    $(`.main-content .clearfix`).css({"pointer-events": ""});
                                    $(`#overlay`).remove();
                                } else {
                                    console.log(docs.error);
                                    $(button).html(buttonDefaultText).attr("disabled",false);
                                    $(`.main-content .clearfix`).css({"pointer-events": ""});
                                }
                            },function(error){
                                console.log(error);
                                $(button).html(buttonDefaultText).attr("disabled",false);
                                $(`.main-content .clearfix`).css({"pointer-events": ""});
                                if(error.status == 409){} else {
                                    TOASTR.ERROR(error.responseJSON);
                                }
                            });
                        }
                    } else {
                        if(clientCustom.autoGeneratedId === true){
                            $(`#shipment_number`).css(css_default);
                        } else {
                            if(_id.isEmpty() || !regex.test(_id)){
                                invalid = true;
                                invalid_arr.push("shipment_number");
                            } else {
                                $(`#shipment_number`).css(css_default);
                            }
                        }
                        // (origin_id == null || (origin_id != null && origin_id.isEmpty())) ? invalid_arr.push("origin") : $(`#origin`).css(css_default);
                        (route == null || (route != null && route.isEmpty())) ? invalid_arr.push("route") : $(`#route`).css(css_default);
                        (vehicle_id == null || (vehicle != null && vehicle_id.isEmpty())) ? invalid_arr.push("vehicle") : $(`#vehicle`).next(".select2-container").find(".select2-selection").css(css_default);
                        
                        if(CLIENT.id == "wilcon"){
                            (ticket_number == null || (ticket_number != null && ticket_number.isEmpty())) ? invalid_arr.push("ticket_number") : $(`#ticket_number`).css(css_default);
                            (driver_id == null || (driver_id != null && driver_id.isEmpty())) ? invalid_arr.push("driver_id") : $(`#driver_id`).css(css_default);
                            (checker_id == null || (checker_id != null && checker_id.isEmpty())) ? invalid_arr.push("checker_id") : $(`#checker_id`).css(css_default);
                            (helper_id == null || (helper_id != null && helper_id.isEmpty())) ? invalid_arr.push("helper_id") : $(`#helper_id`).css(css_default);
                            (scheduled_date == null || (scheduled_date != null && scheduled_date.isEmpty())) ? invalid_arr.push("scheduled_date") : $(`#scheduled_date`).css(css_default);
                            (shift_schedule == null || (shift_schedule != null && shift_schedule.isEmpty())) ? invalid_arr.push("shift_schedule") : $(`#shift_schedule`).css(css_default);
                        } else {
                            (trailer == null || (trailer != null && trailer.isEmpty())) ? invalid_arr.push("trailer") : $(`#trailer`).next(".select2-container").find(".select2-selection").css(css_default);
                        }

                        $.each(invalid_arr, function(i,val){
                            if($(`#${val}`).next(".select2-container").find(".select2-selection").length > 0){
                                $(`#${val}`).next(".select2-container").find(".select2-selection").css(css_error);
                            } else {
                                $(`#${val}`).css(css_error);
                            }
                            incomplete = true;
                        });

                        if(invalid === true || disabledSumitButton === true){
                            $(`#error`).html(`<div class="alert alert-danger alert-dismissible mb-1 role="alert">
                                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                    <span aria-hidden="true">×</span>
                                                </button>
                                                <i class="la la-times-circle"></i> Please fill all the required fields
                                            </div>`).show();
                            $("#modal").animate({ scrollTop: 0 }, "fast");

                            if(CLIENT.id != "wilcon"){
                                if(!regex.test(_id)) {
                                    $(`#error`).append(ALERT.HTML.ERROR(`Invalid shipment number indicated. Field should contain eight (8) numerical digit.`,"mb-1"));
                                }
                            }
                        } else {
                            if(incomplete === true) {
                                // warn staut is PLAN
                                MODAL.CONFIRMATION({
                                    content: `You have not filled in all of the required fields. This will be saved as <span class="text-info font-bold">PLAN</span><sup style="font-size: 8px;">**</sup> instead. Do you wish to proceed?<span style="font-size: 9px;margin-left: 15px;font-style: italic;" class="d-block text-left mt-5">**Shipments with status <span class="text-info font-bold">PLAN</span> will be ignored during event process.</span>`,
                                    confirmCloseCondition: true,
                                    confirmButtonText: "Proceed",
                                    confirmBGStyle: "background-color:#64b03a;",
                                    confirmCallback: function(){
                                        status = "plan";
                                        SUBMITFORM();
                                        $(`#confirm-modal`).remove(); 
                                    }
                                });
                            } else {
                                console.log("HIIII");
                                checkSelectedVehicleWithinGeofence().then(() => {
                                    console.log("HEY");
                                    body.late_entry = late_data_entry;
                                    
                                    (__tempStat) ? __status = __tempStat : null;
                                    (__status && __status != "plan") ? status = __status : null;

                                    SUBMITFORM();

                                }).catch(error => {
                                    console.log(error);
                                });
                            } 
                        }

                        function SUBMITFORM(){
                            var url = `/api/dispatch/${CLIENT.id}/${USER.username}`,
                                method = "POST";

                            body.origin_id = origin_id;
                            body.route = route;
                            body.destination = destination;
                            body.vehicle_id = Number(vehicle_id);
                            body.trailer = trailer;
                            body.vehicleData = __vehicleData;
                            body.comments = comments;
                            body.attachments = ATTACHMENTS.get(CLIENT.dsName);
                            body.status = status;
                            body.username = USER.username;
                            body.version = VERSION;
                            
                            if(CLIENT.id == "wilcon"){
                                body.ticket_number = ticket_number;
                                body.driver_id = driver_id;
                                body.checker_id = checker_id;
                                body.helper_id = helper_id;

                                (scheduled_date) ? body.scheduled_date = new Date(scheduled_date).toISOString() : null;
                                (shift_schedule) ? body.shift_schedule = shift_schedule : null;
                            
                                if(scheduled_date && !withinSchedule(scheduled_date,shift_schedule)){
                                    if(status != "plan"){
                                        status = "scheduled";
                                        body.status = status;
                                    }
                                }
                            }

                            // check for difference (if update only)
                            var selectedCheckIn = false;
                            historyOptions.excludeKeys = ["events_captured","vehicleData","username"];
                            historyOptions.customChanges = [
                                function(){
                                    var message = null;
                                    if(vehicleOriginGeofence || vehicleDestinationGeofence){
                                        if(__originalObj){
                                            var found = false;
                                            Object.keys((__originalObj.events_captured||{})).forEach(key => {
                                                if(moment(Number(key)).format('HH:mm:ss') === moment(vehicleOriginGeofence.events[0].timestamp).format('HH:mm:ss')){
                                                    found = true;
                                                }
                                            });
                                            if(found == true){
                                                message = null;
                                            } else {
                                                var checkinTime = DATETIME.FORMAT(vehicleOriginGeofence.events[0].timestamp);
                                                message = `Selected <u>${checkinTime}</u> check-in date & time.`;
                                                selectedCheckIn = true;
                                            }
                                        } else {
                                            message = null;
                                        }
                                    } else {
                                        message = null;
                                    }
                                    return message;
                                } 
                            ];

                            body = HISTORY.check(__originalObj,body,USER.username,historyOptions);
                            body.selectedCheckIn = selectedCheckIn;

                            var changesKey = false;
                            Object.keys(body).forEach(key => {
                                (key.indexOf("history.") > -1 ) ? changesKey = key : null;
                            });

                            if(__originalObj){
                                if(__originalObj.route != route || Number(__originalObj.vehicle_id) != Number(vehicle_id) || vehicleOriginGeofence || vehicleDestinationGeofence){
                                    body.events_captured = __events_captured;
                                } else {
                                    body.events_captured = __originalObj.events_captured;
                                }
                            } else {
                                body.events_captured = __events_captured;
                            }
                            
                            if(changesKey && !["plan"].includes(__originalObj.status) ) {// can make, if no hisotry, submit button will remain disabled..
                                MODAL.CONFIRMATION_W_FIELD({
                                    content: `Please provide a reason for updating this entry.`,
                                    confirmCloseCondition: true,
                                    confirmButtonText: "Submit",
                                    cancelButtonText: "Cancel",
                                    confirmCallback: function(field_val){
                                        body[changesKey] += `<br><br>Reason for update: ${field_val.bold()}`;
                                        _submit_();
                                    },
                                    cancelCallback: function(){
                                        $(`#submit`).html(`Submit`).attr("disabled",false);
                                    }
                                });
                            } else {
                                _submit_();
                            }
                            // end check for difference (if update only)

                            function _submit_(){
                                $(`.main-content .clearfix`).css({"pointer-events": "none"});
                                $(button).html(`<i class="la la-spinner la-spin mr-2"></i>${buttonLoadingText}`).attr("disabled",true);

                                if(has_id === true){
                                    url = `/api/dispatch/${CLIENT.id}/${USER.username}/${_id}`;
                                    method = "PUT";
                                } else {
                                    if(CLIENT.id != "wilcon"){
                                        body = $.extend(body,{_id});
                                    }
                                }
                                // body = $.extend(new_data,body);
                                if(body.late_entry === true){
                                    var inTransitKey = OBJECT.getKeyByValue(__events_captured,"in_transit");
                                    var _route = getRoute(route);
                                    var date =  (inTransitKey) ? new Date(Number(inTransitKey)) : new Date(),
                                        transit_time = DATETIME.HH_MM(null,_route.transit_time),
                                        hours = transit_time.hour,
                                        minutes = transit_time.minute;
                                    
                                    body.departure_date = date.toISOString();
                                    body.destination[0].etd = date.toISOString();

                                    if(!inTransitKey){
                                        body.events_captured[date.getTime()] = "in_transit";
                                        body.events_captured = OBJECT.sortByKey(body.events_captured);
                                    }
                                
                                    (hours)?date.setHours(date.getHours() + Number(hours)):null;
                                    (minutes)?date.setMinutes(date.getMinutes() + Number(minutes)):null;
                                    
                                    body.destination[0].eta = date.toISOString();
                                }
                                body.vehicleChanged = vehicleChanged;
                                GET.AJAX({
                                    url,
                                    method,
                                    headers: {
                                        "Content-Type": "application/json; charset=utf-8",
                                        "Authorization": SESSION_TOKEN
                                    },
                                    data: JSON.stringify(body)
                                }, function(docs){
                                    $(`#confirm-modal,#overlay`).remove(); 
                                    if(docs.ok == 1){
                                        console.log(docs);
                                        var message,sticky = false;
                                        if(clientCustom.autoGeneratedId === true){
                                            message = `<br>Shipment Number: <b>${docs.sequence}</b>`;
                                            sticky = true;
                                        }
                                        (method == "PUT") ? TOASTR.UPDATEDSUCCESSFULLY() : TOASTR.CREATEDSUCCESSFULLY(message,sticky);
                                        $(`.main-content .clearfix`).css({"pointer-events": ""});
                                        $(`#overlay`).remove();
                                    } else {
                                        console.log(docs.error);
                                        $(button).html(buttonDefaultText).attr("disabled",false);
                                        $(`.main-content .clearfix`).css({"pointer-events": ""});
                                        TOASTR.ERROR({statusText:"Shipment # already exists."},`<br><br><a id="toastr-link" href="javascript:void(0);">Click here to Load Existing Entry</a><br><br>or Tap anywhere to close`,{ timeOut: 0, extendedTimeOut: 0 });
                                        $("body").on('click', `#toastr-link`,function(e){
                                            e.stopImmediatePropagation();
                                            // do not use _id or shipment_number for value of {_id:...}. It will use the previous form ID.
                                            // should also be before body.append.
                                            var __id = $(`#shipment_number`).val()._trim();
                                            $(`#overlay`).remove();
                                            $(`body`).append(MODAL.CREATE.EMPTY(`View Dispatch Entry`,modalViews.dispatch.form()));
                                            DISPATCH.FUNCTION.form({ _id: __id });
                                            $("html, body,#modal").animate({ scrollTop: 0 }, "fast");
                                        });
                                    }
                                },function(error){
                                    console.log(error);
                                    $(button).html(buttonDefaultText).attr("disabled",false);
                                    $(`.main-content .clearfix`).css({"pointer-events": ""});
                                    if(error.status == 409){
                                        TOASTR.ERROR({statusText:"Shipment # already exists."},`<br><br><a id="toastr-link" href="javascript:void(0);">Click here to Load Existing Entry</a><br><br>or Tap anywhere to close`,{ timeOut: 0, extendedTimeOut: 0 });
                                        $("body").on('click', `#toastr-link`,function(e){
                                            e.stopImmediatePropagation();
                                            // do not use _id or shipment_number for value of {_id:...}. It will use the previous form ID.
                                            // should also be before body.append.
                                            var __id = $(`#shipment_number`).val()._trim();
                                            $(`#overlay`).remove();
                                            $(`body`).append(MODAL.CREATE.EMPTY(`View Dispatch Entry`,modalViews.dispatch.form()));
                                            DISPATCH.FUNCTION.form({ _id: __id });
                                            $("html, body,#modal").animate({ scrollTop: 0 }, "fast");
                                        });
                                    } else {
                                        TOASTR.ERROR(error.responseJSON);
                                    }
                                });
                            }
                        }
                    }
                });
                /******** END SUBMIT ENTRY ********/
            }
        },
        status: function(_id){
            $("html, body").animate({ scrollTop: 0 }, "fast");

            if(_id != null){
                var obj = LIST["dispatch"].find(x => x._id.toString() == _id.toString());
                if(obj){
                    // check if shipment data is complete
                    obj.destination[0] = obj.destination[0] || {};
                    var complete = true,
                        allowTransit = true,
                        checking = function(x){
                            var bool = true;
                            Object.keys(x).forEach(key => {
                                x[key].forEach(_key => {
                                    var _obj = obj[_key];
                                    if(Array.isArray(obj[key])){ // for now, specifically for destination
                                        _obj = obj[key][0][_key];
                                    } else if(typeof obj[key] === 'object' && obj[key] !== null){
                                        _obj = obj[key][_key];
                                    } 
                                    if(_obj){
                                        _obj = _obj.toString() || "";
                                        if(!_obj.toString()) bool = false;
                                    } else {
                                        bool = false;
                                    }
                                });
                            });
                            return bool;
                        };
                    complete = checking({
                        main: ["origin_id","route","departure_date","vehicle_id"],
                        destination: ["location_id","eta","etd"],
                    });
                    allowTransit = checking({
                        main: ["origin_id","route","vehicle_id"],
                        destination: ["location_id"],
                    });

                    $(`[status]`).removeClass("active disabled").addClass("inactive");
                    $(`[status="${obj.status}"]`).removeClass("inactive").addClass("active");

                    if(complete === true || allowTransit === true){
                        var allowedButtons = `[status=assigned]`,
                            statusSelector = function(arr){
                                var newArr = [];
                                arr.forEach(stat => {
                                    newArr.push(`[status=${stat}]`);
                                });
                                return newArr.join(",");
                            };
                        
                        $(`[status]`).addClass("disabled");

                        if(["plan"].includes(obj.status)){
                            allowedButtons = statusSelector([obj.status,"assigned"]);
                        } else if(["assigned"].includes(obj.status)){
                            allowedButtons = statusSelector([obj.status,"plan","queueingAtOrigin","processingAtOrigin","idlingAtOrigin","in_transit","incomplete"]);
                        } else if(["queueingAtOrigin"].includes(obj.status)){
                            allowedButtons = statusSelector([obj.status,"plan","assigned","processingAtOrigin","idlingAtOrigin","in_transit","incomplete"]);
                        } else if(["processingAtOrigin"].includes(obj.status)){
                            allowedButtons = statusSelector([obj.status,"plan","assigned","queueingAtOrigin","idlingAtOrigin","in_transit","incomplete"]);
                        } else if(["idlingAtOrigin"].includes(obj.status)){
                            allowedButtons = statusSelector([obj.status,"plan","assigned","queueingAtOrigin","processingAtOrigin","in_transit","incomplete"]);
                        } else if(["in_transit"].includes(obj.status)){
                            allowedButtons = statusSelector([obj.status,"plan","assigned","queueingAtOrigin","processingAtOrigin","idlingAtOrigin","onSite","complete","incomplete"]);
                        } else if(["onSite"].includes(obj.status)){
                            allowedButtons = statusSelector([obj.status,"plan","assigned","queueingAtOrigin","processingAtOrigin","idlingAtOrigin","in_transit","returning","incomplete"]);
                        } else if(["returning"].includes(obj.status)){
                            allowedButtons = statusSelector([obj.status,"plan","assigned","queueingAtOrigin","processingAtOrigin","idlingAtOrigin","in_transit","onSite","complete","incomplete"]);
                        } else if(["incomplete"].includes(obj.status)){
                            allowedButtons = statusSelector([obj.status,"plan","assigned","queueingAtOrigin","processingAtOrigin","idlingAtOrigin","in_transit","onSite","returning","complete","incomplete"]);
                        }

                        $(allowedButtons).click(function(){
                            var new_status = $(this).attr("status");
                            var route = getRoute(obj.route);
                            if(obj.status == "incomplete" && new_status != obj.status){
                                MODAL.CONFIRMATION_W_FIELD({
                                    content: `You are about to change the status of this entry from Incomplete to ${GET.STATUS(new_status).text}. Please indicate your reason/s below.`,
                                    confirmCloseCondition: true,
                                    confirmButtonText: "Submit",
                                    cancelButtonText: "Cancel",
                                    confirmCallback: function(field_val){
                                        GET.AJAX({
                                            url: `/api/dispatch/${CLIENT.id}/${USER.username}/${_id}`,
                                            method: "PUT",
                                            headers: {
                                                "Content-Type": "application/json; charset=utf-8",
                                                "Authorization": SESSION_TOKEN
                                            },
                                            data: JSON.stringify({status: new_status, i_c_reason: field_val || "", transit_time: route.transit_time, type:"statusUpdate"})
                                        }, function(docs){
                                            if(docs.ok == 1){
                                                $(`#confirm-modal,#overlay`).remove(); 
                                                TOASTR.UPDATEDSUCCESSFULLY();
                                            } else {
                                                $(`#confirm-modal`).remove();
                                                toastr.error("Something went wrong</br></br>Error Code - ec005/03");
                                            }
                                        });
                                    }
                                });
                            } else {
                                MODAL.CONFIRMATION({
                                    content: `Are you sure you want to update the status?`,
                                    confirmCloseCondition: true,
                                    confirmCallback: function(){
                                        GET.AJAX({
                                            url: `/api/dispatch/${CLIENT.id}/${USER.username}/${_id}`,
                                            method: "PUT",
                                            headers: {
                                                "Content-Type": "application/json; charset=utf-8",
                                                "Authorization": SESSION_TOKEN
                                            },
                                            data: JSON.stringify({status: new_status, transit_time: route.transit_time, type:"statusUpdate"})
                                        }, function(docs){
                                            if(docs.ok == 1){
                                                $(`#confirm-modal,#overlay`).remove(); 
                                                TOASTR.UPDATEDSUCCESSFULLY();
                                            } else {
                                                $(`#confirm-modal`).remove();
                                                toastr.error("Something went wrong</br></br>Error Code - ec005/03");
                                            }
                                        });
                                    }
                                });
                            }
                        }).removeClass("disabled");
                    } else {
                        $(`#incomplete-data`).text("Unable to update status if shipment data is incomplete.");
                        $(`[status]`).addClass("disabled");
                        $(`[status=${obj.status}]`).removeClass("disabled");
                    }
                } else {
                    toastr.error("Something went wrong</br></br>Error Code - ec005/01");
                }
            } else {
                toastr.error("Something went wrong</br></br>Error Code - ec005/02");
            }
        },
        history: function(history={}){
            var str = "";
            var paddingTop = "pt-3";
                
            const original = history.original;
            // delete history.original;
            // delete history.vehicle;
            const sorted = OBJECT.sortByKey(history);
            const ordered = {};
            Object.keys(sorted).reverse().forEach(function(key) {
                ordered[key] = history[key];
            });
            
            Object.keys(ordered).forEach(key => {
                if(!["original","vehicle"].includes(key)){
                    var _key = DATETIME.FORMAT(new Date(Number(key)),"MMM D, YYYY, h:mm A"),
                        _desc = ordered[key] || "-";
                        
                    if(_desc.indexOf("System - Status updated") > -1){
                        // ' -> old setup. Do not remove.
                        var status = GET.TEXT_BETWEEN(_desc,"<status>","</status>") || GET.TEXT_BETWEEN(_desc,"'","'");
                        str += ` <div class="${paddingTop}">
                                    <small class="text-muted">${_key}</small>
                                    <div>Status updated to ${GET.STATUS(status).html}</div>
                                </div>`;
                    } else if(_desc.indexOf("Manual - Status updated") > -1){
                        var status = GET.TEXT_BETWEEN(_desc,"<status>","</status>") || GET.TEXT_BETWEEN(_desc,"'","'");
                        var username = GET.TEXT_BETWEEN(_desc,"<username>","</username>");
                        var user = getUser(username) || {};
                        str += ` <div class="${paddingTop}">
                                    <small class="text-muted">${_key}</small>
                                    <div>Status manually updated to ${GET.STATUS(status).html} by ${user.name||username||"-"}.</div>
                                </div>`;
                    } else {
                        var status = GET.TEXT_BETWEEN(_desc,"<status>","</status>");
                        var username = GET.TEXT_BETWEEN(_desc,"<username>","</username>");
                        var user = getUser(username) || {};
                        if(status){
                            _desc = _desc.replace(`<status>${status}</status>`,GET.STATUS(status).html);
                        }
                        if(user.name){
                            _desc = _desc.replace(`<username>${username}</username>`,user.name||username);
                        }

                        str += ` <div class="${paddingTop}">
                                    <small class="text-muted">${_key}</small>
                                    <div>${_desc}</div>
                                </div>`;
                    }
                }              
            });
            if(original){
                var _obj = JSON.parse(original);
                console.log("_obj",_obj);
                str += ` <div class="${paddingTop}">
                            <small class="text-muted">${DATETIME.FORMAT(new Date(_obj.posting_date),"MMM D, YYYY, h:mm A")}</small>
                            <div>Entry posted with status ${GET.STATUS(_obj.status).html}</div>
                        </div>`;
            } 
            return str;
        },
        import: function(){
            $(`#download-template-btn`).click(function(){
                function exportTableToExcel(filename) {
                    // get table
                    var table = document.getElementById("report-hidden");
                    // convert table to excel sheet
                    var wb = XLSX.utils.table_to_book(table, {sheet:"Customer Report"});
                    // write sheet to blob
                    var blob = new Blob([s2ab(XLSX.write(wb, {bookType:'xlsx', type:'binary'}))], {
                        type: "application/octet-stream"
                    });
                    // return sheet file
                    return saveAs(blob, `${filename}.xlsx`);
                }
                
                function s2ab(s) {
                    var buf = new ArrayBuffer(s.length);
                    var view = new Uint8Array(buf);
                    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
                    return buf;
                }
                

                if(CLIENT.id == "wilcon"){
                    if(GGS.STATUS.SHIFT_SCHEDULE && GGS.STATUS.VEHICLES && GGS.STATUS.ROUTES) {
                        $(`body`).append(CUSTOM.IMPORT_TEMPLATE.wilcon());
                        exportTableToExcel("Wilcon Import Template");
                    } else {
                        toastr.info("Data is still loading. Please try again in few seconds.");
                    }
                }
                if(CLIENT.id == "coket1"){
                    $(`body`).append(CUSTOM.IMPORT_TEMPLATE.coket1());
                    exportTableToExcel("CokeT1 Import Template");
                }
                $(`#report-hidden,#temp-link,[data-SheetName]`).remove();
            });


            var fileExtension = ["xls","xlsx","ods"];
            $('.dropify').dropify();
            $(`.dropify`).change(function(){
                $(`[success_count],[error_count]`).html(0);
                $(`[error_list],[warning_list]`).html("");
                $(`#reportDL`).hide();
            });
            $(`#import-btn`).click(function(){
                $(this).html(`<i class="la la-spinner la-spin mr-2"></i>Import`).attr("disabled",true);
                $(`.dropify-wrapper`).css("pointer-events","none");
                _read(`.dropify`);
            });


            var dayOffLabel = Object.keys(vehiclePersonnelCalendarOptions).map(i => vehiclePersonnelCalendarOptions[i].label).join("/");
            var requiredFields = {
                coket1: [
                    { name: "Shipment Number", key: "_id", required: true, identifier: true },
                    { name: "Origin", required: true, error: ["Origin does not exist in database."] },
                    { name: "Destination", required: true, error: ["Destination does not exist in database."] },
                    { name: "Truck Name", required: true, error: ["Truck Name does not exist in database."] },
                    { name: "Comments", key: "comments", required: false },
                ],
                wilcon: [
                    { name: "Ticket Number", key: "ticket_number", required: true },
                    { name: "Route", required: true, error: ["Route does not exist in database."] },
                    { name: "Truck Name", required: true, error: ["Truck Name does not exist in database."] },
                    { name: "Driver", required: true, error: ["Driver's Name does not exist in database.","Selected Driver is on "+dayOffLabel+"."] },
                    { name: "Checker", required: true, error: ["Checker's Name does not exist in database.","Selected Checker is on "+dayOffLabel+"."] },
                    { name: "Helper", required: true, error: ["Helper's Name does not exist in database.","Selected Helper is on "+dayOffLabel+"."] },
                    { name: "Scheduled Date", required: true, codependent: "Shift Schedule", error: ["Scheduled Date entered is not a valid date.","Scheduled Date is before current date/time."] },
                    { name: "Shift Schedule", required: true, codependent: "Scheduled Date", error: ["Shift Schedule is before current date/time.","Shift Schedule does not exist in database."] },
                    { name: "Comments", key: "comments", required: false },
                ],
            },
            identifierKey = (requiredFields[CLIENT.id].find(x => x.identifier === true)||{}).name;
            
            function _read(el){
                var ext = $(el).val().split('.').pop().toLowerCase();
                
                console.log(fileExtension,ext);
                if(fileExtension.includes(ext) == true){
                    var reader = new FileReader();
                    reader.onload = function () {
                        var result = reader.result;
                        // console.log(result);
                        var workbook = XLSX.read(result, { type: 'binary' }),
                            XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[0]],{defval: ""}),
                            finalRowObject = [];

                        $.each(XL_row_object, function(key,value){
                            // XL_row_object[key].key = GENERATE.RANDOM(36);
                            var hasValue = false;
                            requiredFields[CLIENT.id].forEach(_val_ => {
                                if(XL_row_object[key][_val_.name]){
                                    hasValue = true;
                                }
                            });
                            if(hasValue === true){
                                finalRowObject.push(XL_row_object[key]);
                            }
                        });
                        console.log("finalRowObject",finalRowObject)
                        // requiredFields[CLIENT.id].forEach(_val_ => {
                        checkData(finalRowObject,$(el)[0].files[0].name);
                    };
                    // start reading the file. When it is done, calls the onload event defined above.
                    ($(el)[0].files.length > 0) ? reader.readAsBinaryString($(el)[0].files[0]) : console.log("No file selected.");
                } else {
                    toastr.error(`Only ${fileExtension.join(", ")} files are allowed.`);
                    
                    $(`#import-btn`).html(`Import`).attr("disabled",false);
                    $(`.dropify-wrapper`).css("pointer-events","");
                    $(`.dropify-clear`).click();
                }
            }
            function checkData(import_data,filename){
                var errorList = {},
                    warningList = {},
                    totalRows = import_data.length,
                    snList = [],
                    batchedData = [],
                    importData = [],
                    finalImportData = import_data,
                    fixDate = function(str){ // do not delete yet. might be useful
                        str = str._trim();
                        
                        var final = "",
                            index = 0,
                            arr = str.split(""),
                            _charAt = ["number","number","/","number","number","/","number","number","number","number","space","number","number",":","number","number",":","number","number","space","AM/PM/am/pm"];

                        alignDateWithFormat();
                        function alignDateWithFormat(){
                            $.each(_charAt, function(i, format) { 
                                index = i;
                                if(format == "number"){
                                    if(isNaN(Number(arr[i]))){
                                        if(arr[i-1] == ":" || arr[i-1] == "/"){
                                            arr.insert(i,"0");
                                        } else {
                                            arr.insert(i-1,"0");
                                        }
                                        return false;
                                    }
                                } else if(format == "space"){
                                    if(arr[i] != " "){
                                        arr.insert(i," ");
                                        return false;
                                    }
                                } else if(format == "/"){
                                    if(arr[i] != format){
                                        arr.insert(i,"/");
                                        return false;
                                    }
                                } else if(format == ":"){
                                    if(arr[i] != format){
                                        arr.insert(i,":");
                                        return false;
                                    }
                                }  else if(format == "AM/PM/am/pm"){
                                    if(format.indexOf(arr[i]) == -1){
                                        arr.insert(i,"AM");
                                        return false;
                                    }
                                }
                            });
                            if(index >= _charAt.length-1) {
                                var new_date = arr.join("");
                                new_date = new_date._trim();
                                final = Date.parse(new_date);
                            } else {
                                alignDateWithFormat();
                            }
                        }
                        return final;
                    },
                    parseDateExcel = (excelTimestamp) => {
                        const secondsInDay = 24 * 60 * 60;
                        const excelEpoch = new Date(1899, 11, 31);
                        const excelEpochAsUnixTimestamp = excelEpoch.getTime();
                        const missingLeapYearDay = secondsInDay * 1000;
                        const delta = excelEpochAsUnixTimestamp - missingLeapYearDay;
                        const excelTimestampAsUnixTimestamp = excelTimestamp * secondsInDay * 1000;
                        const parsed = excelTimestampAsUnixTimestamp + delta;
                        return isNaN(parsed) ? null : parsed;
                    };
                
                if(import_data.length > 0){
                    var count = 0;
                    import_data.forEach((val,i) => {
                        var origin = getGeofence(val["Origin"],"short_name"),
                            destination = getGeofence(val["Destination"],"short_name"),
                            route = getRoute(val["Route"]),
                            vehicle = getVehicle(val["Truck Name"],"name"),
                            driver = (LIST["vehicle_personnel"]||[]).find(x => x.name.toString() == val["Driver"].toString() && x.occupation == "Driver"),
                            checker = (LIST["vehicle_personnel"]||[]).find(x => x.name.toString() == val["Checker"].toString() && x.occupation == "Checker"),
                            helper = (LIST["vehicle_personnel"]||[]).find(x => x.name.toString() == val["Helper"].toString() && x.occupation == "Helper"),
                            scheduled_date = DATETIME.FORMAT(parseDateExcel(val["Scheduled Date"]),"MM/DD/YYYY"),
                            shift_schedule = getShiftSchedule(val["Shift Schedule"]),
                            errorShipment = false;

                        function isDayOff(dates){
                            var dayOff = false;
                            var momentScheduledDate = moment(scheduled_date, 'MM/DD/YYYY', true);
                            console.log(momentScheduledDate.isValid(),scheduled_date,dates);
                            if(momentScheduledDate.isValid()){
                                var scheduled_dateISO = new Date(scheduled_date).toISOString();
        
                                Object.keys(dates).forEach(key => {
                                    var selectedDates = dates[key] || [];
                                    if(selectedDates.includes(scheduled_dateISO)){
                                        dayOff = true;
                                    }
                                });
                            }
                            return dayOff;
                        }
                        
                        isDayOff((driver||{}).dates || {}) ? driver = null : null;
                        isDayOff((checker||{}).dates || {}) ? checker = null : null;
                        isDayOff((helper||{}).dates || {}) ? helper = null : null;

                        var checkIfDone = function(){
                                if(count == import_data.length){
                                    FETCH();
                                }
                            },
                            obj = {
                                origin_id: "",
                                route: "",
                                destination: [{}],
                                vehicle_id: 0,
                                username: USER.username,
                                status: "assigned",
                                posting_date: new Date().toISOString(),
                                late_entry: false,
                                driver_id: "",
                                checker_id: "",
                                helper_id: "",
                                events_captured: {}
                            },
                            addToNoteList = function(text,causes,key,type,isField){
                                key = key || (Number(val.__rowNum__) + 1);
                                if(type == "error"){
                                    var causesHTML = (causes) ? `<ul level=2><li>${causes.join("</li><li>")}</li></ul>` : "";
                                    (errorList[key]) ? errorList[key].push(text+causesHTML) : errorList[key] = [(text+causesHTML)];
                                    // (errorList[key]) ? errorList[key].push(text) : errorList[key] = [text];
                                    errorShipment = true;
                                } 
                                if(type == "warning"){
                                    var causesHTML = (causes) ? `<ul level=2><li>${causes.join("</li><li>")}</li></ul>` : "";
                                    text = (isField === true) ? `<small class="text-muted">[FIELD NOT SAVED]</small> ${text}` : text;
                                    (warningList[key]) ? warningList[key].push(text+causesHTML) : warningList[key] = [(text+causesHTML)];
                                }
                                obj.status = "plan";
                            },
                            checkSelectedVehicleWithinGeofence = function(){
                                return new Promise((resolve,reject) => {
                                    if(["plan","scheduled"].includes(obj.status)) {
                                        resolve();
                                    } else {
                                        function detectVehicleLocation(tries){
                                            tries = tries || 0;
                                            console.log(USER.apiKey);
                                            GET.AJAX({
                                                "url": `https://${CLIENT.ggsURL}/comGpsGate/api/v.1/applications/${CLIENT.appId}/geofences/${origin.geofence_id}/users?FromIndex=0&PageSize=500`,
                                                "method": "GET",
                                                "headers": {
                                                    "Authorization": USER.apiKey
                                                },
                                            }, function(response){
                                                console.log("Vehicles:",response);
                                                obj.late_entry = true;
                                                response.forEach(val => {
                                                    if(val.username == vehicle.username){
                                                        obj.late_entry = false;
                                                    }
                                                });

                                                var vehicleAjax = function(le){
                                                    GET.AJAX({
                                                        url: `/api/vehicles_history/${CLIENT.id}/${USER.username}/${vehicle._id}`,
                                                        method: "GET",
                                                        headers: {
                                                            "Authorization": SESSION_TOKEN
                                                        },
                                                    }, function(docs){
                                                        if(docs.length > 0){
                                                            var __tempStat = null;
                                                            var dgeofenceName = destination.short_name;
                                                            var ogeofenceName = origin.short_name;
                
                                                            var doc = docs[0],
                                                                loc = doc.location || []; // don't name it 'location', it will refresh page (page.location??)
                
                                                            var getIndexOf = function(text,arr,op){
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
                                                            },
                                                            getStat_Time = function(oEvents,dEvents){
                                                                var gStat = "assigned",
                                                                    gCond = false;
                                                                    
                                                                var tempDateTime = new Date().getTime();
                                                                for(var i = oEvents.length-1; i >= 0; i--){
                                                                    var val = oEvents[i],
                                                                        eventDate = new Date(val.timestamp).getTime(),
                                                                        hourDiff = Math.abs(tempDateTime - eventDate) / 36e5;
                                                                    // in transit
                                                                    // do not remove gStat = in_transit.
                                                                    if(((val.RULE_NAME == "Inside Geofence" && val.stage == "end") || (val.RULE_NAME == "Outside Geofence" && val.stage == "start")) && le == true && gStat != "in_transit" && hourDiff < 24) {
                                                                            gCond = true;
                                                                            gStat = "in_transit";
                                                                            obj.events_captured[eventDate] = "in_transit";
                                                                            tempDateTime = new Date(val.timestamp).getTime();
                                                                    }
                                                                    // idling
                                                                    if(getIndexOf(val.RULE_NAME,["Inside","Idle"],"and") && !obj.events_captured[eventDate] && hourDiff < 24){
                                                                        gCond = true;
                                                                        obj.events_captured[eventDate] = "idlingAtOrigin";
                                                                    }
                                                                    // processing
                                                                    if(getIndexOf(val.RULE_NAME,["Inside Geofence","Processing"],"and") && !obj.events_captured[eventDate] && hourDiff < 24){
                                                                        gCond = true;
                                                                        obj.events_captured[eventDate] = "processingAtOrigin";
                                                                    }
                                                                    // queueing
                                                                    if(getIndexOf(val.RULE_NAME,["Inside Geofence","Queueing"],"and") && !obj.events_captured[eventDate] && hourDiff < 24){
                                                                        gCond = true;
                                                                        obj.events_captured[eventDate] = "queueingAtOrigin";
                                                                    }

                                                                    // temp Status
                                                                    if(!obj.events_captured[eventDate] && hourDiff < 24){
                                                                        obj.events_captured[eventDate] = "tempStatus";
                                                                    }
                                                                }
                                                                

                                                                // if late entry and no in_transit timestamp
                                                                if(le == true && !OBJECT.getKeyByValue(obj.events_captured,"in_transit")){
                                                                    // last timestamp will be in_transit
                                                                    obj.events_captured[new Date().getTime()] = "in_transit";
                                                                }

                                                                // sort events_captured
                                                                var sortedEvents = OBJECT.sortByKey(obj.events_captured);
                                                                var i = 0;
                                                                var lastTimestamp;
                                                                Object.keys(sortedEvents).forEach(key => {
                                                                    if(i == 0){
                                                                        i++;
                                                                        // if first timestamp is not in transit
                                                                        if(sortedEvents[key] != "in_transit"){
                                                                            // change value to entered_origin
                                                                            sortedEvents[key] = "entered_origin";
                                                                        }
                                                                    }
                                                                    lastTimestamp = key;
                                                                });

                                                                // loop to delete tempStatus
                                                                Object.keys(sortedEvents).forEach(key => {
                                                                    if(sortedEvents[key] == "tempStatus"){
                                                                        delete sortedEvents[key];
                                                                    }
                                                                });
                                                                obj.events_captured = sortedEvents;

                                                                // status will be last timestamp's value
                                                                gStat = sortedEvents[lastTimestamp];
                                                                if(gStat == "entered_origin"){
                                                                    gStat = "assigned";
                                                                }

                                                                // CICO AT ORIGIN
                                                                if(le == true){
                                                                    var InTransitDateTime = OBJECT.getKeyByValue(obj.events_captured,"in_transit");

                                                                    gStat = "in_transit";
            
                                                                    dEvents.forEach(val => {
                                                                        var eventDate = new Date(val.timestamp).getTime(),
                                                                            hourDiff = Math.abs(tempDateTime - eventDate) / 36e5;
            
                                                                        // in transit (if no datetime)
                                                                        if(val.stage == "start" && !InTransitDateTime && hourDiff < 24){
                                                                            gCond = true;
                                                                            obj.events_captured[eventDate] = "in_transit";
                                                                        }
                                                                        // end in transit (if no datetime)

                                                                        // HERE!!!!!!!!!

                                                                        if(clientCustom.roundtrip) {
                                                                            // onSite
                                                                            if(!((val.RULE_NAME == "Inside Geofence" && val.stage == "end") || (val.RULE_NAME == "Outside Geofence" && val.stage == "start")) && gStat == "in_transit" && !obj.events_captured[eventDate]){
                                                                                gStat = "onSite";
                                                                                gCond = true;
                                                                                obj.events_captured[eventDate] = "onSite";
                                                                            }
                                                                            // end onSite
                                                                            

                                                                            // returning
                                                                            if(((val.RULE_NAME == "Inside Geofence" && val.stage == "end") || (val.RULE_NAME == "Outside Geofence" && val.stage == "start")) && gStat == "onSite" && !obj.events_captured[eventDate]){
                                                                                gStat = "returning";
                                                                                gCond = true;
                                                                                obj.events_captured[eventDate] = "returning";
                                                                            }
                                                                            // end returning

                                                                            
                                                                            // complete ORIGINNNNN
                                                                            // if(gStat == "returning" && isOrigin === true){
                                                                            //     _ids.complete.push(doc._id);
                                                                            // }
                                                                            // end complete
                                                                        } else {
                                                                            // complete
                                                                            if(gStat == "in_transit" && !obj.events_captured[eventDate] && (Number(InTransitDateTime) < eventDate) && hourDiff < 24){
                                                                                gStat = "complete";
                                                                                gCond = true;
                                                                                obj.events_captured[eventDate] = "complete";
                                                                            }
                                                                            // end complete
                                                                        }

                                                                        // HERE!!!!!!!!!
                                                                    });
                                                                }
                
                                                                return (gCond) ? gStat : null;
                                                            };
                
                                                            if(le) {
                                                                for(var i = loc.length-1; i >= 0; i--){
                                                                    if(loc[i].short_name == ogeofenceName){
                                                                        obj.late_entry = true;
                                                                        __tempStat = getStat_Time(loc[i].events,[]);
                                                                        // Truck selected has left the origin. This shipment will be tagged as LATE_DATA_ENTRY and will automatically be saved as IN TRANSIT.
                                                                        // modalAlert(`Truck selected has left the origin. This shipment will be tagged as <b>LATE_DATA_ENTRY</b> and will automatically be saved as <b>IN TRANSIT</b>.`,"WARNING");
                                                                        break;
                                                                    } else {
                                                                        if(loc[i].short_name == dgeofenceName){
                                                                            var prevLoc = loc.slice(0, i),
                                                                                prevHasOrigin = false;
                                                                            for(var j = prevLoc.length-1; j >= 0; j--){
                                                                                if(prevLoc[j].short_name == dgeofenceName){
                                                                                    break;
                                                                                }
                                                                                if(prevLoc[j].short_name == ogeofenceName){
                                                                                    obj.late_entry = true;
                                                                                    __tempStat = getStat_Time(prevLoc[j].events,loc[i].events);
                                                                                    prevHasOrigin = true;
                                                                                    // modalAlert(`Truck selected has left the origin and is already at destination. This shipment will be tagged as <b>LATE_DATA_ENTRY</b>.`,"WARNING");
                                                                                    // Truck selected has left the origin and is already at destination. This shipment will be tagged as LATE_DATA_ENTRY.
                                                                                    break;
                                                                                }
                                                                            }
                                                                            if(!prevHasOrigin){
                                                                                obj.late_entry = false;
                                                                                __tempStat = "assigned";
                                                                                // modalAlert(`Truck selected is <u>not</u> within the origin. It is assumed that the truck is enroute to origin.`,"INFO");
                                                                                // Truck selected is <u>not</u> within the origin. It is assumed that the truck is enroute to origin.
                                                                            }
                                                                            break;
                                                                        }
                                                                    }
                                                                }
                                                                if(__tempStat == null) {
                                                                    console.log("__tempStat is null");
                                                                    __tempStat = "assigned";
                                                                    obj.late_entry = false;
                                                                    // modalAlert(`Truck selected is <u>not</u> within the origin. It is assumed that the truck is enroute to origin.`,"INFO");
                                                                    // Truck selected is <u>not</u> within the origin. It is assumed that the truck is enroute to origin.
                                                                }
                                                            } else {
                                                                if(loc[loc.length-1].short_name == ogeofenceName){
                                                                    __tempStat = getStat_Time(loc[loc.length-1].events);
                                                                }
                                                                if(__tempStat == null) {
                                                                    __tempStat = "assigned";
                                                                    obj.late_entry = false;
                                                                    console.log("__tempStat is null but vehicle is inside origin.");
                                                                }
                                                                // modalAlert(`Truck selected is within the origin.`,"INFO");
                                                                // Truck selected is within the origin.
                                                            }
            
                                                            var tempEventsCaptured = OBJECT.sortByKey(obj.events_captured);
                                                            obj.events_captured = tempEventsCaptured;

                                                            obj.status = __tempStat;
                                                            console.log("EYOOOEOEOEOOEOEO",le,__tempStat,obj.events_captured);

                                                            resolve();
                                                        } else {
                                                            // modalAlert(`Truck selected does not exist.`,"ERROR");
                                                            reject({
                                                                message: `Truck selected does not exist.`
                                                            });
                                                        }
                                                    });
                                                };
                                                
                                                vehicleAjax(obj.late_entry);
                                            }, function(error){
                                                if(error.status == 0 && tries < MAX_TRIES){
                                                    tries++;
                                                    detectVehicleLocation(tries);
                                                }
                                                TOASTR.ERROR(error);
                                            });
                                        }

                                        detectVehicleLocation();
                                    }
                                });
                            },
                            checkVehicleInfoAndScheduledDateTime = function(){
                                return new Promise((resolve,reject) => {
                                    console.log("scheduled_date",scheduled_date)
                                    if(CLIENT.id == "wilcon" && vehicle && driver && checker && helper && scheduled_date && shift_schedule && scheduled_date != "-"){
                                        var filter = {
                                            $and: [
                                                {
                                                    $or: [
                                                        { vehicle_id: Number(vehicle._id), },
                                                        { driver_id: driver._id },
                                                        { checker_id: checker._id },
                                                        { helper_id: helper._id },
                                                    ]
                                                },
                                                { scheduled_date: new Date(scheduled_date).toISOString(), },
                                                { shift_schedule: shift_schedule._id, },
                                                { status: { $nin: ["plan","complete","incomplete"]}, }
                                            ],
                                        };
                                        $.ajax({
                                            url: `/api/dispatch/${CLIENT.id}/${USER.username}/vehicle_info/${JSON.stringify(filter)}`,
                                            method: "GET",
                                            timeout: 90000, // 1 minute and 30 seconds
                                            headers: {
                                                "Authorization": SESSION_TOKEN
                                            },
                                            async: true
                                        }).done(function (docs) {
                                            console.log("docs",docs);
                                            if(docs.length > 0){
                                                var message = [];
                                                docs.forEach(val => {
                                                    if(val.vehicle_id == Number(vehicle._id)){
                                                        message.push(`Truck is already assigned to shipment # ${val._id}.`);
                                                    }
                                                    if(val.driver_id.toString() == driver._id.toString()){
                                                        message.push(`Driver is already assigned to shipment # ${val._id}.`);
                                                    }
                                                    if(val.checker_id.toString() == checker._id.toString()){
                                                        message.push(`Checker is already assigned to shipment # ${val._id}.`);
                                                    }
                                                    if(val.helper_id.toString() == helper._id.toString()){
                                                        message.push(`Helper is already assigned to shipment # ${val._id}.`);
                                                    }
                                                });
                                                if(message.length > 0){
                                                    addToNoteList(`<b>Error:</b><br><ul level=2><li>${message.join("</li><li>")}</li></ul>`,null,val[identifierKey],"error");
                                                }
                                            }
                                            resolve();
                                        });
                                    } else {
                                        resolve();
                                    }
                                });
                            };
                            
                        if((val[identifierKey]||val.__rowNum__).toString()._trim()){
                            requiredFields[CLIENT.id].forEach(_val_ => {
                                if(val[_val_.name].toString()._trim()){
                                    // okay
                                    if(_val_.key){
                                        obj[_val_.key] = val[_val_.name].toString()._trim();
                                    } else {
                                        checkkkkk(_val_.name,_val_.error);
                                    }
                                } else {
                                    if(_val_.required === true){
                                        // error
                                        addToNoteList(`Missing data in '${_val_.name}'. `,null,val[identifierKey],"warning");
                                    } else {
                                        if(_val_.codependent){
                                            if(val[_val_.codependent]){
                                                // error
                                                addToNoteList(`Missing data in '${_val_.name}'. `,null,val[identifierKey],"warning");
                                            } else {
                                                // okay. no error
                                                obj[_val_.key] = "";
                                            }
                                        }
                                    }
                                }
                            });
                            
                            // make checkVehicleInfoAndScheduledDateTime() first because status might be "PLAN" if same driver/checker/vehicle etc.
                            checkVehicleInfoAndScheduledDateTime().then(function(){
                                checkSelectedVehicleWithinGeofence().then(function(){
                                    console.log("importData",importData);
                                    var message = [];
                                    importData.forEach(_val => {
                                        if(_val.status != "plan"){
                                            if(_val.scheduled_date == obj.scheduled_date && _val.shift_schedule == obj.shift_schedule) {
                                                if(Number(_val.vehicle_id) == Number(obj.vehicle_id)){
                                                    message.push(`Truck is already assigned to ROW #: ${Number(_val.__rowNum__)+1}.`);
                                                }
                                                if(obj.driver_id && (_val.driver_id||"").toString() == (obj.driver_id||"").toString()){
                                                    message.push(`Driver is already assigned to ROW #: ${Number(_val.__rowNum__)+1}.`);
                                                }
                                                if(obj.checker_id && (_val.checker_id||"").toString() == (obj.checker_id||"").toString()){
                                                    message.push(`Checker is already assigned to ROW #: ${Number(_val.__rowNum__)+1}.`);
                                                }
                                                if(obj.helper_id && (_val.helper_id||"").toString() == (obj.helper_id||"").toString()){
                                                    message.push(`Helper is already assigned to ROW #: ${Number(_val.__rowNum__)+1}.`);
                                                }
                                            }
                                        }
                                    });
                                    if(message.length > 0){
                                        addToNoteList(`<b>Error:</b><br><ul level=2><li>${message.join("</li><li>")}</li></ul>`,null,val[identifierKey],"error");
                                    }
                                    
                                    if(obj.status == "plan"){
                                        addToNoteList(`Incomplete data. Shipment is saved as <b style="color: #5bc0de;">PLAN</b>.`,null,val[identifierKey],"warning");
                                    }
                                    if(errorShipment === false){
                                        snList.push(obj._id);
                                        obj.__rowNum__ = val.__rowNum__;
                                        importData.push(obj);
                                    }
    
                                    count++;
                                    checkIfDone();
                                });
                            });
                        } else {
                            addToNoteList(`Missing data in '${identifierKey}'.`,null,val[identifierKey],"error");
                        }
                        
                        function checkkkkk(columnKey,error){
                            if(columnKey == "Origin"){
                                if(origin){
                                    obj.origin_id = origin._id;
                                    if(obj.origin_id && obj.destination[0].location_id){
                                        var _route = LIST["routes"].find(x => (x.origin_id == origin._id && destination && x.destination_id == destination._id));
                                        if(_route){
                                            obj.route = _route._id;
                                        } else {
                                            addToNoteList(`Invalid data in 'Route'.  Possible causes:`,["The origin and destination is not a valid route."],val[identifierKey],"warning",true);
                                        }
                                    }
                                } else {
                                    addToNoteList(`Invalid data in '${columnKey}'.  Possible causes:`,error,val[identifierKey],"warning",true);
                                }
                            }

                            if(columnKey == "Destination"){
                                if(destination){
                                    obj.destination[0].location_id = destination._id;
                                    if(obj.origin_id && obj.destination[0].location_id){
                                        var _route = LIST["routes"].find(x => (x.origin_id == origin._id && destination && x.destination_id == destination._id));
                                        if(_route){
                                            obj.route = _route._id;
                                        } else {
                                            addToNoteList(`Invalid data in 'Route'.  Possible causes:`,["The origin and destination is not a valid route."],val[identifierKey],"warning",true);
                                        }
                                    }
                                } else {
                                    addToNoteList(`Invalid data in '${columnKey}'.  Possible causes:`,error,val[identifierKey],"warning",true);
                                }
                            }

                            if(columnKey == "Route"){
                                if(route){
                                    obj.route = route._id;
                                    
                                    obj.origin_id = route.origin_id;
                                    obj.destination[0].location_id = route.destination_id;

                                    origin = getGeofence(route.origin_id);
                                    destination = getGeofence(route.destination_id);
                                } else {
                                    addToNoteList(`Invalid data in '${columnKey}'.  Possible causes:`,error,val[identifierKey],"warning",true);
                                }
                            }

                            if(columnKey == "Truck Name"){
                                if(vehicle){
                                    obj.vehicle_id = vehicle._id;
                                } else {
                                    addToNoteList(`Invalid data in '${columnKey}'.  Possible causes:`,error,val[identifierKey],"warning",true);
                                }
                            }

                            if(columnKey == "Driver"){
                                if(driver){
                                    obj.driver_id = driver._id;
                                } else {
                                    addToNoteList(`Invalid data in '${columnKey}'.  Possible causes:`,error,val[identifierKey],"warning",true);
                                }
                            }

                            if(columnKey == "Checker"){
                                if(checker){
                                    obj.checker_id = checker._id;
                                } else {
                                    addToNoteList(`Invalid data in '${columnKey}'.  Possible causes:`,error,val[identifierKey],"warning",true);
                                }
                            }

                            if(columnKey == "Helper"){
                                if(helper){
                                    obj.helper_id = helper._id;
                                } else {
                                    addToNoteList(`Invalid data in '${columnKey}'.  Possible causes:`,error,val[identifierKey],"warning",true);
                                }
                            }

                            function getMaxDateSchedule(){
                                var shiftArr = (shift_schedule._id||"").split(" - ");
                                var shiftMinTime = shiftArr[0];
                                var shiftMaxTime = shiftArr[1];
                                var beginningTime = moment(shiftMinTime, 'h:mm A');
                                var endTime = moment(shiftMaxTime, 'h:mm A');
                                var dateTemp = (!beginningTime.isBefore(endTime)) ? moment(new Date(formattedScheduledDate)).add(1,"day").format("MM/DD/YYYY") : formattedScheduledDate;

                                return `${dateTemp}, ${shiftMaxTime}`;
                            }

                            if(columnKey == "Scheduled Date"){
                                var momentScheduledDate = moment(scheduled_date, 'MM/DD/YYYY', true);
                                var formattedScheduledDate = momentScheduledDate.format("MM/DD/YYYY");
                                if(momentScheduledDate.isValid()){
                                    if(obj.status != "plan" && shift_schedule){
                                        
                                        if(moment(getMaxDateSchedule(), 'MM/DD/YYYY, hh:mm A', true).isBefore() || moment(getMaxDateSchedule(), 'MM/DD/YYYY, h:mm A', true).isBefore()){
                                            addToNoteList(`Invalid data in '${columnKey}'.  Possible causes:`,error,val[identifierKey],"error",true);
                                        } else {
                                            obj.scheduled_date = new Date(scheduled_date).toISOString();
                                            if(withinSchedule(scheduled_date,shift_schedule._id)) {
                                                obj.status = "assigned";
                                            } else {
                                                obj.status = "scheduled";
                                            }
                                        }
                                    }
                                } else {
                                    addToNoteList(`Invalid data in '${columnKey}'.  Possible causes:`,error,val[identifierKey],"error",true);
                                }
                            }

                            if(columnKey == "Shift Schedule"){
                                if(shift_schedule){
                                    var momentScheduledDate = moment(scheduled_date, 'MM/DD/YYYY', true);
                                    var formattedScheduledDate = momentScheduledDate.format("MM/DD/YYYY");

                                    if(obj.status != "plan" && momentScheduledDate.isValid()){
                                        if(moment(getMaxDateSchedule(), 'MM/DD/YYYY, hh:mm A', true).isBefore() || moment(getMaxDateSchedule(), 'MM/DD/YYYY, h:mm A', true).isBefore()){
                                            addToNoteList(`Invalid data in '${columnKey}'.  Possible causes:`,error,val[identifierKey],"error",true);
                                        } else {
                                            obj.shift_schedule = shift_schedule._id;
                                            if(withinSchedule(scheduled_date,shift_schedule._id)) {
                                                obj.status = "assigned";
                                            } else {
                                                obj.status = "scheduled";
                                            }
                                        }
                                    }
                                } else {
                                    addToNoteList(`Invalid data in '${columnKey}'.  Possible causes:`,error,val[identifierKey],"error",true);
                                }
                            }
                        }
                        
                    });
                } else {
                    errorList["--"] = [`Empty columns`];
                    FETCH();
                }
                function FETCH(){
                    function addToNoteList(text,causes,key,type,isField){
                        if(type == "error"){
                            (errorList[key]) ? errorList[key].push(text) : errorList[key] = [text];
                        } 
                        if(type == "warning"){
                            var causesHTML = (causes) ? `<ul level=2><li>${causes.join("</li><li>")}</li></ul>` : "";
                            text = (isField === true) ? `<small class="text-muted">[FIELD NOT SAVED]</small> ${text}` : text;
                            (warningList[key]) ? warningList[key].push(text+causesHTML) : warningList[key] = [(text+causesHTML)];
                        }
                    }
                    GET.AJAX({
                        url: `/api/dispatch/${CLIENT.id}/${USER.username}/batch/${JSON.stringify(snList)}`,
                        method: "GET",
                        headers: {
                            "Authorization": SESSION_TOKEN
                        },
                    }, function(docs){
                        docs.forEach(val => {
                            addToNoteList("Shipment number already exists",null,val._id,"error");
                            importData = $.grep(importData, function(x){ return x._id != val._id});
                        });
                        importData.forEach(val => {
                            batchedData.push(val);
                        });
                        
                        console.log("Temp Final:",finalImportData);
                        console.log("Error List:",errorList);
                        console.log("Batched Data:",batchedData);
                        if(batchedData.length > 0){
                            GET.AJAX({
                                url: `/api/dispatch/${CLIENT.id}/${USER.username}/batch`,
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json; charset=utf-8",
                                    "Authorization": SESSION_TOKEN
                                },
                                data: JSON.stringify({batchedData}),
                            }, function(docs){
                                if(!docs.error){
                                    reportImport(batchedData.length);
                                } else {
                                    console.log(docs.error);
                                    batchedData.forEach(val => {
                                        if(docs.error.status == 409){
                                            errorList[val._id||val.ticket_number] = ["Record already exists."];
                                        } else {
                                            errorList[val._id||val.ticket_number] = [docs.error.statusText];
                                        }
                                    });
                                    reportImport(0);
                                }
                            }, function(error) {
                                console.log(error);
                                batchedData.forEach(val => {
                                    if(error.status == 409){
                                        errorList[val._id||val.ticket_number] = ["Record already exists."];
                                    } else {
                                        errorList[val._id||val.ticket_number] = [error.statusText];
                                    }
                                });
                                reportImport(0);
                            });
                        } else {
                            reportImport(0);
                        }
                        function reportImport(success_count){
                            Object.keys(errorList).forEach(key => {
                                if(warningList[key]){
                                    delete warningList[key];
                                }
                            });

                            toastr.info("Done. Please check the report for import details.");
                            $(`[success_count]`).html(success_count);
                            $(`[error_count]`).html(Object.keys(errorList).length);
                            var errorHTML = (Object.keys(errorList).length > 0) ? "" : "--",
                                warningHTML = (Object.keys(warningList).length > 0) ? "" : "--",
                                regex = /(<([^>]+)>)|(&lt;([^>]+)&gt;)/ig,
                                addLine = function(){
                                    return `----------------------------------------------------------------------------------`;
                                },
                                reportDL = `Report Import:\n\n${addLine()}\nFilename: ${filename}\nDate and time: ${DATETIME.FORMAT(new Date())}\nTotal # of Rows: ${totalRows} rows\n${addLine()}\nSuccessful imports: ${success_count} rows\nWarnings:`,
                                nbsp = function(num){
                                    var str = "";
                                    for(var i = 0; i < num; i++){
                                        str += "\u00a0";
                                    }
                                    return str;
                                },
                                htmlToText = function(appendAttr,listAttr){
                                    $(`body`).append(`<ul ${appendAttr} style="display:none;">${$(`[${listAttr}]`).html()}</ul>`);
                                    var snHTML = $(`[${appendAttr}] sn`);
                                    snHTML.each((i,sn) => {
                                        var text = $(sn).text();
                                        $(sn).html(`${nbsp(3)}_BIGBULLET_ ${text}`);
                                    });
    
                                    var level2HTML = $(`[${appendAttr}] ul[level=2]`);
                                    level2HTML.each((i,ul) => {
                                        var ulText = $(ul).html(),
                                            text = ulText.replace(/<li>/g,`\n${nbsp(12)}_SMALLBULLET_ `).replace(/<\/li>/g,"");
                                        $(ul).html(text);
                                    });
                                    
                                    var level1HTML = $(`[${appendAttr}] ul[level=1]`);
                                    level1HTML.each((i,ul) => {
                                        var ulText = $(ul).html(),
                                            text = ulText.replace(/<li>/g,`${nbsp(7)}_DASH_ `).replace(/<\/li>/g,"\n ");
                                        $(ul).html(text);
                                    });
                                    var noTags = $(`[${appendAttr}]`).html().replace(regex , "").replace(/^\s*[\r\n]/gm,"")._trim().replace(/&nbsp;/g," ").replace(/_BIGBULLET_/g,"•").replace(/_SMALLBULLET_/g,"∙").replace(/_DASH_/g,"-");
                                    reportDL += `\n${noTags}`;
                                };
                            Object.keys(warningList).forEach(key => {
                                warningHTML += `<li>
                                                    <sn><span class="text-muted">${identifierKey||"Row #"}: </span><b>${key}</b></sn>
                                                    <ul level=1><li>${warningList[key].join("</li><li>")}</li></ul>
                                                </li>`;
                            });
                            $(`[warning_list]`).html(warningHTML);
                            htmlToText("warning_note","warning_list");

                            reportDL += `\n${addLine()}\nUnsuccessful imports: ${Object.keys(errorList).length} rows\nErrors:`
                            Object.keys(errorList).forEach(key => {
                                errorHTML += `<li>
                                                <sn><span class="text-muted">${identifierKey||"Row #"}: </span><b>${key}</b></sn>
                                                <ul level=1><li>${errorList[key].join("</li><li>")}</li></ul>
                                            </li>`;
                            });
                            $(`[error_list]`).html(errorHTML);
                            htmlToText("error_note","error_list");
                            reportDL += `\n${addLine()}`;

                            $(`[warning_note],[error_note]`).remove();

                            $(`#import-btn`).html(`Import`).attr("disabled",false);
                            $(`.dropify-wrapper`).css("pointer-events","");
                            $(`.dropify-clear`).click();
                            $(`#reportDL`).attr("href",`data:text/plain;charset=UTF-8,${encodeURIComponent(reportDL)}`).show();
                        }
                    });
                }
            }
        },
        add_row:{
            destination:function(i,data,routeId,noAction){
                var _row = GENERATE.RANDOM(36),
                    destination = getGeofence(data.location_id) || {},
                    route = getRoute(routeId) || {},
                    transit_hh_mm = DATETIME.HH_MM(null,route.transit_time),
                    cico_hh_mm = DATETIME.HH_MM(null,destination.cico),
                    readonly = (noAction===true)?"readonly":"",
                    new_row = `<tr _row="${_row}">
                                <td class="text-muted">${i}</td>
                                <td><input location type="text" class="form-control" autocomplete="off" readonly></td>
                                <td transit_time>${transit_hh_mm.hour||`<span class="text-muted">HH</span>`} : ${transit_hh_mm.minute||`<span class="text-muted">MM</span>`}</td>
                                <td cico>${cico_hh_mm.hour||`<span class="text-muted">HH</span>`} : ${cico_hh_mm.minute||`<span class="text-muted">MM</span>`}</td>
                            </tr>`;
                $(`#tbl-destination tbody`).append(new_row);
                return _row;
            },
        }, 
        monitoring_deleted: function(){
            var dispatchModule = (CLIENT.id == "wilcon") ? "dispatch_mod2_deleted" : "dispatch_deleted";

            /******** TABLE ********/
            var urlParams = new URLSearchParams(window.location.search),
                __data = CRYPTO.DECRYPT(urlParams.get('data')),
                table_id = '#tbl-dispatch_deleted',
                urlPath = "user_action",
                uniTitle = "Dispatch Entry (Deleted)",
                filter = USER.filters.dispatch_deleted || {},
                dt = null,
                _new_ = false,
                donePopulate = false,
                rowData = function(obj){
                    var de = new Dispatch(obj,table_id);
                    var row = de.row();
                    
                    row["Deleted By"] = obj.deleted_by||"-";
                    row["Deleted Date"] = DATETIME.FORMAT(obj.deleted_date);
                    return TABLE.COL_ROW(null,row).row;
                },
                populateTable = function(newlyLoaded,disableClearTable,doNotClearList,_filter_){
                    if(!doNotClearList) LIST[urlPath] = [];
                    filter = _filter_ || USER.filters.dispatch_deleted || {};
                    try {
                        filter = JSON.parse(filter);
                    } catch(error){}

                    var __filter = ($.isEmptyObject(filter)) ? {timestamp: FILTER.DATERANGE()} : filter;
                    __filter.collection = "dispatch";

                    var dt_buttons = TABLE.BUTTONS({
                        goto: PAGE.GET(),
                        loadView: ["create","create-admin","import"],
                        actions:{
                            refresh: function(){
                                populateTable(null);
                            },
                            column: function(){
                                $(`#export-container`).hide("slide", {direction:'right'},100);
                                $(`#filter-container`).hide("slide", {direction:'right'},100);
                                $(`#cv-container`).toggle("slide", {direction:'right'},100);
                            },
                            filter: function(){
                                $(`#export-container`).hide("slide", {direction:'right'},100);
                                $(`#cv-container`).hide("slide", {direction:'right'},100);
                                $(`#filter-container`).toggle("slide", {direction:'right'},100);
                            },
                            export: function(){
                                $(`#filter-container`).hide("slide", {direction:'right'},100);
                                $(`#cv-container`).hide("slide", {direction:'right'},100);
                                $(`#export-container`).toggle("slide", {direction:'right'},100);
                            },
                        }
                    });
                    
                    donePopulate = false;
                    if(dt && !disableClearTable) {
                        dt.clear().draw();
                        $(".dataTables_empty").text("Loading...");
                    }
                    GET.AJAX({
                        url: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(__filter)}/count`,
                        method: "GET",
                        headers: {
                            "Authorization": SESSION_TOKEN
                        },
                    }, function(count){
                        var minWidth = 1, maxWidth = 1, origPerc = 0,totalPerc = 0;
                        console.log("count",count);
                        TABLE.POPULATE({
                            url:`${urlPath}/${CLIENT.id}/${USER.username}/all`,
                            goto: PAGE.GET(),
                            commentTitle: uniTitle,
                            withFilter: true,
                            filter: __filter,
                            urlPath,
                            withPagination: true,
                            newlyLoaded,
                            dataTableOptions: {
                                columns: TABLE.COL_ROW(CUSTOM.COLUMN[dispatchModule]).column,
                                createdRow: function (row, data, dataIndex) {
                                    var _row = data._row,
                                        _id = data._id;
                                    $(row).attr(`_row`, data._row);
                                    
                                    TABLE.ROW_LISTENER({table_id,_row,urlPath:urlPath,_id,
                                        additionalListeners: function(){
                                            $(table_id).on('click', `[_row="${_row}"] [view],[_row="${_row}"] + tr.child [view]`,function(e){
                                                e.stopImmediatePropagation();
                                                $(`body`).append(modalViews.dispatch.fullView(data._id));
                                                $("html, body,#modal").animate({ scrollTop: 0 }, "fast");
                                            });
                                        }
                                    });
                                },
                                order: [[ 1, "desc" ]],
                                dom: 'lB<"toolbar">frti<"tbl-progress-bar">p',
                                buttons: dt_buttons
                            },
                            table_id,
                            initializeCallback: function(data,_dt){
                                dt = _dt;
                                searchEvent();
                                initializeFilter();
                                
                                $(table_id).on( 'search.dt length.dt page.dt', function () {
                                    if(GGS.STATUS.REGIONS && GGS.STATUS.CLUSTERS && GGS.STATUS.GEOFENCES && GGS.STATUS.VEHICLES && GGS.STATUS.ROUTES){
                                        TABLE.FINISH_LOADING.UPDATE();
                                        setTimeout(function(){ TABLE.FINISH_LOADING.UPDATE(); },300);
                                    }
                                });

                                // // initialize loading bar
                                $("div.tbl-progress-bar").html(LOADING.PROGRESSBAR.UI()).css({position:"absolute",left:"0px",bottom:"-6px",width:"160px",height:"20px"});
                                LOADING.PROGRESSBAR.INITIALIZE();
                            },
                            populateCallback: function(data){
                                if($(table_id).length > 0){
                                    donePopulate = true;
                                    $(`#search-btn`).css({"pointer-events":"","color":""});
                                    
                                    var rows = [];
                                    $.each(data, function(i,val){
                                        var _deData={};
                                        try {
                                            _deData = JSON.parse(val.data);
                                        } catch(error){}
                                        _deData.deleted_by = val.username;
                                        _deData.deleted_date = val.timestamp;
                                        rows.push(rowData(_deData));
                                    });
                                    dt.rows.add(rows).draw(false);
                                    TABLE.FINISH_LOADING.START_CHECK();

                                    
                                    $("div.tbl-progress-bar").show();
                                    var a = count/LIMIT;
                                    var wholeNumber = Math.floor(a);
                                    var modulo = a % 1;
                                    if(modulo > 0) wholeNumber++
                                    (origPerc) ? null : origPerc = (100 / wholeNumber);
                                    totalPerc = totalPerc + origPerc;
                                    minWidth = maxWidth;
                                    maxWidth = Math.floor(totalPerc);
                                    LOADING.PROGRESSBAR.MOVE(minWidth,maxWidth);
                                }
                            },
                        });
                    });
                },
                initializeFilter = function(){
                    $(`.page-box`).append(SLIDER.COLUMN_VISIBILITY(CUSTOM.COLUMN[dispatchModule])); 
                    $('span.toggle-vis').on( 'click', function (e) {
                        var index = $(this).attr('data-column'),
                            column = dt.column(index);

                        column.visible( ! column.visible() );
                        CUSTOM.COLUMN[dispatchModule][index].visible = column.visible();
                        CUSTOM.COLUMN[dispatchModule][index].bVisible = column.visible();
                        $(table_id).attr("style","");

                        $(`${table_id} thead tr th`).each((i,el) => {
                            if(!$(el).is(":visible")){
                                $(`${table_id} tr:not(.child)`).each((i1,el1) => {
                                    $(el1).find("td").eq(i).hide();
                                });
                            }
                        });
                    });
                    
                    $(`.page-box`).append(SLIDER.EXPORT()); 
                    TABLE.TOOLBAR(dt);
                    $(`.buttons-copy span`).html("Copy Table");
                    $(`.buttons-csv span`).html("Export Table As CSV File");
                    $(`.buttons-excel span`).html("Export Table As Excel File");

                    $(`#_timestamp,#_posting_date`).daterangepicker({
                        opens: 'left',
                        timePicker: true,
                        locale: {
                            format: 'MM/DD/YYYY hh:mm A'
                        },
                        autoUpdateInput: false,
                        autoApply: true
                    }, function(start, end, label) {
                        FILTER.INITIALIZE($(this)["0"].element,start,end,'MM/DD/YYYY hh:mm A');
                        $('.clearable').trigger("input");
                    }).on('apply.daterangepicker', function (ev, picker) {
                        FILTER.INITIALIZE($(this),picker.startDate,picker.endDate,'MM/DD/YYYY hh:mm A');
                        $('.clearable').trigger("input");
                    });

                    if(filter.timestamp) FILTER.INITIALIZE(`#_timestamp`,filter.timestamp["$gte"],filter.timestamp["$lt"],'MM/DD/YYYY hh:mm A');
                    if(filter.posting_date) FILTER.INITIALIZE(`#_posting_date`,filter.posting_date["$gte"],filter.posting_date["$lt"],'MM/DD/YYYY hh:mm A');
                    if(filter.timestamp || filter.posting_date) {
                        $(`#filter-container`).toggle("slide", {direction:'right'},100);
                        $('.clearable').trigger("input");
                        FILTER.STATUS = "new";
                    }
                    
                    FILTER.RESET({
                        dateEl: `#_timestamp`,
                        dateElnoVal: `#_posting_date`,
                        urlPath: "dispatch_deleted",
                        populateTable
                    });
                    $(`#filter-btn`).click(function(){
                        filter = {};
                        var _posting_date = $(`#_posting_date`).val() || "",
                            _timestamp = (_posting_date) ? $(`#_timestamp`).val() : ( $(`#_timestamp`).val() || DEFAULT_DATE);

                        (!_timestamp.isEmpty()) ? filter["timestamp"] = FILTER.DATERANGE(_timestamp,true,true) : null;
                        (!_posting_date.isEmpty()) ? filter["posting_date"] = FILTER.DATERANGE(_posting_date,true,true) : null; 

                        if(FILTER.STATUS != "reset") {} 
                        else {
                            FILTER.STATUS = "new";
                        }

                        USER.filters.dispatch_deleted = filter;
                        
                        GET.AJAX({
                            url: `/api/users/${CLIENT.id}/${USER.username}/${USER.username}`,
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json; charset=utf-8",
                                "Authorization": SESSION_TOKEN
                            },
                            data: JSON.stringify({"filter.dispatch":JSON.stringify(filter)})
                        }, function(docs){
                            console.log("docs",docs);
                        });

                        $(this).html(`<i class="la la-spinner la-spin"></i> Apply`).addClass("disabled");

                        populateTable();
                    });
                },
                searchEvent = function(){
                    var searchText = null,
                        origFilter = null,
                        removeSearchResult = false;
                    dt.on('search.dt', function () {
                        if(dt.page.info().recordsDisplay === 0 && dt.search()){
                            if(donePopulate === true){
                                if($(`#search-alert`).html().isEmpty()) {
                                    $(`#search-alert`).html(ALERT.HTML.INFO(`<span id="alert-message">Click <u id="search-btn" style="cursor: pointer;">here</u> to search for Shipment Number: <b id="search-text">${dt.search()}</b> through all records.</span><span id="no-result-message" style="display:none;"></span>`,"m-3",true)).show();
                                    $(`#search-btn`).click(function(){
                                        $(`#search-btn`).css({"pointer-events":"none","color":"#aaadae"});
                                        searchText = dt.search();
                                        // removeSearchResult = false;
                                        origFilter = filter;
                                        filter = {unique_filter:`_id: ${dt.search()}`};
                                        populateTable(null,true,true,filter);
                                    });
                                } else {
                                    if(searchText === dt.search()){
                                        $(`#alert-message`).hide();
                                        $(`#no-result-message`).html(`No result for Shipment Number: <b id="search-text">${searchText}</b>.`).show();
                                        searchText = null;
                                    } else {
                                        $(`#alert-message`).hide().show();
                                        $(`#no-result-message`).html("").hide();
                                        $(`#search-text`).html(dt.search());
                                    }
                                }
                            }
                        } else {
                            $(`#search-alert`).html("").hide();
                            if(origFilter) {
                                filter = origFilter;
                                origFilter = null;
                            }
                        }
                    });
                };
            __data.for = urlPath;

            
            try {
                filter = JSON.parse(filter);
            } catch (error) {}
            
            LIST[urlPath] = [];
            populateTable(true);
            /******** END TABLE ********/

            /******** TABLE CHECK ********/
            TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                // do not remove ROUTES. For Create/edit
                if(GGS.STATUS.REGIONS && GGS.STATUS.CLUSTERS && GGS.STATUS.GEOFENCES && GGS.STATUS.VEHICLES && GGS.STATUS.TRAILERS && GGS.STATUS.ROUTES && !_new_ && dt && (CLIENT.id != "wilcon" || (CLIENT.id == "wilcon" && GGS.STATUS.VEHICLE_PERSONNEL))){
                    _new_ = true;

                    $.each(LIST["dispatch"], function(i,val){
                        var rowNode = dt.row(`[_row="${val._row}"]`).node();
                        (rowNode) ? dt.row(rowNode).data(rowData(val)) : null;
                    });

                    TABLE.FINISH_LOADING.UPDATE();
                }
            }
            TABLE.FINISH_LOADING.START_CHECK();
            /******** END TABLE CHECK ********/
        },
    }
};
var SHIFT_SCHEDULE = {
    FUNCTION: {
        init: function(){
            var urlPath = "shift_schedule",
                _new_ = false,  
                table = new Table({
                    id: "#tbl-shift_schedule",
                    urlPath,
                    goto: "shift_schedule",
                    dataTableOptions: {
                        columns: TABLE.COL_ROW(CUSTOM.COLUMN.shift_schedule).column,
                        createdRow: function (row, data, dataIndex) {
                            var _row = data._row;
                            $(row).attr(`_row`,_row);
                            table.rowListeners(_row,data._id);
                        },
                        dom: 'lB<"toolbar">frti<"tbl-progress-bar">p',
                    },
                    initializeCallback: function(){
                        TABLE.WATCH({urlPath,rowData:table.addRow,options:function(){TABLE.FINISH_LOADING.START_CHECK();}});
                        TABLE.FINISH_LOADING.UPDATE();
                    }
                });
            table.setButtons({
                loadView: ["create"],
                actions:{
                    create: function(){
                        initializeModal({
                            url: `/api/${urlPath}/${CLIENT.id}/${USER.username}`,
                            method: "POST"
                        });
                    },
                    refresh: function(){ table.countRows(); },
                }
            });
            table.addRow = function(obj){
                var action = TABLE.ROW_BUTTONS(PAGE.GET());
                $(`${table.id} th:last-child`).css({"min-width":action.width,"width":action.width});

                return TABLE.COL_ROW(null,{
                    '_id': obj._id,
                    '_row':  obj._row,
                    'Action': action.buttons,
                }).row;
            };
            table.rowListeners = function(_row,_id){
                TABLE.ROW_LISTENER({table_id:table.id,_row,urlPath,_id,initializeModal});
            };

            var initializeModal = function(x){
                var title = (x.method == "PUT") ? `Edit Shift Schedule` : `Create Shift Schedule`,
                    modalElements = function(obj){
                        obj = obj || {};
                        var timeOptions = [
                            { id: "12:00 AM" },
                            { id: "1:00 AM" },
                            { id: "2:00 AM" },
                            { id: "3:00 AM" },
                            { id: "4:00 AM" },
                            { id: "5:00 AM" },
                            { id: "6:00 AM" },
                            { id: "7:00 AM" },
                            { id: "8:00 AM" },
                            { id: "9:00 AM" },
                            { id: "10:00 AM" },
                            { id: "11:00 AM" },
                            { id: "12:00 PM" },
                            { id: "1:00 PM" },
                            { id: "2:00 PM" },
                            { id: "3:00 PM" },
                            { id: "4:00 PM" },
                            { id: "5:00 PM" },
                            { id: "6:00 PM" },
                            { id: "7:00 PM" },
                            { id: "8:00 PM" },
                            { id: "9:00 PM" },
                            { id: "10:00 PM" },
                            { id: "11:00 PM" },
                        ];
                        return [
                            {title:"Start of Shift",id:"start_shift",type:"select",options:timeOptions,attr:"doNotSave=true"},
                            {title:"End of Shift",id:"end_shift",type:"select",options:timeOptions,attr:"doNotSave=true"},
                            {id:"_id",type:"text"},
                        ];
                    };
                    $(`body`).append(MODAL.CREATE.BASIC({ title, el: modalElements(x.obj) }));

                    $(`#_id`).parent().hide();

                    $(`#start_shift`).change(function(){
                        if($(`#start_shift`).val() && $(`#end_shift`).val()){
                            $(`#_id`).val(`${$(`#start_shift option:selected`).val()} - ${$(`#end_shift option:selected`).val()}`);
                        }
                    });
                    $(`#end_shift`).change(function(){
                        if($(`#start_shift`).val() && $(`#end_shift`).val()){
                            $(`#_id`).val(`${$(`#start_shift option:selected`).val()} - ${$(`#end_shift option:selected`).val()}`);
                        }
                    });

                    MODAL.SUBMIT(x);
            };

            /******** TABLE CHECK ********/
            LIST[urlPath] = LIST[urlPath] || [];
            TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                if(GGS.STATUS.SHIFT_SCHEDULE) {
                    if(!_new_) {
                        _new_ = true;
                        
                        table.initialize();
                        table.populateRows(LIST[urlPath]);
                        table.hideProgressBar();
                    }
                }
            }
            /******** END TABLE CHECK ********/

            TABLE.FINISH_LOADING.START_CHECK();
        }
    }
};
var REPORTS = {
    UI: {
        REPORT_MODAL_01: function(title,_siteTitle){
            return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                        <div id="small-modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                            <div role="document" class="modal-dialog modal-sm">
                                <div class="modal-content">
                                    <div class="modal-header pb-2">
                                        <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                        <h4 class="modal-title" id="myModalLabel2">${title}</h4>
                                    </div>
                                    <div class="modal-body row pt-2">
                                        <div class="col-sm-12">
                                            <small><span class="text-danger">*</span>Select Departure Date Range:</small>
                                            <input id="daterange" type="input" class="form-control">
                                        </div>
                                        <div class="col-sm-12">
                                            <small>${_siteTitle}:</small>
                                            <select id="_site" class="select-basic" style="width:100%;"></select>
                                        </div>
                                        <div class="col-sm-12"> 
                                            <button id="generate-btn" type="button" class="btn btn-primary col-sm-12 mt-4">Generate report</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        },
        REPORT_MODAL_02: function(title,_siteTitle,_dateTitle){
            return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                        <div id="small-modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                            <div role="document" class="modal-dialog modal-sm">
                                <div class="modal-content">
                                    <div class="modal-header pb-2">
                                        <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                        <h4 class="modal-title" id="myModalLabel2">${title}</h4>
                                    </div>
                                    <div class="modal-body row pt-2">
                                        <div class="col-sm-12">
                                            <small><span class="text-danger">*</span>${_dateTitle || "Select Departure Date"}:</small>
                                            <input id="daterange" type="input" class="form-control">
                                        </div>
                                        <div class="col-sm-12">
                                            <small>${_siteTitle}:</small>
                                            <select id="_site" class="select-basic" style="width:100%;"></select>
                                        </div>
                                        <div class="col-sm-12"> 
                                            <button id="generate-btn" type="button" class="btn btn-primary col-sm-12 mt-4">Generate report</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        },
        REPORT_MODAL_03: function(title){
            return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                        <div id="small-modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                            <div role="document" class="modal-dialog modal-sm">
                                <div class="modal-content">
                                    <div class="modal-header pb-2">
                                        <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                        <h4 class="modal-title" id="myModalLabel2">${title}</h4>
                                    </div>
                                    <div class="modal-body row pt-2">
                                        <div class="col-sm-12">
                                            <small><span class="text-danger">*</span>Select Date:</small>
                                            <input id="daterange" type="input" class="form-control">
                                        </div>
                                        <div class="col-sm-12"> 
                                            <button id="generate-btn" type="button" class="btn btn-primary col-sm-12 mt-4">Generate report</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        },
        REPORT_MODAL_04: function(title,_siteTitle,_dateTitle){
            return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                        <div id="small-modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                            <div role="document" class="modal-dialog modal-sm">
                                <div class="modal-content">
                                    <div class="modal-header pb-2">
                                        <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                        <h4 class="modal-title" id="myModalLabel2">${title}</h4>
                                    </div>
                                    <div class="modal-body row pt-2">
                                        <div class="col-sm-12">
                                            <small><span class="text-danger">*</span>Select Date:</small>
                                            <input id="daterange" type="input" class="form-control">
                                        </div>
                                        <div class="col-sm-12">
                                            <small>Plant Site:</small>
                                            <select id="_origin_site" class="select-basic" style="width:100%;"></select>
                                        </div>
                                        <div class="col-sm-12">
                                            <small>Destination Site:</small>
                                            <select id="_destination_site" class="select-basic" style="width:100%;"></select>
                                        </div>
                                        <div class="col-sm-12"> 
                                            <button id="generate-btn" type="button" class="btn btn-primary col-sm-12 mt-4">Generate report</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        },
        REPORT_MODAL_05: function(title,dateTitle="Select Date Range"){
            return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                        <div id="small-modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                            <div role="document" class="modal-dialog modal-sm">
                                <div class="modal-content">
                                    <div class="modal-header pb-2">
                                        <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                        <h4 class="modal-title" id="myModalLabel2">${title}</h4>
                                    </div>
                                    <div class="modal-body row pt-2">
                                        <div class="col-sm-12">
                                            <small><span class="text-danger">*</span>Select Date Range:</small>
                                            <input id="daterange" type="input" class="form-control">
                                        </div>
                                        <div class="col-sm-12"> 
                                            <button id="generate-btn" type="button" class="btn btn-primary col-sm-12 mt-4">Generate report</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        },
        REPORT_MODAL_06: function(title,dateTitle="Select Date Range"){
            return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                        <div id="small-modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                            <div role="document" class="modal-dialog modal-sm">
                                <div class="modal-content">
                                    <div class="modal-header pb-2">
                                        <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                        <h4 class="modal-title" id="myModalLabel2">${title}</h4>
                                    </div>
                                    <div class="modal-body row pt-2">
                                        <div class="col-sm-12"> 
                                            <button id="generate-btn" type="button" class="btn btn-primary col-sm-12 mt-4">Generate report</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        },
        REPORT_MODAL_07: function(title){ // month & year
            var yearOptions = "";
            for(var i = 2020; i < Number(moment().format("YYYY"))+1; i++){
                yearOptions += `<option>${i}</option>`;
            }
            return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                        <div id="small-modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                            <div role="document" class="modal-dialog modal-sm">
                                <div class="modal-content">
                                    <div class="modal-header pb-2">
                                        <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                        <h4 class="modal-title" id="myModalLabel2">${title}</h4>
                                    </div>
                                    <div class="modal-body row pt-2">
                                        <div class="col-sm-12"> 
                                            <select id="_month" class="form-control" style="width: 49%;display: inline-block;">
                                                <option value="01">January</option>
                                                <option value="02">February</option>
                                                <option value="03">March</option>
                                                <option value="04">April</option>
                                                <option value="05">May</option>
                                                <option value="06">June</option>
                                                <option value="07">July</option>
                                                <option value="08">August</option>
                                                <option value="09">September</option>
                                                <option value="10">October</option>
                                                <option value="11">November</option>
                                                <option value="12">December</option>
                                            </select>
                                            <select id="_year" class="form-control" style="width: 49%;display: inline-block;">${yearOptions}</select>
                                            <button id="generate-btn" type="button" class="btn btn-primary col-sm-12 mt-4">Generate report</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        },
        REPORTS: {
            CICOR: function(title,docs,originChosen,date_from,date_to){
                // var arr = ["destination","origin","route","sn","plate_num","trailer","pal_cap","hauler_name","cico_target","actual_timelapse","remarks1","remarks2","base_plant"];
                var details = "",
                    summary = "",
                    summary_info = {},
                    summary_total = {
                        in_site: 0,
                        over_cico: 0,
                        w_in_cico: 0,
                        count_time_lapse: 0,
                        sum_time_lapse: 0,
                        count_cico: 0,
                        sum_cico: 0
                    },
                    detailsHeaderHTML = "",
                    detailsBodyHTML = "",
                    textCellStyle = `border:2px solid black;mso-number-format:'\@';`,
                    columns = clientCustom.reports.cicor || [];
                columns.forEach(_val_ => {
                    switch (_val_) {
                        case "origin":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Origin (Plant)</td>`;
                            break;
                        case "destination":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Destination (DC)</td>`;
                            break;
                        case "route":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Route</td>`;
                            break;
                        case "sn":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">SN</td>`;
                            break;
                        case "plateNumber":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Plate No.</td>`;
                            break;
                        case "trailer":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Trailer</td>`;
                            break;
                        case "palCap":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Pal Cap</td>`;
                            break;
                        case "haulerName":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Hauler Name</td>`;
                            break;
                        case "targetCico":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Target CICO (hrs)</td>`;
                            break;
                        case "actualTimelapse":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Actual Time Lapse (hrs)</td>`;
                            break;
                        case "remarks1":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Remarks1</td>`;
                            break;
                        case "remarks2":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Remarks2</td>`;
                            break;
                        case "truckBasePlant":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Truck Base Plant</td>`;
                            break;
                        default:
                            break;
                    }
                });

                docs.forEach(function(val,i){
                    val.destination[0] = val.destination[0] || {};
                    var cico_time,actual_time_lapse = null,
                        remarks2Class = "",
                        origin = getGeofence(val.origin_id) || {},
                        destination = getGeofence(val.destination[0].location_id) || {},
                        vehicle = getVehicle(val.vehicle_id) || {},
                        orig_dest = `${origin.short_name}_${destination.short_name}`,
                        remarks2 = "w/in CICO Time",
                        beforeCheckOutTime = getDateTime("entered_origin",val) || getDateTime("queueingAtOrigin",val) || getDateTime("processingAtOrigin",val) || getDateTime("idlingAtOrigin",val);

                    var calcCICO = (beforeCheckOutTime) ?  (getDateTime("in_transit",val,"last") - beforeCheckOutTime) : 0;
                    cico_time = calcCICO || 0;

                    actual_time_lapse = Number(DATETIME.DH(cico_time,null,"0"));

                    if(!summary_info[orig_dest]){
                        summary_info[orig_dest] = {
                            destination:destination.short_name,
                            origin:origin.short_name,
                            in_site:1,
                            over_cico:0,
                            w_in_cico:0,
                            sum_time_lapse: actual_time_lapse,
                            count_time_lapse: (actual_time_lapse != null) ? 1 : 0,
                            cico_target: destination.cico || 0,
                        };
                    } else {
                        summary_info[orig_dest].in_site++;
                        if(actual_time_lapse != null){
                            summary_info[orig_dest].sum_time_lapse = summary_info[orig_dest].sum_time_lapse || 0; // in case value is null

                            summary_info[orig_dest].count_time_lapse++;
                            summary_info[orig_dest].sum_time_lapse += actual_time_lapse;
                        }
                    }
                    if(actual_time_lapse != null) {
                        if(actual_time_lapse > destination.cico){
                            remarks2Class = "background-color:#ffc7ce;color:#9c0006";
                            remarks2 = "Over CICO Time";
                            summary_info[orig_dest].over_cico ++;
                        } else {
                            summary_info[orig_dest].w_in_cico ++;
                        }
                    }

                    detailsBodyHTML += `<tr>`;
                    columns.forEach(_val_ => {
                        switch (_val_) {
                            case "destination":
                                detailsBodyHTML += `<td style="${textCellStyle}">${destination.short_name}</td>`;
                                break;
                            case "origin":
                                detailsBodyHTML += `<td style="${textCellStyle}">${origin.short_name}</td>`;
                                break;
                            case "route":
                                detailsBodyHTML += `<td style="${textCellStyle}">${val.route}</td>`;
                                break;
                            case "sn":
                                detailsBodyHTML += `<td style="${textCellStyle}">${val._id}</td>`;
                                break;
                            case "plateNumber":
                                detailsBodyHTML += `<td style="${textCellStyle}">${(vehicle.name || "")}</td>`;
                                break;
                            case "trailer":
                                detailsBodyHTML += `<td style="${textCellStyle}">${(vehicle["Trailer"] || "")}</td>`;
                                break;
                            case "palCap":
                                detailsBodyHTML += `<td style="${textCellStyle}">${(vehicle["Pal Cap"] || "")}</td>`;
                                break;
                            case "haulerName":
                                detailsBodyHTML += `<td style="${textCellStyle}"></td>`;
                                break;
                            case "targetCico":
                                detailsBodyHTML += `<td style="${textCellStyle}">${DATETIME.HH_MM(null,destination.cico).hour_minute}</td>`;
                                break;
                            case "actualTimelapse":
                                detailsBodyHTML += `<td style="${textCellStyle}">${DATETIME.HH_MM(null,actual_time_lapse).hour_minute}</td>`;
                                break;
                            case "remarks1":
                                detailsBodyHTML += `<td style="${textCellStyle}">${(val.remarks || "")}</td>`;
                                break;
                            case "remarks2":
                                detailsBodyHTML += `<td style="${textCellStyle}${remarks2Class}">${remarks2}</td>`;
                                break;
                            case "truckBasePlant":
                                detailsBodyHTML += `<td style="${textCellStyle}">${(vehicle["Site"] || "")}</td>`;
                                break;
                            default:
                                break;
                        }
                    });
                    detailsBodyHTML += `</tr>`;
                });
                Object.values(summary_info).forEach(val => {
                    var ave_time_lapse = val.sum_time_lapse/val.count_time_lapse;
                    summary += `<tr>
                                    <td style="${textCellStyle}">${val.destination}</td>
                                    <td style="${textCellStyle}">${val.origin}</td>
                                    <td style="${textCellStyle}">${val.in_site}</td>
                                    <td style="${textCellStyle}">${val.over_cico}</td>
                                    <td style="${textCellStyle}">${val.w_in_cico}</td>
                                    <td style="${textCellStyle}">${DATETIME.HH_MM(null,ave_time_lapse).hour_minute}</td>
                                    <td style="${textCellStyle}">${DATETIME.HH_MM(null,val.cico_target).hour_minute}</td>
                                </tr>`;
                    summary_total.in_site += val.in_site;
                    summary_total.over_cico += val.over_cico;
                    summary_total.w_in_cico += val.w_in_cico;
                    summary_total.count_cico ++;
                    summary_total.sum_cico += Number(val.cico_target);
                    if(val.sum_time_lapse != null){
                        summary_total.count_time_lapse ++;
                        summary_total.sum_time_lapse += val.sum_time_lapse;
                    }
                });
                summary_total.ave_time_lapse = summary_total.sum_time_lapse/summary_total.count_time_lapse;
                summary_total.ave_cico = summary_total.sum_cico/summary_total.count_cico;
                console.log("summary_total",summary_total);
                summary += `<tr>
                                <td style="${textCellStyle}font-weight: bold;" colspan=2>TOTAL</td>
                                <td style="${textCellStyle}font-weight: bold;">${(summary_total.in_site || 0)}</td>
                                <td style="${textCellStyle}font-weight: bold;">${(summary_total.over_cico || 0)}</td>
                                <td style="${textCellStyle}font-weight: bold;">${(summary_total.w_in_cico || 0)}</td>
                                <td style="${textCellStyle}font-weight: bold;">${DATETIME.HH_MM(null,summary_total.ave_time_lapse).hour_minute}</td>
                                <td style="${textCellStyle}font-weight: bold;">${DATETIME.HH_MM(null,summary_total.ave_cico).hour_minute}</td>
                            </tr>`;

                return `<table id="report-hidden" style="opacity:0;">
                            <tr>
                                <td style="border: none;">Report name: <b style="color:#c00000;">${title}</b></td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="border: none;"><b>Summary:</b></td>
                            </tr>
                            <tr>
                                <td style="border: none;">
                                    <div>
                                        <div>Plant Site: ${originChosen}</div>
                                        <div>Date from: ${moment(new Date(date_from)).format("MM/DD/YYYY hh:mm A")}</div>
                                        <div>Date to: ${moment(new Date(date_to)).format("MM/DD/YYYY hh:mm A")}</div>
                                        <div>&nbsp;</div>
                                        <div>Generated on: ${moment(new Date()).format("MM/DD/YYYY hh:mm A")}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="background-color:black;color:white;">Destination (DC)</td>
                                <td style="background-color:black;color:white;">Origin (Plant)</td>
                                <td style="background-color:black;color:white;">In Site</td>
                                <td style="background-color:#757070;color:white;">Over CICO</td>
                                <td style="background-color:#757070;color:white;">W/in CICO</td>
                                <td style="background-color:black;color:white;">Ave. Time Lapse (hrs)</td>
                                <td style="background-color:black;color:white;">CICO Target (hrs)</td>
                            </tr>
                            ${summary}
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="border: none;"><b>Details:</b></td>
                            </tr>
                            <tr>${detailsHeaderHTML}</tr>
                            ${detailsBodyHTML}
                        </table> `;
            },
            OTR: function(title,docs,originChosen,date_from,date_to){
                var summary = "",
                    summary_info = {},
                    summary_total = {
                        in_site: 0,
                        over_transit: 0,
                        w_in_transit: 0,
                        sum_time_lapse: 0,
                        count_time_lapse: 0,
                        count_transit: 0,
                        sum_transit: 0
                    },
                    textCellStyle = `border:2px solid black;mso-number-format:'\@';`,
                    detailsHeaderHTML = "",
                    detailsBodyHTML = "",
                    columns = clientCustom.reports.otr || [];
                columns.forEach(_val_ => {
                    switch (_val_) {
                        case "origin":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Origin (Plant)</td>`;
                            break;
                        case "destination":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Destination (DC)</td>`;
                            break;
                        case "route":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Route</td>`;
                            break;
                        case "sn":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">SN</td>`;
                            break;
                        case "plateNumber":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Plate No.</td>`;
                            break;
                        case "trailer":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Trailer</td>`;
                            break;
                        case "palCap":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Pal Cap</td>`;
                            break;
                        case "haulerName":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Hauler Name</td>`;
                            break;
                        case "targetTransit":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Target Transit (hrs)</td>`;
                            break;
                        case "actualTimelapse":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Actual Time Lapse (hrs)</td>`;
                            break;
                        case "remarks1":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Remarks1</td>`;
                            break;
                        case "remarks2":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Remarks2</td>`;
                            break;
                        case "truckBasePlant":
                            detailsHeaderHTML += `<td style="background-color:black;color:white;">Truck Base Plant</td>`;
                            break;
                        default:
                            break;
                    }
                });
                    
                docs.forEach(function(val,i){
                    var transit_time = getDuration("in_transit",val),
                        actual_time_lapse,
                        remarks2Class = "",
                        origin = getGeofence(val.origin_id) || {},
                        destination = getGeofence(val.destination[0].location_id) || {},
                        route = LIST["routes"].find(x => x.origin_id == origin._id && x.destination_id == destination._id) || {},
                        vehicle = getVehicle(val.vehicle_id) || {},
                        orig_dest = `${origin.short_name}_${destination.short_name}`,
                        remarks2 = "w/in Transit Time";
                        
                    if(transit_time){
                        actual_time_lapse = Number(DATETIME.DH(transit_time,null,"0"));
                    } else {
                        actual_time_lapse = null;
                    }

                    if(!summary_info[orig_dest]){
                        summary_info[orig_dest] = {
                            destination:destination.short_name,
                            origin:origin.short_name,
                            in_site:1,
                            over_transit:0,
                            w_in_transit:0,
                            count_time_lapse: (actual_time_lapse) ? 1 : 0,
                            sum_time_lapse: actual_time_lapse,
                            transit_target:route.transit_time || 0,
                        };
                    } else {
                        summary_info[orig_dest].in_site++;
                        if(actual_time_lapse != null){
                            summary_info[orig_dest].count_time_lapse++;
                            summary_info[orig_dest].sum_time_lapse += actual_time_lapse;
                        }
                    }
                    if(actual_time_lapse != null) {
                        if(actual_time_lapse > route.transit_time){
                            remarks2Class = "background-color:#ffc7ce;color:#9c0006";
                            remarks2 = "Over Transit Time";
                            summary_info[orig_dest].over_transit ++;
                        } else {
                            summary_info[orig_dest].w_in_transit ++;
                        }
                    }

                    detailsBodyHTML += `<tr>`;
                    columns.forEach(_val_ => {
                        switch (_val_) {
                            case "origin":
                                detailsBodyHTML += `<td style="${textCellStyle}">${origin.short_name}</td>`;
                                break;
                            case "destination":
                                detailsBodyHTML += `<td style="${textCellStyle}">${destination.short_name}</td>`;
                                break;
                            case "route":
                                detailsBodyHTML += `<td style="${textCellStyle}">${val.route}</td>`;
                                break;
                            case "sn":
                                detailsBodyHTML += `<td style="${textCellStyle}">${val._id}</td>`;
                                break;
                            case "plateNumber":
                                detailsBodyHTML += `<td style="${textCellStyle}">${(vehicle.name || "")}</td>`;
                                break;
                            case "trailer":
                                detailsBodyHTML += `<td style="${textCellStyle}">${(vehicle["Trailer"] || "")}</td>`;
                                break;
                            case "palCap":
                                detailsBodyHTML += `<td style="${textCellStyle}">${(vehicle["Pal Cap"] || "")}</td>`;
                                break;
                            case "haulerName":
                                detailsBodyHTML += `<td style="${textCellStyle}"></td>`;
                                break;
                            case "targetTransit":
                                detailsBodyHTML += `<td style="${textCellStyle}mso-number-format:'\@';">${DATETIME.HH_MM(null,route.transit_time).hour_minute}</td>`;
                                break;
                            case "actualTimelapse":
                                detailsBodyHTML += `<td style="${textCellStyle}mso-number-format:'\@';">${DATETIME.HH_MM(null,actual_time_lapse).hour_minute}</td>`;
                                break;
                            case "remarks1":
                                detailsBodyHTML += `<td style="${textCellStyle}">${(val.remarks || "")}</td>`;
                                break;
                            case "remarks2":
                                detailsBodyHTML += `<td style="${textCellStyle}${remarks2Class}">${remarks2}</td>`;
                                break;
                            case "truckBasePlant":
                                detailsBodyHTML += `<td style="${textCellStyle}">${(vehicle["Site"] || "")}</td>`;
                                break;
                            default:
                                break;
                        }
                    });
                    detailsBodyHTML += `</tr>`;
                });
                Object.values(summary_info).forEach(val => {
                    var ave_time_lapse = val.sum_time_lapse/val.count_time_lapse;
                    summary += `<tr>
                                    <td style="${textCellStyle}">${val.origin}</td>
                                    <td style="${textCellStyle}">${val.destination}</td>
                                    <td style="${textCellStyle}">${val.in_site}</td>
                                    <td style="${textCellStyle}">${val.over_transit}</td>
                                    <td style="${textCellStyle}">${val.w_in_transit}</td>
                                    <td style="${textCellStyle}">${DATETIME.HH_MM(null,ave_time_lapse).hour_minute}</td>
                                    <td style="${textCellStyle}">${DATETIME.HH_MM(null,val.transit_target).hour_minute}</td>
                                </tr>`;
                    summary_total.in_site += val.in_site;
                    summary_total.over_transit += val.over_transit;
                    summary_total.w_in_transit += val.w_in_transit;
                    summary_total.count_transit ++;
                    summary_total.sum_transit += Number(val.transit_target);

                    if(val.sum_time_lapse != null){
                        summary_total.count_time_lapse ++;
                        summary_total.sum_time_lapse += ave_time_lapse;
                    }
                });
                summary_total.ave_time_lapse = summary_total.sum_time_lapse/summary_total.count_time_lapse;
                summary_total.ave_transit = summary_total.sum_transit/summary_total.count_transit;
                
                summary += `<tr>
                                <td style="${textCellStyle}font-weight: bold;" colspan=2>TOTAL</td>
                                <td style="${textCellStyle}font-weight: bold;">${(summary_total.in_site || 0)}</td>
                                <td style="${textCellStyle}font-weight: bold;">${(summary_total.over_transit || 0)}</td>
                                <td style="${textCellStyle}font-weight: bold;">${(summary_total.w_in_transit || 0)}</td>
                                <td style="${textCellStyle}font-weight: bold;">${DATETIME.HH_MM(null,summary_total.ave_time_lapse).hour_minute}</td>
                                <td style="${textCellStyle}font-weight: bold;">${DATETIME.HH_MM(null,summary_total.ave_transit).hour_minute}</td>
                            </tr>`;

                return `<table id="report-hidden" style="opacity:0;">
                            <tr>
                                <td style="border: none;">Report name: <b style="color:#c00000;">${title}</b></td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="border: none;"><b>Summary:</b></td>
                            </tr>
                            <tr>
                                <td style="border: none;">
                                    <div>
                                        <div>Plant Site: ${originChosen}</div>
                                        <div>Date from: ${moment(new Date(date_from)).format("MM/DD/YYYY hh:mm A")}</div>
                                        <div>Date to: ${moment(new Date(date_to)).format("MM/DD/YYYY hh:mm A")}</div>
                                        <div>&nbsp;</div>
                                        <div>Generated on: ${moment(new Date()).format("MM/DD/YYYY hh:mm A")}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="background-color:black;color:white;">Origin (Plant)</td>
                                <td style="background-color:black;color:white;">Destination (DC)</td>
                                <td style="background-color:black;color:white;">In Site</td>
                                <td style="background-color:#757070;color:white;">Over Transit</td>
                                <td style="background-color:#757070;color:white;">W/in Transit</td>
                                <td style="background-color:black;color:white;">Ave. Time Lapse (hrs)</td>
                                <td style="background-color:black;color:white;">Ave. Transit Target (hrs)</td>
                            </tr>
                            ${summary}
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="border: none;"><b>Details:</b></td>
                            </tr>
                            <tr>${detailsHeaderHTML}</tr>
                            ${detailsBodyHTML}
                        </table> `;
            },
            PBPA: function(title,docs,originChosen,date_from,date_to){
                var details = "",
                    inventory = 0,
                    textCellStyle = `border:2px solid black;mso-number-format:'\@';`,
                    width = ["width:280px;","width:150px;","width:150px;","width:150px;","width:150px;","width:150px;",
                            "width:150px;","width:300px;","width:300px;","width:150px;","width:175px;","width:150px;"];
            docs.forEach(function(val,i){
                inventory++;
                var transit_time = getDuration("in_transit",val),
                    actual_time_lapse,
                    remarks2Class = "",
                    origin = getGeofence(val.origin_id) || {},
                    destination = getGeofence(val.destination[0].location_id) || {},
                    vehicle = getVehicle(val.vehicle_id) || {},
                    remarks2 = "w/in Transit Time";
                    
                if(transit_time){
                    actual_time_lapse = Number(DATETIME.DH(transit_time,null,"0"));
                } else {
                    actual_time_lapse = null;
                }
                
                details += `<tr style="text-align:center;">
                                <td style="${textCellStyle}${width[0]}">${(vehicle.name || "")}</td>
                                <td style="${textCellStyle}${width[1]}">${(vehicle["Pal Cap"] || "")}</td>
                                <td style="${textCellStyle}${width[2]}">-</td>
                                <td style="${textCellStyle}${width[3]}">-</td>
                                <td style="${textCellStyle}${width[4]}">${(val.remarks || "")}</td>
                                <td style="${textCellStyle}${width[5]}${remarks2Class}">${remarks2}</td>
                                <td style="${textCellStyle}${width[6]}">${val._id}</td>
                                <td style="${textCellStyle}${width[7]}">${origin.short_name}</td>
                                <td style="${textCellStyle}${width[8]}">${destination.short_name}</td>
                                <td style="${textCellStyle}${width[9]}">${val.route}</td>
                                <td style="${textCellStyle}${width[10]}">${DATETIME.HH_MM(null,actual_time_lapse).hour_minute}</td>
                            </tr>`;
            });

            return `<table id="report-hidden" style="opacity:0;">
                        <tr>
                            <td style="border: none;" colspan=2>Report name: <b style="color:#c00000;">${title}</b></td>
                        </tr>
                        <tr><td style="border: none;"></td></tr>
                        <tr>
                            <td style="border: none;"><b>Summary:</b></td>
                        </tr>
                        <tr>
                            <td style="border: none;" colspan=2>
                                <div>
                                    <div>Plant Base: ${originChosen}</div>
                                    <div>Date from: ${moment(new Date(date_from)).format("MM/DD/YYYY hh:mm A")}</div>
                                    <div>Date to: ${moment(new Date(date_to)).format("MM/DD/YYYY hh:mm A")}</div>
                                    <div>&nbsp;</div>
                                    <div>Generated on: ${moment(new Date()).format("MM/DD/YYYY hh:mm A")}</div>
                                </div>
                            </td>
                        </tr>
                        <tr><td style="border: none;"></td></tr>
                        <tr>
                            <td style="background-color:black;color:white;"><b>Inventory:</b></td>
                            <td style="border:2px solid black;font-weight: bold;text-align:center;">${inventory}</td>
                        </tr>
                        <tr>
                            <td style="background-color:black;color:white;"><b>Attendance:</b></td>
                            <td style="border:2px solid black;font-weight: bold;text-align:center;">-%</td>
                        </tr>
                        <tr style="text-align:center;">
                            <td style="background-color:black;color:white;text-align:left;"><b>Breakdown:</b></td>
                            <td style="border:2px solid black;font-weight: bold;"></td>
                            <td style="background-color:black;color:white;"><b>In Transit</b></td>
                            <td style="background-color:#757070;color:white;"><b>Over Transit</b></td>
                            <td style="background-color:#757070;color:white;"><b>W/in Transit</b></td>
                            <td style="background-color:black;color:white;"><b>In Site</b></td>
                            <td style="background-color:#757070;color:white;"><b>Over CICO</b></td>
                            <td style="background-color:#757070;color:white;"><b>W/in CICO</b></td>
                        </tr>
                        <tr style="text-align:center;">
                            <td style="background-color:black;color:white;text-align:right;font-style:italic;"><b>Active Assigned</b></td>
                            <td style="border:2px solid black;font-weight: bold;">-</td>
                            <td style="border:2px solid black;font-weight: bold;">-</td>
                            <td style="border:2px solid black;font-weight: bold;color:red;">-</td>
                            <td style="border:2px solid black;font-weight: bold;color:red;">-</td>
                            <td style="border:2px solid black;font-weight: bold;">-</td>
                            <td style="border:2px solid black;font-weight: bold;color:red;">-</td>
                            <td style="border:2px solid black;font-weight: bold;color:red;">-</td>
                        </tr>
                        <tr style="text-align:center;">
                            <td style="background-color:black;color:white;text-align:right;font-style:italic;"><b>Waiting for Assignment</b></td>
                            <td style="border:2px solid black;font-weight: bold;">-</td>
                            <td style="border:2px solid black;font-weight: bold;">-</td>
                            <td style="border:2px solid black;font-weight: bold;color:red;">-</td>
                            <td style="border:2px solid black;font-weight: bold;color:red;">-</td>
                            <td style="border:2px solid black;font-weight: bold;">-</td>
                            <td style="border:2px solid black;font-weight: bold;color:red;">-</td>
                            <td style="border:2px solid black;font-weight: bold;color:red;">-</td>
                        </tr>
                        <tr style="text-align:center;">
                            <td style="background-color:black;color:white;text-align:right;font-style:italic;"><b>Inactive</b></td>
                            <td style="border:2px solid black;font-weight: bold;">-</td>
                            <td style="background-color:black;"></td>
                            <td style="background-color:black;"></td>
                            <td style="background-color:black;"></td>
                            <td style="background-color:black;"></td>
                            <td style="background-color:black;"></td>
                            <td style="background-color:black;"></td>
                        </tr>
                        <tr><td style="border: none;"></td></tr>
                        <tr>
                            <td style="border: none;"><b>Details:</b></td>
                        </tr>
                        <tr style="text-align:center;">
                            <td style="background-color:black;color:white;">Plate No.</td>
                            <td style="background-color:black;color:white;">Pal Cap</td>
                            <td style="background-color:black;color:white;">Activity</td>
                            <td style="background-color:black;color:white;">Activity Status</td>
                            <td style="background-color:black;color:white;">Remarks1</td>
                            <td style="background-color:black;color:white;">Remarks2</td>
                            <td style="background-color:black;color:white;">SN</td>
                            <td style="background-color:black;color:white;">Origin (Plant)</td>
                            <td style="background-color:black;color:white;">Destination (DC)</td>
                            <td style="background-color:black;color:white;">Route</td>
                            <td style="background-color:black;color:white;">Actual Time Lapse (hrs)</td>
                        </tr>
                        ${details}
                    </table>`;
            },
            HWTR: function(title,docs,originChosen,_date){
                var details = "",
                    breakdown = "",
                    tt1c = 0,
                    wctp = 0,
                    final_compliance = 0,
                    breakdown_info = {},
                    width = ["width:115px;","width:215px;","width:215px;","width:215px;"];
                function getDateItems(hours) {
                    var toDate = new Date();
                    var fromDate = new Date();
                    toDate.setHours(6);
                    toDate.setMinutes(00);
                    toDate.setSeconds(00);
                    fromDate.setHours(6);
                    fromDate.setMinutes(00);
                    fromDate.setSeconds(00);
                    toDate.setTime(toDate.getTime() + (hours * 60 * 60 * 1000));
                    var result = {};
                    
                    while (toDate >= fromDate) {
                        result[moment(fromDate).format("h a")] = {
                            time: moment(fromDate).format("h:mm A"),
                            ti_shipment: 0,
                            ti_arrived: 0,
                        };
                        fromDate.setTime(fromDate.getTime() + (1 * 60 * 60 * 1000));
                    }
                    
                    return result;
                }  
                var timeList = getDateItems(23);
                
                docs.forEach(function(val,i){
                    tt1c++;

                    var origin = getGeofence(val.origin_id) || {},
                        destination = getGeofence(val.destination[0].location_id) || {},
                        route = LIST["routes"].find(x => x.origin_id == origin._id && x.destination_id == destination._id) || {},
                        orig_dest = `${origin.short_name}_${destination.short_name}`,
                        timeKey = moment(val.departure_date).format("h a");

                    if(!breakdown_info[orig_dest]){
                        breakdown_info[orig_dest] = {
                            destination:destination.short_name,
                            origin:origin.short_name,
                            count:1,
                        };
                    } else {
                        breakdown_info[orig_dest].count++;
                    }

                    // departure time
                    timeList[timeKey].ti_shipment++;

                    
                    // # of shipments (bases in 2nd col) whose actual in transit time =< target transit time
                    var transit_time = getDuration("in_transit",val),
                        actual_time_lapse = Number(DATETIME.DH(transit_time,null,"0"));
                    timeList[timeKey].ti_arrived += ((route.transit_time || 0) >= actual_time_lapse)?1:0;
                });
                
                Object.keys(timeList).forEach(key => {
                    var time = timeList[key].time,
                        ti_shipment = timeList[key].ti_shipment,
                        ti_arrived = timeList[key].ti_arrived,
                        _compliance = ((ti_arrived<ti_shipment)?"Non Compliance":"Complied");
                    final_compliance = final_compliance + ((_compliance=="Complied")?1:0);
                    wctp += ti_shipment;
                    details += `<tr>
                                    <td style="border:2px solid black;text-align:center;">${time}</td>
                                    <td style="border:2px solid black;text-align:center;">${ti_shipment}</td>
                                    <td style="border:2px solid black;text-align:center;">${ti_arrived}</td>
                                    <td style="border:2px solid black;text-align:center;">${_compliance}</td>
                                </tr>`;
                });
                Object.values(breakdown_info).forEach(val => {
                    breakdown += `<tr>
                                    <td style="border:2px solid black;text-align:center;" colspan=2>${val.origin}</td>
                                    <td style="border:2px solid black;text-align:center;">${val.count}</td>
                                </tr>`;
                });

                return `<table id="report-hidden" style="opacity:0;">
                            <tr>
                                <td style="border: none;" colspan=3>Report name: <b style="color:#c00000;">${title}</b></td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="border: none;"><b>Summary:</b></td>
                            </tr>
                            <tr>
                                <td style="border: none;" colspan=3>
                                    <div>
                                        <div>Destination Site: ${originChosen}</div>
                                        <div>Date: ${moment(new Date(_date)).format("MM/DD/YYYY")}</div>
                                        <div>&nbsp;</div>
                                        <div>Generated on: ${moment(new Date()).format("MM/DD/YYYY hh:mm A")}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="background-color:black;color:white;" colspan=2><b>Total T1 Shipment:</b></td>
                                <td style="border:2px solid black;font-weight: bold;text-align:center;">${tt1c}</td>
                            </tr>
                            <tr>
                                <td style="background-color:black;color:white;" colspan=2><b>Breakdown:</b></td>
                                <td style="border:2px solid black;"></td>
                            </tr>
                            ${breakdown}
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="border:2px solid black;text-align:center;" colspan=2>Whse Capacity to Process</td>
                                <td style="border:2px solid black;text-align:center;"><b>${wctp}</b></td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="border:2px solid black;text-align:center;" colspan=2>Capacity vs Shipment</td>
                                <td style="border:2px solid black;text-align:center;"><b>${((tt1c>wctp)?"Capacity to Process Issue":"No Processing Issue")}</b></td>
                            </tr>
                            <tr>
                                <td style="border:2px solid black;text-align:center;" colspan=2>% Compliance</td>
                                <td style="border:2px solid black;text-align:center;"><b>${GET.ROUND_OFF((final_compliance/24)*100)}%</b></td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="background-color:black;color:white;${width[0]}text-align:center;"><b>Time</b></td>
                                <td style="background-color:black;color:white;text-align:center;${width[1]}"><b>T1 Shipments/Hr</b></td>
                                <td style="background-color:black;color:white;text-align:center;${width[2]}"><b>T1 that arrived/Hr</b></td>
                                <td style="background-color:black;color:white;text-align:center;${width[3]}"><b>% compliance</b></td>
                            </tr>
                            ${details}
                        </table>`;
            },
            TR: function(title,location,_date){
                var empty = "",
                    width = ["width:100px;","width:100px;","width:100px;","width:100px;"];

                for(var i=0; i < 16; i++){
                    empty += `<tr style="text-align:center">
                                    <td style="border:2px solid black;"></td>
                                    <td style="border:2px solid black;"></td>
                                    <td style="border:2px solid black;"></td>
                                    <td style="border:2px solid black;"></td>
                                </tr>`;
                }

                return `<table id="report-hidden" style="opacity:0;">
                            <tr>
                                <td style="border: none;" colspan=4>Report name: <b style="color:#c00000;">${title}</b></td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="border: none;" colspan=4><b>Summary:</b></td>
                            </tr>
                            <tr>
                                <td style="border: none;" colspan=4>
                                    <div>
                                        <div>Plant Site: ${location.origin}</div>
                                        <div>Destination Site: ${location.destination}</div>
                                        <div>Destination Region: ${location.region}</div>
                                        <div>&nbsp;</div>
                                        <div>Day: ${moment(new Date(_date)).format("DD")}</div>
                                        <div>Week: ${moment(new Date(_date)).format("dddd")}</div>
                                        <div>Month: ${moment(new Date(_date)).format("MMMM")}</div>
                                        <div>&nbsp;</div>
                                        <div>Generated on: ${moment(new Date()).format("MM/DD/YYYY hh:mm A")}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="background-color:black;color:white;${width[0]}text-align:center;"><b>Period</b></td>
                                <td style="background-color:black;color:white;text-align:center;${width[1]}"><b>Week</b></td>
                                <td style="background-color:black;color:white;text-align:center;${width[2]}"><b>Date</b></td>
                                <td style="background-color:black;color:white;text-align:center;${width[3]}"><b>Trippage</b></td>
                            </tr>
                            ${empty}
                        </table>`;
            },
            VCR: function(title,docs,date_from,date_to){
                var empty = "",
                    width = ["width:100px;","width:100px;","width:100px;","width:110px;","width:100px;","width:180px;","width:180px;"],
                    lastTimestamp,
                    lastGeofence,
                    timeToDeduct = 5, // 5 minutes
                    hasChangedGeofence = true; // to deduct 5 minutes from datetime

                docs.forEach((val,i) => {
                    function processReport(){
                        hasChangedGeofence = false;

                        var _prev = docs[i-1],
                            _next = docs[i+1],
                            timestamp = lastTimestamp || val.timestamp,
                            prevAddress = (_prev && _prev.USER_NAME == val.USER_NAME) ? _prev.GEOFENCE_NAME : null,
                            startAddress = val.GEOFENCE_NAME,
                            endAddress = (_next && _next.USER_NAME == val.USER_NAME) ? _next.GEOFENCE_NAME : null,
                            modifyAddress = function(addr){
                                var finalStr = "";
                                if(addr){
                                    var str = addr.split(" - "),
                                        modifyArea = function(area){
                                            finalStr += ` ${area}`;
                                            finalStr = finalStr.replace(" DC","").replace(" PL","").replace(/Ñ/g,"N").replace(/ñ/g,"n");
                                        };
                                    finalStr = str[0].capitalize(" ").replace(" Dc"," DC").replace(" Pl"," PL");
                                    if(addr.indexOf("Process") > -1) modifyArea(" Process");
                                    if(addr.indexOf("Queue") > -1) modifyArea(" Queue");
                                    if(addr.indexOf("Idle") > -1) modifyArea(" Idle");
                                } else {
                                    finalStr = "Unknown";
                                }
                                console.log("finalStr",addr,finalStr);
                                return finalStr;
                            },
                            getAddressStyle = function(addr){
                                return (addr && addr.indexOf(" - ") == -1) ? "color:#ca294b;font-style: italic;" : "color:black;";
                            },
                            getOriginalAddress = function(addr){
                                addr = addr || "";
                                var str = addr.split(" - ");
                                return str[0];
                            },
                            startAddressColor = getAddressStyle(startAddress),
                            endAddressColor = getAddressStyle(endAddress),
                            sameCurrentAndPrevAddress = getOriginalAddress(startAddress) == getOriginalAddress(prevAddress),
                            sameCurrentAndNextAddress = getOriginalAddress(startAddress) == getOriginalAddress(endAddress),
                            endAddressTimestamp = (_next && _next.USER_NAME == val.USER_NAME) ? _next.timestamp : null,
                            duration = (endAddressTimestamp) ? Math.abs(new Date(timestamp).getTime() - new Date(endAddressTimestamp).getTime()) : null,
                            addHTML = function(addressColor,address){
                                // do not make condition like !duration. Duration could be 0.
                                var endAddressHTML = (duration != null) ? `<td style="font-family:Arial;font-size:15px;border:1px solid black;${addressColor}">${modifyAddress(address)}</td>` : 
                                                                `<td style="font-family:Arial;font-size:15px;border:1px solid black;">-</td>`,
                                    endDate = DATETIME.FORMAT(endAddressTimestamp,"D-M"),
                                    endTime = DATETIME.FORMAT(endAddressTimestamp,"hh:mm A"),
                                    status = "Finished",
                                    _duration_ = (duration != null) ? GET.ROUND_OFF(DATETIME.DH(duration,null,"0"))  : "-";
                                if(new Date(date_to).getTime() > new Date().getTime() && duration == null){
                                    endDate = "-";
                                    endTime = "-";
                                    status = "Pending"
                                }
                                return `<tr style="text-align:center">
                                            <td style="font-family:Arial;font-size:15px;border:1px solid black;mso-number-format:'\@';">${val.USER_NAME}</td>
                                            <td style="font-family:Arial;font-size:15px;border:1px solid black;mso-number-format:'\@';">${DATETIME.FORMAT(timestamp,"D-M")}</td>
                                            <td style="font-family:Arial;font-size:15px;border:1px solid black;mso-number-format:'\@';">${DATETIME.FORMAT(timestamp,"hh:mm A")}</td>
                                            <td style="font-family:Arial;font-size:15px;border:1px solid black;mso-number-format:'\@';">${endDate}</td>
                                            <td style="font-family:Arial;font-size:15px;border:1px solid black;mso-number-format:'\@';">${endTime}</td>
                                            <td style="font-family:Arial;font-size:15px;border:1px solid black;mso-number-format:'\@';">${_duration_}</td>
                                            <td style="font-family:Arial;font-size:15px;border:1px solid black;mso-number-format:'\@';">${status}</td>
                                            <td style="font-family:Arial;font-size:15px;border:1px solid black;mso-number-format:'\@';${startAddressColor}">${modifyAddress(startAddress)}</td>
                                            ${endAddressHTML}
                                        </tr>`;
                            };

                        if(!sameCurrentAndNextAddress){
                            hasChangedGeofence = true;
                        }
                        if(_next && _next.GEOFENCE_NAME == val.GEOFENCE_NAME && _next.USER_NAME == val.USER_NAME){
                            if(!lastTimestamp) lastTimestamp = val.timestamp; // do not put in parent condition ^. It will be false if timestamp has value
                        } else {
                            lastTimestamp = null;
                            if(sameCurrentAndNextAddress){
                                lastGeofence = getOriginalAddress(startAddress);
                                empty += addHTML(endAddressColor,endAddress);
                            } else if(!lastGeofence || !prevAddress || lastGeofence != getOriginalAddress(prevAddress)){
                                lastGeofence = getOriginalAddress(startAddress);
                                duration = Math.abs(new Date(timestamp).getTime() - new Date(val.timestamp).getTime());
                                endAddressTimestamp = val.timestamp;
                                empty += addHTML(startAddressColor,startAddress);
                            }
                        }
                    }
                    if(hasChangedGeofence){
                        if(val.GEOFENCE_NAME.indexOf("-") == -1){
                            var date = new Date(val.timestamp);
                            date.setMinutes(date.getMinutes() - timeToDeduct);

                            if(DATETIME.FORMAT(val.timestamp,"D-MMM") == DATETIME.FORMAT(date_from,"D-MMM")){
                                if(DATETIME.FORMAT(date_from,"D-MMM") == DATETIME.FORMAT(date,"D-MMM")){
                                    val.timestamp = date.getTime();
                                }
                            } else {
                                val.timestamp = date.getTime();
                            }
                            processReport();
                        } else { }
                    } else {
                        processReport();
                    }
                });

                return `<table id="report-hidden" style="opacity:0;">
                            <tr>
                                <td style="font-family:Arial;font-size:15px;border: none;" colspan=4>Report name: <b style="color:#c00000;">${title}</b></td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="font-family:Arial;font-size:15px;border: none;" colspan=4><b>Date Info:</b></td>
                            </tr>
                            <tr>
                                <td style="border: none;font-family:Arial;font-size:15px;" colspan=4>
                                    <div>
                                        <div>Date from: ${moment(new Date(date_from)).format("MM/DD/YYYY hh:mm A")}</div>
                                        <div>Date to: ${moment(new Date(date_to)).format("MM/DD/YYYY hh:mm A")}</div>
                                        <div>&nbsp;</div>
                                        <div>Generated on: ${moment(new Date()).format("MM/DD/YYYY hh:mm A")}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="font-family:Arial;font-size:15px;background-color:black;color:white;${width[0]}text-align:center;"><b>Vehicle</b></td>
                                <td style="font-family:Arial;font-size:15px;background-color:black;color:white;text-align:center;${width[1]}"><b>Start Date</b></td>
                                <td style="font-family:Arial;font-size:15px;background-color:black;color:white;text-align:center;${width[2]}"><b>Start Time</b></td>
                                <td style="font-family:Arial;font-size:15px;background-color:black;color:white;text-align:center;${width[1]}"><b>End Date</b></td>
                                <td style="font-family:Arial;font-size:15px;background-color:black;color:white;text-align:center;${width[2]}"><b>End Time</b></td>
                                <td style="font-family:Arial;font-size:15px;background-color:black;color:white;text-align:center;${width[3]}"><b>Duration (hrs)</b></td>
                                <td style="font-family:Arial;font-size:15px;background-color:black;color:white;text-align:center;${width[4]}"><b>Event State</b></td>
                                <td style="font-family:Arial;font-size:15px;background-color:black;color:white;text-align:center;${width[5]}"><b>Start Address</b></td>
                                <td style="font-family:Arial;font-size:15px;background-color:black;color:white;text-align:center;${width[6]}"><b>End Address</b></td>
                            </tr>
                            ${empty}
                        </table>`;
            },
            ULAR: function(title,docs,date_from,date_to){
                var empty = "",
                    width = ["width:150px;","width:200px;","width:160px;","width:160px;","width:70px;","width:15px;","width:115px;","width:400px;"];

                docs.forEach((val,i) => {
                    var user = getUser(val.username) || {};
                    var duration = (val.logout_date) ? new Date(val.logout_date).getTime() - new Date(val.login_date).getTime() : "-";
                    empty += `<tr style="text-align:center">
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #eee;mso-number-format:'\@';text-align:left;">${val.username}</td>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #eee;mso-number-format:'\@';text-align:left;">${user.name || "-"}</td>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #eee;mso-number-format:'\@';text-align:left;">${DATETIME.FORMAT(val.login_date)}</td>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #eee;mso-number-format:'\@';text-align:left;">${DATETIME.FORMAT(val.logout_date)}</td>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #eee;mso-number-format:'\@';text-align:left;">${DATETIME.HH_MM(duration).hour_minute}</td>
                                <td style="font-family:Arial;font-size:15px;border:none;mso-number-format:'\@';">&nbsp;</td>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #eee;mso-number-format:'\@';text-align:left;">${val.ip || "-"}</td>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #eee;mso-number-format:'\@';text-align:left;">${val.location || "-"}</td>
                            </tr>`;
                });

                return `<table id="report-hidden" style="opacity:0;">
                            <tr>
                                <td style="font-family:Arial;font-size:15px;border: none;" colspan=4>Report name: <b style="color:#c00000;">${title}</b></td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="font-family:Arial;font-size:15px;border: none;" colspan=4><b>Date Info:</b></td>
                            </tr>
                            <tr>
                                <td style="border: none;font-family:Arial;font-size:15px;" colspan=4>
                                    <div>
                                        <div>Date from: ${moment(new Date(date_from)).format("MM/DD/YYYY hh:mm A")}</div>
                                        <div>Date to: ${moment(new Date(date_to)).format("MM/DD/YYYY hh:mm A")}</div>
                                        <div>&nbsp;</div>
                                        <div>Generated on: ${moment(new Date()).format("MM/DD/YYYY hh:mm A")}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #D0CECE;background-color:#D0CECE;color:#262626;${width[0]}text-align:left;"><b>Username</b></td>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #D0CECE;background-color:#D0CECE;color:#262626;text-align:left;${width[1]}"><b>Name</b></td>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #D0CECE;background-color:#D0CECE;color:#262626;text-align:left;${width[2]}"><b>Login Date</b></td>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #D0CECE;background-color:#D0CECE;color:#262626;text-align:left;${width[3]}"><b>Logout Date</b></td>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #D0CECE;background-color:#D0CECE;color:#262626;text-align:left;${width[4]}"><b>Duration</b></td>
                                <td style="font-family:Arial;font-size:15px;border:none;text-align:center;${width[5]}"><b></b></td>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #D0CECE;background-color:#D0CECE;color:#262626;text-align:left;${width[6]}"><b>I.P. Address</b></td>
                                <td style="font-family:Arial;font-size:15px;border:none;border-bottom:1px solid #D0CECE;background-color:#D0CECE;color:#262626;text-align:left;${width[7]}"><b>Location (Based on I.P. Address)</b></td>
                            </tr>
                            ${empty}
                        </table>`;
            },
            DESR: function(title,docs,date_from,date_to){
                var rows = "";
                var tblHeaderStyle = "font-family:Arial;font-size:15px;background-color:#404040;border-color:#404040;color:white;text-align:center;";
                var tblBodyStyle = "font-family:Arial;font-size:15px;border:none;mso-number-format:'\@';vertical-align:top;";

                function datetime(date){
                    var _date =  moment(new Date(date)).format("MM/DD/YYYY");
                    var _time = moment(new Date(date)).format("H:mm");
                    
                    return {
                        date: (_date == "Invalid date") ? "-" : _date,
                        time: (_time == "Invalid date") ? "-" : _time
                    }
                }

                docs.forEach(val => {
                    var data = new Dispatch(val);

                    var history = [];
                    Object.keys(data.history).forEach(key => {
                        var value = data.history[key] || "";

                        if(value.indexOf("Entry Update") > -1 || value.indexOf("Record updated") > -1){
                            var formattedDate = DATETIME.FORMAT(Number(key),"MM/DD/YYYY h:mm A");
                            var newValue = value.replace(/•/g,"-").replace(/Entry Update - /g,"- ").replace(/<br><br>/g,"<br>");

                            history.push(`${formattedDate}<br>${newValue}`);
                        }
                    });

                    rows += `<tr>
                                <td style="${tblBodyStyle}">${data._id}</td>
                                <td style="${tblBodyStyle}">${data.vehicle}</td>
                                <td style="${tblBodyStyle}">${data.trailer}</td>
                                <td style="${tblBodyStyle}">${data.pal_cap}</td>
                                <td style="${tblBodyStyle}">${data.origin}</td>
                                <td style="${tblBodyStyle}">${data.destination}</td>
                                <td style="${tblBodyStyle}">${data.route}</td>
                                <td style="${tblBodyStyle}">${datetime(data.entered_datetime).date}</td>
                                <td style="${tblBodyStyle}">${datetime(data.entered_datetime).time}</td>
                                <td style="${tblBodyStyle}">${datetime(data.departure_date).date}</td>
                                <td style="${tblBodyStyle}">${datetime(data.departure_date).time}</td>
                                <td style="${tblBodyStyle}">${data.queueingDuration}</td>
                                <td style="${tblBodyStyle}">${data.processingDuration}</td>
                                <td style="${tblBodyStyle}">${data.idlingDuration}</td>
                                <td style="${tblBodyStyle}">${data.cico}</td>
                                <td style="${tblBodyStyle}">${data.transitDuration}</td>
                                <td style="${tblBodyStyle}">${datetime(data.complete_datetime).date}</td>
                                <td style="${tblBodyStyle}">${datetime(data.complete_datetime).time}</td>
                                <td style="${tblBodyStyle}">${data.postedByWithName}</td>
                                <td style="${tblBodyStyle}">${datetime(data.posting_date).date}</td>
                                <td style="${tblBodyStyle}">${datetime(data.posting_date).time}</td>
                                <td style="${tblBodyStyle}">${data.statusText}</td>
                                <td style="${tblBodyStyle}">${$(`<span>${data.late_entry}</span>`).text()}</td>
                                <td style="${tblBodyStyle}">${data.comments}</td>
                                <td style="${tblBodyStyle}width:500px;">${history.join("<br><br>")}</td>
                            </tr>`;
                });
                return `<table id="report-hidden" style="opacity:0;">
                            <tr>
                                <td style="font-family:Arial;font-size:15px;border: none;" colspan=22>Report name: <b style="color:#c00000;">${title}</b></td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="font-family:Arial;font-size:15px;border: none;" colspan=22><b>Date Info:</b></td>
                            </tr>
                            <tr>
                                <td style="border: none;font-family:Arial;font-size:15px;" colspan=22>
                                    <div>
                                        <div>Date from: ${moment(new Date(date_from)).format("MM/DD/YYYY hh:mm A")}</div>
                                        <div>Date to: ${moment(new Date(date_to)).format("MM/DD/YYYY hh:mm A")}</div>
                                        <div>&nbsp;</div>
                                        <div>Generated on: ${moment(new Date()).format("MM/DD/YYYY hh:mm A")}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr><td style="border: none;"></td></tr>
                            <tr>
                                <td style="${tblHeaderStyle}"><b>Shipment</b></td>
                                <td style="${tblHeaderStyle}"><b>Vehicle</b></td>
                                <td style="${tblHeaderStyle}"><b>Trailer</b></td>
                                <td style="${tblHeaderStyle}"><b>Pal Cap</b></td>
                                <td style="${tblHeaderStyle}"><b>Origin</b></td>
                                <td style="${tblHeaderStyle}"><b>Destination</b></td>
                                <td style="${tblHeaderStyle}"><b>Route</b></td>
                                <td style="${tblHeaderStyle}"><b>Check In Date</b></td>
                                <td style="${tblHeaderStyle}"><b>Check In Time</b></td>
                                <td style="${tblHeaderStyle}"><b>Check Out Date</b></td>
                                <td style="${tblHeaderStyle}"><b>Check Out Time</b></td>
                                <td style="${tblHeaderStyle}"><b>Queueing Duration</b></td>
                                <td style="${tblHeaderStyle}"><b>Processing Duration</b></td>
                                <td style="${tblHeaderStyle}"><b>Idling Duration</b></td>
                                <td style="${tblHeaderStyle}"><b>CICO Duration</b></td>
                                <td style="${tblHeaderStyle}"><b>Transit Duration</b></td>
                                <td style="${tblHeaderStyle}"><b>Completion Date</b></td>
                                <td style="${tblHeaderStyle}"><b>Completion Time</b></td>
                                <td style="${tblHeaderStyle}"><b>Posted By</b></td>
                                <td style="${tblHeaderStyle}"><b>Posting Date</b></td>
                                <td style="${tblHeaderStyle}"><b>Posting Time</b></td>
                                <td style="${tblHeaderStyle}"><b>Status</b></td>
                                <td style="${tblHeaderStyle}"><b>Late Entry</b></td>
                                <td style="${tblHeaderStyle}"><b>Comments</b></td>
                                <td style="${tblHeaderStyle}width:500px;"><b>Remarks</b></td>
                            </tr>
                            ${rows}
                        </table>`;
            },
            SER: function(title,docs,date_from,date_to){
                var rows = "";
                var tblHeaderStyle = "font-family:Arial;font-size:12px;font-weight:bold;text-align:center;height:22px;vertical-align:middle;";
                var tblBodyStyle = "font-family:Arial;font-size:12px;mso-number-format:'\@';font-weight:bold;text-align:center;";

                docs.forEach(val => {
                    var data = new Dispatch(val);
                    var comments = (data.comments == "-") ? "" : data.comments;

                    rows += `<tr>
                                <td style="${tblBodyStyle}">${data.truck_number}</td>
                                <td style="${tblBodyStyle}">${data.destination}</td>
                                <td style="${tblBodyStyle}">${data.shift_schedule}</td>
                                <td style="${tblBodyStyle}"></td>
                                <td style="${tblBodyStyle}"></td>
                                <td style="${tblBodyStyle}">${(data.driver||"").toUpperCase()}</td>
                                <td style="${tblBodyStyle}">${(data.checker||"").toUpperCase()}</td>
                                <td style="${tblBodyStyle}">${(data.helper||"").toUpperCase()}</td>
                                <td style="${tblBodyStyle}">${(comments||"").toUpperCase()}</td>
                            </tr>`;
                });
                var dateFrom = (moment(new Date(date_from)).format("MMMM DD, YYYY")).toUpperCase();
                var dateTo = (moment(new Date(date_to)).format("MMMM DD, YYYY")).toUpperCase();
                var finalDate = (dateFrom == dateTo) ? dateFrom : `${dateFrom} - ${dateTo}`;
                return `<table id="report-hidden" style="opacity:0;" data-SheetName="My custom sheet 0">
                            <tbody>
                                <tr> <td style="font-family:Arial;font-size:16.5px;text-align:center;" colspan=8><b>STRAIGHT AHEAD DELIVERY CORPORATION</b></td> </tr>
                                <tr> <td style="font-family:Arial;font-size:15px;text-align:center;" colspan=8><b>DELIVERY PERSONNEL TRUCK SCHEDULE</b></td> </tr>
                                <tr> <td style="font-family:Arial;font-size:13px;text-align:center;" colspan=8><b>SKELETAL WORK FORCE</b></td> </tr>
                                <tr> <td style="font-family:Arial;font-size:12px;text-align:center;" colspan=8><b>BASE TO BASE DELIVERY</b></td> </tr>
                                <tr> 
                                    <td style="font-family:Arial;font-size:12px;text-align:center;" colspan=6></td> 
                                    <td style="font-family:Arial;font-size:12px;text-align:right;"><b>DATE:</b></td> 
                                    <td style="font-family:Arial;font-size:12px;text-align:center;"><b>${finalDate}</b></td> 
                                </tr>
                                <tr>
                                    <td style="${tblHeaderStyle}width:70px;"><b>TRUCK</b></td>
                                    <td style="${tblHeaderStyle}width:65px;"><b>DEPOT</b></td>
                                    <td style="${tblHeaderStyle}width:125px;"><b>SCHEDULE</b></td>
                                    <td style="${tblHeaderStyle}width:100px;"><b>TIME OUT</b></td>
                                    <td style="${tblHeaderStyle}width:100px;"><b>TIME IN</b></td>
                                    <td style="${tblHeaderStyle}width:200px;"><b>DRIVER</b></td>
                                    <td style="${tblHeaderStyle}width:200px;"><b>CHECKER</b></td>
                                    <td style="${tblHeaderStyle}width:200px;"><b>HELPER</b></td>
                                    <td style="${tblHeaderStyle}width:300px;"><b>REMARKS</b></td>
                                </tr>
                                ${rows}
                            </tbody>
                        </table>`;
            },
            mtur: function(title,docs,date_from,date_to){
                var rows = "";
                var excelHeaderStyle = "font-family:Arial;font-size:12px;font-weight:bold;vertical-align:middle;border:none;";
                var tblHeaderStyle = "font-family:Arial;font-size:12px;font-weight:bold;text-align:center;height:22px;vertical-align:middle;border:thin solid black;";
                var tblBodyStyle = "font-family:Arial;font-size:12px;mso-number-format:'\@';border:thin solid black;";

                var month = moment(date_from).format("MMM");
                var year = moment(date_from).format("YYYY");
                var daysInMonths = moment(date_from).daysInMonth();

                var totalVehicles = LIST["vehicles"].length;
                var totalManpower = LIST["vehicle_personnel"].filter(x => x.occupation == "Driver" || x.occupation == "Checker" || x.occupation == "Helper").length;

                var dataTotalVehicles = [];
                var dataTotalManpower = [];

                var tablesHTML = "";

                for(var i = 1; i < daysInMonths+1; i++){
                    var dateMoment = moment(`${month} ${i}, ${year}`);
                    var date = dateMoment.format("MM/DD/YYYY");

                    var startEndDate = moment(date, "MM/DD/YYYY");
                    var filtered = docs.filter(x => moment(moment(x.scheduled_date).format("MM/DD/YYYY"), "MM/DD/YYYY").isBetween(startEndDate, startEndDate, 'days', '[]'));


                    var vehicles_list = [];
                    var vehicle_ids = [];
                    var manpower_ids = [];
                    var driver_list = [];
                    var checker_list = [];
                    var helper_list = [];
                    filtered.forEach(val => {
                        if(!vehicle_ids.includes(val.vehicle_id)){
                            vehicle_ids.push(val.vehicle_id);

                            var vehicle = getVehicle(val.vehicle_id) || {};
                            vehicles_list.push(`<tr>
                                                    <td style="${tblBodyStyle}text-align:left;">${vehicles_list.length+1}</td>
                                                    <td style="${tblBodyStyle}text-align:left;">${vehicle.name || "-"}</td>
                                                </tr>`);
                        }
                        if(val.driver_id && !manpower_ids.includes(val.driver_id)){
                            manpower_ids.push(val.driver_id);

                            var driver = getVehiclePersonnel(val.driver_id) || {};
                            driver_list.push(`<tr>
                                                    <td style="${tblBodyStyle}text-align:left;">${driver_list.length+1}</td>
                                                    <td style="${tblBodyStyle}text-align:left;">${driver.name || "-"}</td>
                                                </tr>`);
                        }
                        if(val.checker_id && !manpower_ids.includes(val.checker_id)){
                            manpower_ids.push(val.checker_id);

                            var checker = getVehiclePersonnel(val.checker_id) || {};
                            checker_list.push(`<tr>
                                                    <td style="${tblBodyStyle}text-align:left;">${checker_list.length+1}</td>
                                                    <td style="${tblBodyStyle}text-align:left;">${checker.name || "-"}</td>
                                                </tr>`);
                        }
                        if(val.helper_id && !manpower_ids.includes(val.helper_id)){
                            manpower_ids.push(val.helper_id);

                            var helper = getVehiclePersonnel(val.helper_id) || {};
                            helper_list.push(`<tr>
                                                    <td style="${tblBodyStyle}text-align:left;">${helper_list.length+1}</td>
                                                    <td style="${tblBodyStyle}text-align:left;">${helper.name || "-"}</td>
                                                </tr>`);
                        }

                        (dataTotalVehicles.includes(val.vehicle_id)) ? null : dataTotalVehicles.push(val.vehicle_id);
                        (dataTotalManpower.includes(val.driver_id)) ? null : dataTotalManpower.push(val.driver_id);
                        (dataTotalManpower.includes(val.checker_id)) ? null : dataTotalManpower.push(val.checker_id);
                        (dataTotalManpower.includes(val.helper_id)) ? null : dataTotalManpower.push(val.helper_id);
                    });

                    var vehicleUtilization = GET.ROUND_OFF((vehicle_ids.length/totalVehicles)*100);
                    var manpowerUtilization = GET.ROUND_OFF((manpower_ids.length/totalManpower)*100);
                    rows += `<tr>
                                <td style="${tblBodyStyle}text-align:center;font-weight:bold;">${date}</td>
                                <td style="${tblBodyStyle}text-align:center;">${vehicle_ids.length}</td>
                                <td style="${tblBodyStyle}text-align:center;">${vehicleUtilization}%</td>
                                <td style="${tblBodyStyle}text-align:center;">${manpower_ids.length}</td>
                                <td style="${tblBodyStyle}text-align:center;">${manpowerUtilization}%</td>
                            </tr>`;

                    tablesHTML += `<table id="report-hidden-${i}" data-SheetName="${dateMoment.format("MMM DD")}" border="1" style="border-collapse: collapse;opacity:0;">
                                        <tbody>
                                            <tr> <td style="${excelHeaderStyle}text-align:left;" colspan=2><b>Date: ${dateMoment.format("MMM DD, YYYY (dddd)")}</b></td> </tr>
                                            <tr> <td style="${excelHeaderStyle}text-align:left;" colspan=2><b>${title}</b></td> </tr>
                                            <tr> <td style="border:none;" colspan=2>&nbsp;</td> </tr>
                                            <tr> <td style="${tblHeaderStyle}" colspan=2>Trucks</b></td> </tr>
                                            ${vehicles_list.join("")}
                                            <tr> <td style="border:none;" colspan=2>&nbsp;</td> </tr>
                                            <tr> <td style="${tblHeaderStyle}" colspan=2>Manpower - Driver</b></td> </tr>
                                            ${driver_list.join("")}
                                            <tr> <td style="border:none;" colspan=2>&nbsp;</td> </tr>
                                            <tr> <td style="${tblHeaderStyle}" colspan=2>Manpower - Checker</b></td> </tr>
                                            ${checker_list.join("")}
                                            <tr> <td style="border:none;" colspan=2>&nbsp;</td> </tr>
                                            <tr> <td style="${tblHeaderStyle}" colspan=2>Manpower - Helper</b></td> </tr>
                                            ${helper_list.join("")}
                                        </tbody>
                                    </table>`;
                }

                var monthlyVehicleUtilization = GET.ROUND_OFF((dataTotalVehicles.length/totalVehicles)*100);
                var monthlyManpowerUtilization = GET.ROUND_OFF((dataTotalManpower.length/totalVehicles)*100);
                return `<table id="report-hidden" data-SheetName="Overview" border="1" style="border-collapse: collapse;opacity:0;">
                            <tbody>
                                <tr> <td style="${excelHeaderStyle}text-align:center;" colspan=5><b>${title}</b></td> </tr>
                                <tr> <td style="${excelHeaderStyle}text-align:center;" colspan=5><b>${moment(date_from).format("MM-YYYY")}</b></td> </tr>
                                <tr> <td style="border:none;" colspan=5>&nbsp;</td> </tr>
                                <tr> <td style="${excelHeaderStyle}" colspan=5>Total # of Trucks: <b>${totalVehicles}</b></td> </tr>
                                <tr> <td style="${excelHeaderStyle}" colspan=5>Total # of Manpower: <b>${totalManpower}</b></td> </tr>
                                <tr> <td style="border:none;" colspan=5>&nbsp;</td> </tr>
                                <tr> <td style="${excelHeaderStyle}" colspan=5>Monthly Truck Utilization: <b>${monthlyVehicleUtilization}%</b></td> </tr>
                                <tr> <td style="${excelHeaderStyle}" colspan=5>Monthly Manpower Utilization: <b>${monthlyManpowerUtilization}%</b></td> </tr>
                                <tr> <td style="border:none;" colspan=5>&nbsp;</td> </tr>
                                <tr>
                                    <td style="${tblHeaderStyle}width:90px;" rowspan=2><b>Date</b></td>
                                    <td style="${tblHeaderStyle}width:160px;" colspan=2><b>Truck Utilization</b></td>
                                    <td style="${tblHeaderStyle}width:160px;" colspan=2><b>Manpower Utilization</b></td>
                                </tr>
                                <tr>
                                    <td style="${tblHeaderStyle}width:80px;"><b>Raw</b></td>
                                    <td style="${tblHeaderStyle}width:80px;"><b>Percentage</b></td>
                                    <td style="${tblHeaderStyle}width:80px;"><b>Raw</b></td>
                                    <td style="${tblHeaderStyle}width:80px;"><b>Percentage</b></td>
                                </tr>
                                ${rows}
                            </tbody>
                        </table>
                        ${tablesHTML}`;
            },
            TODR: {
                process: function(docs,_date) {
                    var obj = {},
                        format = "hh:mm:ss A",
                        todayDate = moment(new Date(_date)).format("MM/DD/YYYY"),
                        yesterdayDate = moment(new Date(_date)).subtract(1, 'days').format("MM/DD/YYYY"),
                        yesterdayDoc = [],
                        todayDoc = [],
                        gMoment = function(type,time){
                            var date = (type == "t") ? todayDate : yesterdayDate;
                            return moment(new Date(`${date} ${time}`),format);
                        },
                        summaryTotal = {
                            "total":0,
                            "P05:01:00 PM - 12:00:59 AM":0,
                            "12:01:00 AM - 07:00:59 AM":0,
                            "07:01:00 AM - 09:00:59 AM":0,
                            "09:01:00 AM - 12:00:59 PM":0,
                            "12:01:00 PM - 03:00:59 PM":0,
                            "03:01:00 PM - 05:00:59 PM":0,
                        };
                    docs.forEach(val => {
                        // "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"
                        var _timestamp = moment(new Date(val.timestamp)).format("YYYY-MM-DD"),
                            _today = moment(new Date(_date)).format("YYYY-MM-DD"),
                            _yesterday = moment(new Date(_date)).subtract(1, 'days').format("YYYY-MM-DD");
                        if(_timestamp == _today){ // do not add "new Date(..)"
                            todayDoc.push(val);
                        }
                        if(_timestamp == _yesterday){
                            yesterdayDoc.push(val);
                        }
                        
                    });
                    if(todayDoc.length > 0){
                        todayDoc.forEach(ev => {
                            // stage is end
                            // from T2 - RULE_NAME is Check Out (start/end)
                            if(ev.stage == "end"){
                                if(!obj[ev.GEOFENCE_NAME]){
                                    obj[ev.GEOFENCE_NAME] = {
                                        "P05:01:00 PM - 12:00:59 AM":[],
                                        "12:01:00 AM - 07:00:59 AM":[],
                                        "07:01:00 AM - 09:00:59 AM":[],
                                        "09:01:00 AM - 12:00:59 PM":[],
                                        "12:01:00 PM - 03:00:59 PM":[],
                                        "03:01:00 PM - 05:00:59 PM":[],
                                    };
                                }
                                var time = moment(new Date(ev.timestamp),format); // do not remove new Date. Dont know why its working
                                
                                if (time.isBetween(gMoment("t","12:00:00 AM"), gMoment("t","12:00:59 AM"))) {
                                    if(obj[ev.GEOFENCE_NAME]["P05:01:00 PM - 12:00:59 AM"].indexOf(ev.USER_NAME) == -1)
                                    obj[ev.GEOFENCE_NAME]["P05:01:00 PM - 12:00:59 AM"].push(ev.USER_NAME);
                                }
                                if (time.isBetween(gMoment("t","12:01:00 AM"), gMoment("t","07:00:59 AM"))) {
                                    if(obj[ev.GEOFENCE_NAME]["12:01:00 AM - 07:00:59 AM"].indexOf(ev.USER_NAME) == -1)
                                        obj[ev.GEOFENCE_NAME]["12:01:00 AM - 07:00:59 AM"].push(ev.USER_NAME);
                                }
                                if (time.isBetween(gMoment("t","07:01:00 AM"), gMoment("t","09:00:59 AM"))) {
                                    if(obj[ev.GEOFENCE_NAME]["07:01:00 AM - 09:00:59 AM"].indexOf(ev.USER_NAME) == -1)
                                        obj[ev.GEOFENCE_NAME]["07:01:00 AM - 09:00:59 AM"].push(ev.USER_NAME);
                                }
                                if (time.isBetween(gMoment("t","09:01:00 AM"), gMoment("t","12:00:59 PM"))) {
                                    if(obj[ev.GEOFENCE_NAME]["09:01:00 AM - 12:00:59 PM"].indexOf(ev.USER_NAME) == -1)
                                        obj[ev.GEOFENCE_NAME]["09:01:00 AM - 12:00:59 PM"].push(ev.USER_NAME);
                                }
                                if (time.isBetween(gMoment("t","12:01:00 PM"), gMoment("t","03:00:59 PM"))) {
                                    if(obj[ev.GEOFENCE_NAME]["12:01:00 PM - 03:00:59 PM"].indexOf(ev.USER_NAME) == -1)
                                        obj[ev.GEOFENCE_NAME]["12:01:00 PM - 03:00:59 PM"].push(ev.USER_NAME);
                                }
                                if (time.isBetween(gMoment("t","03:01:00 PM"), gMoment("t","05:00:59 PM"))) {
                                    if(obj[ev.GEOFENCE_NAME]["03:01:00 PM - 05:00:59 PM"].indexOf(ev.USER_NAME) == -1)
                                        obj[ev.GEOFENCE_NAME]["03:01:00 PM - 05:00:59 PM"].push(ev.USER_NAME);
                                }
                            }
                        });
                    }
                    
                    if(yesterdayDoc.length > 0){
                        yesterdayDoc.forEach(ev => {
                            // stage is end
                            // from T2 - RULE_NAME is Check Out (start/end)
                            if(ev.stage == "end"){
                                if(!obj[ev.GEOFENCE_NAME]){
                                    obj[ev.GEOFENCE_NAME] = {
                                        "P05:01:00 PM - 12:00:59 AM":[],
                                        "12:01:00 AM - 07:00:59 AM":[],
                                        "07:01:00 AM - 09:00:59 AM":[],
                                        "09:01:00 AM - 12:00:59 PM":[],
                                        "12:01:00 PM - 03:00:59 PM":[],
                                        "03:01:00 PM - 05:00:59 PM":[],
                                    };
                                }
                                var time = moment(new Date(ev.timestamp),format); // do not add new Date. Dont know why its not working
                                if (time.isBetween(gMoment("y","05:01:00 PM"), gMoment("y","11:59:59 PM"))) {
                                    if(obj[ev.GEOFENCE_NAME]["P05:01:00 PM - 12:00:59 AM"].indexOf(ev.USER_NAME) == -1)
                                        obj[ev.GEOFENCE_NAME]["P05:01:00 PM - 12:00:59 AM"].push(ev.USER_NAME);
                                }
                            }
                        });
                    }

                    // SORT BY KEY(DC)
                    const ordered = {};
                    Object.keys(obj).sort().forEach(function(key) {
                        ordered[key] = obj[key];
                    });
                    obj = ordered;
                    
                    // SUMMARY
                    Object.keys(obj).forEach(key => {
                        Object.keys(obj[key]).forEach(key1 => {
                            summaryTotal.total += obj[key][key1].length;
                            summaryTotal[key1] += obj[key][key1].length;
                        });
                    });

                    return {
                        summaryTotal,
                        obj,
                        date:_date
                    }
                },
                generate: function(title,type,obj){
                    var html = ""

                    Object.keys(obj).forEach(key => {
                        var perHTML = "";
                        Object.keys(obj[key]).forEach(key1 => {
                            if(key1 == type){
                                perHTML += `<td style="text-align:left;word-wrap: break-word;vertical-align:top;${exlStyle}">${obj[key][key1].length}</td>`;
                                perHTML += `<td style="text-align:left;word-wrap: break-word;vertical-align:top;${exlStyle}">${obj[key][key1].join(", ")}</td>`;
                            }
                        });
                        html += `<tr>
                                        <td style="text-align:left;word-wrap: break-word;vertical-align:top;${exlStyle}">${key}</td>
                                        ${perHTML}
                                    </tr>`;
                    });
                    
                    return `<table id="report-hidden" style="opacity:0;">
                                <colgroup>
                                    <col width="250" style="vertical-align:middle;" />
                                    <col width="200" style="vertical-align:middle;" />
                                    <col width="750" style="vertical-align:middle;" />
                                </colgroup>
                                <tr>
                                    <td style="border: none;text-align:left;${exlStyle}" colspan=3>Report name: <b style="color:#c00000;">${title}</b></td>
                                </tr>
                                <tr>
                                    <td style="border: none;text-align:left;${exlStyle}" colspan=3>Date and Time of Download: ${DATETIME.FORMAT(new Date(),"MM/DD/YYYY hh:mm:ss A")}</td>
                                </tr>
                                <tr><td style="border: none;"></td></tr>
                                <tr>
                                    <td style="background-color:black;color:white;vertical-align:middle;${exlStyle}">Distribution Center (DC)</td>
                                    <td style="background-color:black;color:white;vertical-align:middle;${exlStyle}">Total No. of Trucks Outside DC</td>
                                    <td style="background-color:black;color:white;vertical-align:middle;${exlStyle}">Truck List</td>
                                </tr>
                                ${html}
                            </table> `;
                }
            }
        }
    }, 
    FUNCTION: {
        init:function(){
            PAGE.DISPLAY();

            var _l_GeofenceList = [],
                _new_ = true,
                initializePage = function(){
                    var geofencesOptions = `<option value="">All</option>`;
                    LIST["geofences"].forEach(val => {
                        geofencesOptions += `<option value="${val._id}">${val.value}</option>`;
                    });
                    
                    var _siteId = "",
                        _siteText = "All",
                        date_from,
                        date_to,
                        df_dt_dest = function(title,modal,_siteTitle,callback){
                            _siteId = "";

                            $(`body`).append(REPORTS.UI[modal](title,_siteTitle));
                            $(`#date_from,#date_to`).val(DATETIME.FORMAT(new Date(),"YYYY-MM-DD"));
                            $("#_site,#_origin_site,#_destination_site").html(geofencesOptions).select2().val("").change(function(){
                                _siteId = $(this).find("option:selected").val();
                                _siteText = $(this).find("option:selected").text();
                            });
                            $(`#generate-btn`).click(function(){
                                callback();
                            });
                        },
                        pagination = function(x){
                            $(`#generate-btn`).html(`<i class="la la-spinner la-spin mr-2"></i>Generating... 0%`).attr("disabled",true);

                            $.ajax({
                                url: x.countURL,
                                method: "GET",
                                timeout: 90000, // 1 minute and 30 seconds
                                headers: {
                                    "Authorization": SESSION_TOKEN
                                },
                                async: true
                            }).done(function (count) {
                                console.log("count",count);

                                var pb = new ProgressBar(count);
                                var docs = [];
                                var skip = 0;

                                function retrieveData(length){
                                    if(length == null || length == LIMIT){
                                        $.ajax({
                                            url: `${x.dataURL}/${skip}/${LIMIT}`,
                                            method: "GET",
                                            timeout: 90000, // 1 minute and 30 seconds
                                            headers: {
                                                "Authorization": SESSION_TOKEN
                                            },
                                            async: true
                                        }).done(function (_docs_) {
                                            if(!_docs_.error){
                                                length = _docs_.length;
                        
                                                if(_docs_.error){
                                                    toastr.error(_docs_.error.message);
                                                } else {
                                                    skip += length;
                                                    docs = docs.concat(_docs_);
                                                    var percent = pb.calculate();
                        
                                                    $(`#generate-btn`).html(`<i class="la la-spinner la-spin mr-2"></i>Generating... ${percent}%`);
                                                    
                                                    retrieveData(length);
                                                }
                                            }
                                        });
                                    } else {
                                        $(`#generate-btn`).html(`<i class="la la-spinner la-spin mr-2"></i>Generating... 100%`);
                                        x.callback(docs);
                                        $(`#report-hidden,#overlay,#temp-link,[data-SheetName]`).remove();
                                    }
                                }
                                retrieveData();

                            });
                        },
                        cicor_otr_report = function(_filter,callback){
                            var daterange = $(`#daterange`).val(),
                                filteredDaterange = FILTER.DATERANGE(daterange);
                                
                            date_from = filteredDaterange.$gte;
                            date_to = filteredDaterange.$lt;

                            if(date_from.isEmpty() || date_to.isEmpty()){
                                toastr.error("Please fill all the required fields.");
                            } else {
                                var filter = {
                                        status: _filter.status || "complete",
                                        departure_date: FILTER.DATERANGE(`${DATETIME.FORMAT(date_from,"MM/DD/YYYY")} - ${DATETIME.FORMAT(date_to,"MM/DD/YYYY")}`)
                                    },
                                    filterSite = (_siteId != "") ? _filter : {};
                                filter = $.extend(filter,filterSite);

                                pagination({
                                    countURL: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}/count`,
                                    dataURL: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}`,
                                    callback
                                });
                            }
                        },
                        pbpa_report = function(_filter,callback){
                            var daterange = $(`#daterange`).val(),
                                filteredDaterange = FILTER.DATERANGE(daterange);
                                
                            date_from = filteredDaterange.$gte;
                            date_to = filteredDaterange.$lt;

                            if(date_from.isEmpty() || date_to.isEmpty()){
                                toastr.error("Please fill all the required fields.");
                            } else {
                                var filter = {
                                        status: "complete",
                                        departure_date: FILTER.DATERANGE(`${DATETIME.FORMAT(date_from,"MM/DD/YYYY")} - ${DATETIME.FORMAT(date_to,"MM/DD/YYYY")}`)
                                    },
                                    filterSite = (_siteId != "") ? _filter : {};
                                filter = $.extend(filter,filterSite);

                                pagination({
                                    countURL: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}/count`,
                                    dataURL: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}`,
                                    callback
                                });
                            }
                        },
                        hwtr_report = function(_filter,callback){
                            var daterange = $(`#daterange`).val(),
                                filteredDaterange = FILTER.DATERANGE(daterange);

                            date_from = filteredDaterange.$gte;

                            if(date_from.isEmpty()){
                                toastr.error("Please fill all the required fields.");
                            } else {
                                var filter = {
                                        // status: "complete",
                                        departure_date: FILTER.DATERANGE(`${DATETIME.FORMAT(date_from,"MM/DD/YYYY")}`)
                                    },
                                    filterSite = (_siteId != "") ? _filter : {};
                                filter = $.extend(filter,filterSite);

                                pagination({
                                    countURL: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}/count`,
                                    dataURL: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}`,
                                    callback
                                });
                            }
                        },
                        tr_report = function(callback){
                            var daterange = $(`#daterange`).val(),
                                filteredDaterange = FILTER.DATERANGE(daterange);

                            date_from = filteredDaterange.$gte;
                            
                            var origin = $(`#_origin_site option:selected`).text() || "All",
                                destination = $(`#_destination_site option:selected`).text() || "All",
                                destination_id = $(`#_destination_site option:selected`).val() || 0,
                                region = "-";

                            if(date_from.isEmpty()){
                                toastr.error("Please fill all the required fields.");
                            } else {
                                $(`#generate-btn`).html(`<i class="la la-spinner la-spin mr-2"></i>Generate report`).attr("disabled",true);
                                if(destination != "All"){
                                    GET.AJAX({
                                        url: `api/geofences/${CLIENT.id}/${USER.username}/${destination_id}`,
                                        method: "GET",
                                        headers: {
                                            "Authorization": SESSION_TOKEN
                                        },
                                    }, function(docs){
                                        console.log("Geofence:",docs);
                                        if(docs[0]){
                                            region = docs[0].region.region || "-";
                                        }
                                        callback({origin,destination,region});
                                        $(`#report-hidden,#overlay,#temp-link,[data-SheetName]`).remove();
                                    }, function(error){
                                        console.log(error);
                                        callback({origin,destination,region});
                                        $(`#report-hidden,#overlay,#temp-link,[data-SheetName]`).remove();
                                    });
                                } else {
                                    callback({origin,destination,region});
                                    $(`#report-hidden,#overlay,#temp-link,[data-SheetName]`).remove();
                                }
                            }
                        },
                        vcr_report = function(callback){
                            var daterange = $(`#daterange`).val(),
                                filter = {
                                    timestamp: FILTER.DATERANGE(daterange,true,true),
                                };
                            date_from = filter.timestamp.$gte;
                            date_to = filter.timestamp.$lt;

                            pagination({
                                countURL: `/api/events/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}/count`,
                                dataURL: `/api/events/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}`,
                                callback: function(docs){
                                    docs.sort(function (a, b) {
                                        return a.USER_NAME.localeCompare(b.USER_NAME) || new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                                    });
                                    callback(docs);
                                }
                            });
                        },
                        ular_report = function(callback){
                            var daterange = $(`#daterange`).val(),
                                filteredDaterange = FILTER.DATERANGE(daterange,true,true),
                                filter = {
                                    $or: [
                                        {login_date: filteredDaterange},
                                        {logout_date: filteredDaterange},
                                    ]
                                };
                            date_from = filteredDaterange.$gte;
                            date_to = filteredDaterange.$lt;

                            pagination({
                                countURL: `/api/user_login_activity/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}/count`,
                                dataURL: `/api/user_login_activity/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}`,
                                callback: function(docs){
                                    docs.sort(function (a, b) {
                                        return a.username.localeCompare(b.username) || new Date(a.login_date).getTime() - new Date(b.login_date).getTime();
                                    });
                                    callback(docs);
                                }
                            });
                        },
                        desr_report = function(callback){
                            var daterange = $(`#daterange`).val(),
                                filteredDaterange = FILTER.DATERANGE(daterange,true,true),
                                filter = { posting_date: filteredDaterange };
                                
                            date_from = filteredDaterange.$gte;
                            date_to = filteredDaterange.$lt;

                            pagination({
                                countURL: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}/count`,
                                dataURL: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}`,
                                callback: function(docs){
                                    docs.sort(function (a, b) {
                                        return new Date(a.posting_date).getTime() - new Date(b.posting_date).getTime();
                                    });
                                    callback(docs);
                                }
                            });
                        },
                        ser_report = function(callback){
                            var daterange = $(`#daterange`).val(),
                                filteredDaterange = FILTER.DATERANGE(daterange),
                                filter = { scheduled_date: filteredDaterange }; // , status: "scheduled"
                                
                            date_from = filteredDaterange.$gte;
                            date_to = filteredDaterange.$lt;

                            pagination({
                                countURL: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}/count`,
                                dataURL: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}`,
                                callback: function(docs){
                                    docs.sort(function (a, b) {
                                        return new Date(a.posting_date).getTime() - new Date(b.posting_date).getTime();
                                    });
                                    callback(docs);
                                }
                            });
                        },
                        mtur_report = function(callback){
                            var _month = $(`#_month`).val(),
                                _year = $(`#_year`).val(),
                                dateMoment = moment(`${_month} 01, ${_year}`),
                                startDate = dateMoment.clone().startOf('month').format("MM/DD/YYYY"),
                                endDate = dateMoment.clone().endOf('month').format("MM/DD/YYYY"),
                                daterange = `${startDate} - ${endDate}`,
                                filteredDaterange = FILTER.DATERANGE(daterange),
                                filter = { scheduled_date: filteredDaterange };
                                
                            date_from = filteredDaterange.$gte;
                            date_to = filteredDaterange.$lt;

                            pagination({
                                countURL: `/api/dispatch/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}/count`,
                                dataURL: `/api/dispatch/${CLIENT.id}/${USER.username}/mtur/${JSON.stringify(filter)}`,
                                callback: function(docs){
                                    console.log("docs",docs);
                                    docs.sort(function (a, b) {
                                        return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
                                    });
                                    callback(docs);
                                }
                            });
                        };

                    // dependent of geofences!!!!!

                    /**************** REPORT LISTENER ****************/
                    $(`[cicor]`).click(function(){
                        var title = "CICO Report";
                        df_dt_dest(title,"REPORT_MODAL_01","Plant Site",function(){
                            cicor_otr_report(
                                {origin_id: _siteId},
                                function(docs){
                                    $(`body`).append(REPORTS.UI.REPORTS.CICOR(title,docs,_siteText,date_from,date_to));
                                    GENERATE.TABLE_TO_EXCEL("report-hidden",`${title}_${DATETIME.FORMAT(date_from,"MM_DD_YYYY")}`);
                                }
                            );
                        });
                        $('#daterange').daterangepicker({
                            locale: {
                                format: 'MM/DD/YYYY'
                            }
                        });
                    });
                    $(`[otr]`).click(function(){
                        var title = "Over Transit Report";
                        df_dt_dest(title,"REPORT_MODAL_01","Plant Site",function(){
                            cicor_otr_report(
                                {origin_id: _siteId,status: {$in:["complete"]}},
                                function(docs){
                                    $(`body`).append(REPORTS.UI.REPORTS.OTR(title,docs,_siteText,date_from,date_to));
                                    GENERATE.TABLE_TO_EXCEL("report-hidden",`${title}_${DATETIME.FORMAT(date_from,"MM_DD_YYYY")}`);
                                } 
                            );
                        });
                        $('#daterange').daterangepicker({
                            locale: {
                                format: 'MM/DD/YYYY'
                            }
                        });
                    });
                    $(`[pbpa]`).click(function(){
                        var title = "Per Base Plant Activity";
                        df_dt_dest(title,"REPORT_MODAL_01","Plant Base",function(){
                            pbpa_report(
                                {origin_id: _siteId},
                                function(docs){
                                    $(`body`).append(REPORTS.UI.REPORTS.PBPA(title,docs,_siteText,date_from,date_to));
                                    GENERATE.TABLE_TO_EXCEL("report-hidden",`${title}_${DATETIME.FORMAT(date_from,"MM_DD_YYYY")}`);
                                }
                            );
                        });
                        $('#daterange').daterangepicker({
                            locale: {
                                format: 'MM/DD/YYYY'
                            }
                        });
                    });
                    $(`[hwtr]`).click(function(){
                        var title = "Haulage Window Time Report";
                        df_dt_dest(title,"REPORT_MODAL_02","Destination Site",function(){
                            hwtr_report(
                                {destination: { $elemMatch: { "location_id": _siteId } }},
                                function(docs){
                                    $(`body`).append(REPORTS.UI.REPORTS.HWTR(title,docs,_siteText,date_from));
                                    GENERATE.TABLE_TO_EXCEL("report-hidden",`${title}_${DATETIME.FORMAT(date_from,"MM_DD_YYYY")}`);
                                }
                            );
                        });
                        $('#daterange').daterangepicker({
                            singleDatePicker: true,
                            locale: {
                                format: 'MM/DD/YYYY'
                            }
                        });
                    });
                    $(`[tr]`).click(function(){
                        var title = "Trippage Report";
                        df_dt_dest(title,"REPORT_MODAL_04",null,function(){
                            tr_report(function(location){
                                    $(`body`).append(REPORTS.UI.REPORTS.TR(title,location,date_from));
                                    GENERATE.TABLE_TO_EXCEL("report-hidden",`${title}_${DATETIME.FORMAT(date_from,"MM_DD_YYYY")}`);
                                    $(`#report-hidden,#overlay,#temp-link,[data-SheetName]`).remove();
                                }
                            );
                        });
                        $('#daterange').daterangepicker({
                            singleDatePicker: true,
                            locale: {
                                format: 'MM/DD/YYYY'
                            }
                        });
                    });
                    $(`[vcr]`).click(function(){
                        var title = "Vehicle CICO Report";
                        df_dt_dest(title,"REPORT_MODAL_05",null,function(){
                            vcr_report(function(docs){
                                    $(`body`).append(REPORTS.UI.REPORTS.VCR(title,docs,date_from,date_to));
                                    GENERATE.TABLE_TO_EXCEL("report-hidden",`${title}_${DATETIME.FORMAT(date_from,"MM_DD_YYYY_hh_mm_A")}_${DATETIME.FORMAT(date_to,"MM_DD_YYYY_hh_mm_A")}`);
                                    $(`#report-hidden,#overlay,#temp-link,[data-SheetName]`).remove();
                                }
                            );
                        });
                        $('#daterange').daterangepicker({
                            timePicker: true,
                            locale: {
                                format: 'MM/DD/YYYY hh:mm A'
                            }
                        });
                    });
                    $(`[ular]`).click(function(){
                        var title = "User Login Activity Report";
                        df_dt_dest(title,"REPORT_MODAL_05",null,function(){
                            ular_report(function(docs){
                                    $(`body`).append(REPORTS.UI.REPORTS.ULAR(title,docs,date_from,date_to));
                                    GENERATE.TABLE_TO_EXCEL("report-hidden",`${title}_${DATETIME.FORMAT(date_from,"MM_DD_YYYY_hh_mm_A")}_${DATETIME.FORMAT(date_to,"MM_DD_YYYY_hh_mm_A")}`);
                                    $(`#report-hidden,#overlay,#temp-link,[data-SheetName]`).remove();
                                }
                            );
                        });
                        $('#daterange').daterangepicker({
                            timePicker: true,
                            locale: {
                                format: 'MM/DD/YYYY hh:mm A'
                            }
                        });
                    });
                    $(`[desr]`).click(function(){
                        var title = "Dispatch Entries Summary Report";
                        df_dt_dest(title,"REPORT_MODAL_05",null,function(){
                            desr_report(function(docs){
                                $(`body`).append(REPORTS.UI.REPORTS.DESR(title,docs,date_from,date_to));
                                GENERATE.TABLE_TO_EXCEL("report-hidden",`${title}_${DATETIME.FORMAT(date_from,"MM_DD_YYYY_hh_mm_A")}_${DATETIME.FORMAT(date_to,"MM_DD_YYYY_hh_mm_A")}`);
                                $(`#report-hidden,#overlay,#temp-link,[data-SheetName]`).remove();
                            });
                        });
                        $('#daterange').daterangepicker({
                            timePicker: true,
                            locale: {
                                format: 'MM/DD/YYYY hh:mm A'
                            }
                        });
                    });
                    $(`[ser]`).click(function(){
                        var title = "Scheduled Entries Report";
                        df_dt_dest(title,"REPORT_MODAL_05",null,function(){
                            ser_report(function(docs){
                                $(`body`).append(REPORTS.UI.REPORTS.SER(title,docs,date_from,date_to));
                                GENERATE.TABLE_TO_EXCEL("report-hidden",`${title}_${DATETIME.FORMAT(date_from,"MM_DD_YYYY_hh_mm_A")}_${DATETIME.FORMAT(date_to,"MM_DD_YYYY_hh_mm_A")}`);
                                $(`#report-hidden,#overlay,#temp-link,[data-SheetName]`).remove();
                            });
                        });

                        var minDate = moment().add(1,'days').format("MM/DD/YYYY");
                        var maxDate = moment().add(2,'days').format("MM/DD/YYYY");
                        $('#daterange').daterangepicker({
                            opens: 'left',
                            // singleDatePicker:true,
                            // minDate,
                            locale: {
                                format: 'MM/DD/YYYY'
                            },
                        }).val(`${minDate} - ${maxDate}`);
                        
                        $('#daterange').data('daterangepicker').setStartDate(minDate);
                        $('#daterange').data('daterangepicker').setEndDate(maxDate);
                    });
                    $(`[mtur]`).click(function(){
                        var title = "Manpower and Truck Utilization Report";
                        df_dt_dest(title,"REPORT_MODAL_07",null,function(){
                            mtur_report(function(docs){
                                $(`body`).append(REPORTS.UI.REPORTS.mtur(title,docs,date_from,date_to));
                                var tableIds = [];
                                $(`[data-SheetName]`).each((i,el) => { tableIds.push(`#${$(el).attr("id")}`); });
                                tablesToExcel(tableIds.join(","), `${title}_${DATETIME.FORMAT(date_from,"MM_DD_YYYY_hh_mm_A")}_${DATETIME.FORMAT(date_to,"MM_DD_YYYY_hh_mm_A")}.xls`);
                                $(`#report-hidden,#overlay,#temp-link,[data-SheetName]`).remove();
                            });
                        });

                        $("#_month").val(moment().format("MM"));
                        $("#_year").val(moment().format("YYYY"));
                    });
                    /**************** END REPORT LISTENER ****************/
                };

            /******** TABLE CHECK ********/
            TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                isFinishedLoading(["GEOFENCES","ROUTES","VEHICLES"], _new_, function(){
                    _new_ = false;
                    LIST["geofences"].forEach(val => {
                        val.value = val.short_name;
                        _l_GeofenceList.push(val);
                    });

                    initializePage();
                    $(`.custom-btn-01 i`).removeClass("la-spin la-spinner").addClass("la-download");
                    $(`.custom-btn-01:not([no_function])`).removeClass("disabled");
                });
            }
            TABLE.FINISH_LOADING.START_CHECK();
            /******** END TABLE CHECK ********/
        }
    }
};
var NOTIFICATIONS = {
    FUNCTION: {
        stream: null,
        init: function(){
            var urlParams = new URLSearchParams(window.location.search),
                __data = CRYPTO.DECRYPT(urlParams.get('data')),
                urlPath = "notifications",
                _new_ = true,
                filter = __data.filter || {},  //username: USER.username
                _ids = __data._ids || [],
                _escalation = __data.escalation;
            __data.for = urlPath;

            if(_ids.length > 0){
                filter = {};
                var __ids = [];
                _ids.forEach(val => {
                    __ids.push(val);
                });
                filter["dispatch_id"] = {$in: __ids};
                filter["username"] = USER.username;
                if(_escalation){
                    filter["escalation"] = Number(_escalation);
                }
            }

            /******** TABLE ********/
            var table_id = '#tbl-notifications',
                dt = null,
                rowData = function(obj){
                    var dispatch = obj.dispatchDetails || {status:"deleted"},
                        action = TABLE.ROW_BUTTONS(PAGE.GET(),{username:obj.username,status:dispatch.status,loadView:["comment"],readonlyArr:["comment"]}); 
                    $(`${table_id} th:last-child`).css({"min-width":action.width,"width":action.width});
                    
                    (obj._row) ? null : obj._row = GENERATE.RANDOM(36);
                    LIST[urlPath].push(obj);

                    var user = getUser(obj.username||"") || {};
                    var sent_to = ((USER.username == obj.username)?"You":(user.name || obj.username || "-"));
                    var type = "lq";
                    if(obj.delay_type == "Over CICO") type = "oc";
                    if(obj.delay_type == "Over Transit") type = "ot";

                    return TABLE.COL_ROW(null,{
                        'dispatch_id': obj.dispatch_id,
                        '_row':  obj._row,
                        '_id':  obj._id,
                        'type': type,
                        'Shipment No': dispatch._id || obj.dispatch_id,
                        'Departure Date': DATETIME.FORMAT(dispatch.departure_date),
                        'Delay Type': obj.delay_type || "-",
                        'Escalation': obj.escalation || "-",
                        'Timelapse': DATETIME.HH_MM(null,obj.timelapse).hour_minute,
                        'Site': obj.site || "-",
                        'Status': GET.STATUS(dispatch.status).html,
                        'DateTime': DATETIME.FORMAT(obj.timestamp),
                        'Sent to': sent_to,
                        'Action': action.buttons,
                    },"Sent to").row;
                },
                populateTable = function(newlyLoaded){
                    LIST[urlPath] = [];
                    var __filter = ($.isEmptyObject(filter)) ? {timestamp: FILTER.DATERANGE()} : filter; //username: USER.username
                    var dt_buttons = TABLE.BUTTONS({
                        goto: PAGE.GET(),
                        actions:{
                            refresh: function(){
                                populateTable(null);
                            },
                            filter: function(){
                                $(`#export-container`).hide("slide", {direction:'right'},100);
                                $(`#filter-container`).toggle("slide", {direction:'right'},100);
                            },
                            export: function(){
                                $(`#filter-container`).hide("slide", {direction:'right'},100);
                                $(`#export-container`).toggle("slide", {direction:'right'},100);
                            }
                        }
                    });

                    if(ISMOBILE){
                        $(`#refresh-toggle .la-refresh`).addClass("la-spin");
                        $(`#refresh-toggle`).addClass("disabled");
                        $(`#filter-container input,#filter-container select`).attr("disabled",true);
                        $(`#filter-container button,#filter-container a`).addClass("disabled");
                        
                        (ENVIRONMENT == "development") ? null : __filter.username = USER.username;
                        
                        GET.AJAX({
                            url: `/api/${urlPath}/${CLIENT.id}/${USER.username}/all/${JSON.stringify(__filter)}/0/0`,
                            method: "GET",
                            headers: {
                                "Authorization": SESSION_TOKEN
                            },
                        }, function(docs){
                            console.log("docs",docs);
                            var listHTML = "";
                            docs.forEach((val,i) => {
                                var index = LIST[urlPath].findIndex(x => x._id.toString() == val._id.toString());
                                if(index > -1){
                                    LIST[urlPath][index] = val;
                                } else {
                                    val._row = GENERATE.RANDOM(36);
                                    LIST[urlPath].push(val);
                                }
                                listHTML += NOTIFICATIONS.FUNCTION.mobileAddToList({val,urlPath});
                            });
                            $(`#refresh-toggle .la-refresh`).removeClass("la-spin");
                            $(`#refresh-toggle`).removeClass("disabled");
                            $(`#filter-container input,#filter-container select`).attr("disabled",false);
                            $(`#filter-container button,#filter-container a`).removeClass("disabled");
                            $(`#filter-btn`).html("Apply");
                            if(newlyLoaded){
                                PAGE.DISPLAY();
                                $(`#filter-container`).css({width:"70%","top":"69px",height:"calc(100% - 134px)"});
                                $(`.panel.panel-profile .page-box`).css("margin-top","30px");
                                $(`.panel.panel-profile .clearfix`).before(mobileOptions.notifications.filter());
                                $(`#refresh-toggle`).click(function(){
                                    if(dt){}
                                    else { $(`.page-box.row > .col-sm-12`).html(`<div style="text-align: center;margin-top: 15px;">Loading...</div>`); }
                                    populateTable(null);
                                });
                                $(`#filter-toggle`).click(function(){
                                    $(`#filter-container`).toggle("slide", {direction:'right'},100);
                                });
                                initializeFilter();
                                $(`.page-box.row`).addClass("p-2");
                                $(`.page-box.row > .col-sm-12`).removeClass().addClass("col-sm-12 p-0");
                                $(`.main-content`).addClass("p-0");
                            }

                            if(docs.length > 0){
                                $(`.page-box.row > .col-sm-12`).html(listHTML);
                            } else {
                                $(`.page-box.row > .col-sm-12`).html(`<div style="text-align: center;margin-top: 15px;">You do not have any notifications</div>`);
                            }
                            TABLE.WATCH({urlPath,options:function(){TABLE.FINISH_LOADING.START_CHECK();}});
                        });
                    
                    } else {
                        if(dt) dt.clear().draw();
                        TABLE.POPULATE({
                            url: `${urlPath}/${CLIENT.id}/${USER.username}/all`,
                            withFilter: true,
                            goto: urlPath,
                            urlPath,
                            withPagination: true,
                            filter: __filter, // add username: USER.username
                            commentTitle: "Notifications",
                            newlyLoaded,
                            table_id,
                            dataTableOptions: {
                                columns: TABLE.COL_ROW(CUSTOM.COLUMN.notifications(),null,"Sent to").column,
                                order: [[ 6, "desc" ]],
                                createdRow: function (row, data, dataIndex) {
                                    var _row = data._row;
                                    $(row).attr(`_row`, data._row);

                                    var _id = data.dispatch_id;
                                    var type = data.type;
                                    var docId = data._id;
                                    TABLE.ROW_LISTENER({table_id,_row,urlPath:urlPath,_id:docId,
                                        additionalListeners: function(){
                                            $(table_id).on('click', `[_row="${_row}"] [view],[_row="${_row}"] + tr.child [view]`,function(e){
                                                e.stopImmediatePropagation();
                                                $(`body`).append(MODAL.CREATE.EMPTY(`View Dispatch Entry`,modalViews.dispatch.form()));
                                                DISPATCH.FUNCTION.form({_id});
                                                $("html, body,#modal").animate({ scrollTop: 0 }, "fast");
                                            });
                                            $(table_id).on('click', `[_row="${_row}"] [comment],[_row="${_row}"] + tr.child [comment]`,function(e){
                                                e.stopImmediatePropagation();
                                                var __escalation = Number(data["Escalation"]);
                                                var position = "";
                                                if(__escalation == 1){
                                                    position = "ESCALATION 1";
                                                }
                                                if(__escalation == 2){
                                                    position = "ESCALATION 2";
                                                }
                                                if(__escalation == 3){
                                                    position = "ESCALATION 3";
                                                }
                                                MODAL.CONFIRMATION_W_FIELD({
                                                    content: `<div style="font-weight: normal;border-bottom: 1px solid #eee;padding: 3px 0px;border-top: 1px solid #eee;">${position}</div>Please add your comments/remarks below.<a id="${_id}-view" href="javascript:void(0);" class="mt-1 d-block">View shipment entry</a>`,
                                                    confirmCloseCondition: true,
                                                    confirmButtonText: "Submit",
                                                    confirmBGStyle: "background-color: #00a548;",
                                                    cancelButtonText: "Cancel",
                                                    confirmCallback: function(field_val){
                                                        var set = {};
                                                        var timestamp = new Date().getTime();
                                                        if(__escalation == 1){
                                                            set[`esc1_remarks.${timestamp}`] = {
                                                                remarks: field_val,
                                                                username: USER.username,
                                                                type
                                                            };
                                                        }
                                                        if(__escalation == 2){
                                                            set[`esc2_remarks.${timestamp}`] = {
                                                                remarks: field_val,
                                                                username: USER.username,
                                                                type
                                                            };
                                                        }
                                                        if(__escalation == 3){
                                                            set[`esc3_remarks.${timestamp}`] = {
                                                                remarks: field_val,
                                                                username: USER.username,
                                                                type
                                                            };
                                                        }
                                                        if(Object.keys(set).length > 0){
                                                            set[`history.${timestamp}`] = `<username>${USER.username}</username> added a comment/remark.`;
                                                            GET.AJAX({
                                                                url: `/api/dispatch/${CLIENT.id}/${USER.username}/${_id}`,
                                                                method: "PUT",
                                                                headers: {
                                                                    "Content-Type": "application/json; charset=utf-8",
                                                                    "Authorization": SESSION_TOKEN
                                                                },
                                                                data: JSON.stringify(set)
                                                            }, function(docs){
                                                                if(docs.ok == 1){
                                                                    toastr.success("Comment/remark added successfully.",null,{timeOut: 1500});
                                                                } else {
                                                                    toastr.error("Something went wrong</br></br>Error Code - ec023/03");
                                                                }
                                                                $(`#confirm-modal`).remove(); 
                                                            },function(error){
                                                                console.log(error);
                                                                $(`#confirm-modal`).remove();
                                                                toastr.error("Something went wrong</br></br>Error Code - ec023/03");
                                                            });
                                                        }
                                                    }
                                                });

                                                $(`#${_id}-view`).click(function(){
                                                    $(`body`).append(modalViews.dispatch.fullView(_id));
                                                    $("html, body,#modal").animate({ scrollTop: 0 }, "fast");
                                                });
                                            });
                                        }
                                    });
                                },
                                dom: 'lB<"toolbar">frtip',
                                buttons: dt_buttons
                            },
                            initializeCallback: function(data,_dt){
                                dt = _dt;
                                initializeFilter();
                                TABLE.WATCH({urlPath,rowData,options:function(){TABLE.FINISH_LOADING.START_CHECK();}});
                            },
                            populateCallback: function(data){
                                var rows = [];
                                $.each(data, function(i,val){
                                    rows.push(rowData(val));
                                });
                                dt.rows.add(rows).draw(false);
                            },
                        });
                    }
                },
                initializeFilter = function(){
                    $(`.page-box`).append(SLIDER.EXPORT()); 
                    TABLE.TOOLBAR(dt);
                    $(`.buttons-copy span`).html("Copy Table");
                    $(`.buttons-csv span`).html("Export Table As CSV File");
                    $(`.buttons-excel span`).html("Export Table As Excel File");

                    FILTER.RESET({
                        dateEl: `#_timestamp`,
                        selectEl: `#_delay_type,#_escalation`,
                        populateTable
                    });
                    
                    $(`#_timestamp`).daterangepicker({
                        opens: 'left',
                        autoUpdateInput: false,
                        autoApply: true
                    }, function(start, end, label) {
                        FILTER.INITIALIZE($(this)["0"].element,start,end);
                        $('.clearable').trigger("input");
                    }).on('apply.daterangepicker', function (ev, picker) {
                        FILTER.INITIALIZE($(this),picker.startDate,picker.endDate);
                        $('.clearable').trigger("input");
                    });
                    
                    if(!filter.dispatch_id){
                        if(filter.timestamp) FILTER.INITIALIZE(`#_timestamp`,filter.timestamp["$gte"],filter.timestamp["$lt"]);
                        if(filter.delay_type) $(`#_delay_type`).val(filter.delay_type);
                        if(filter.escalation) $(`#_escalation`).val(filter.escalation);
                        if(filter.timestamp || filter.delay_type || filter.escalation) {
                            $(`#filter-container`).toggle("slide", {direction:'right'},100);
                            $('.clearable').trigger("input");
                            $(`#reset-btn`).removeClass("disabled");
                            FILTER.STATUS = "new";
                        }
                    }
                    $(`#filter-btn`).click(function(){
                        filter = {};
                        var _timestamp = $(`#_timestamp`).val() || DEFAULT_DATE,
                            _delay_type = $(`#_delay_type`).val(),
                            _escalation = $(`#_escalation`).val();
                        (!_timestamp.isEmpty()) ? filter["timestamp"] = FILTER.DATERANGE(_timestamp) : null;
                        (_delay_type != "all") ? filter["delay_type"] = _delay_type : null;
                        (_escalation != "all") ? filter["escalation"] = Number(_escalation) : null;

                        FILTER.STATUS = "new";
                        
                        $(this).html(`<i class="la la-spinner la-spin"></i> Apply`).addClass("disabled");

                        __data = $.extend(__data,{filter});
                        window.history.pushState({}, null, `?data=${CRYPTO.ENCRYPT(__data)}#${PAGE.GET()}`);

                        if(dt){}
                        else { $(`.page-box.row > .col-sm-12`).html(`<div style="text-align: center;margin-top: 15px;">Loading...</div>`); }
                        populateTable();
                    });
                };
            LIST[urlPath] = [];
            populateTable(true);
            /******** END TABLE ********/

            /******** TABLE CHECK ********/
            TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                isFinishedLoading(["GEOFENCES","ROUTES","VEHICLES"], _new_, function(){
                    _new_ = false;
                   
                    TABLE.FINISH_LOADING.UPDATE();

                    $(table_id).on('page.dt length.dt draw.dt order.dt', function () {
                        TABLE.FINISH_LOADING.START_CHECK();
        
                        $(`${table_id} thead tr th`).each((i,el) => {
                            if(!$(el).is(":visible")){
                                $(`${table_id} tr:not(.child)`).each((i1,el1) => {
                                    $(el1).find("td").eq(i).hide();
                                });
                            }
                        });
                    });
                });
                isFinishedLoading(["GEOFENCES","ROUTES","VEHICLES"], true, function(){
                    TABLE.FINISH_LOADING.UPDATE();
                });
            }
            TABLE.FINISH_LOADING.START_CHECK();
            /******** END TABLE CHECK ********/
        },
        mobileAddToList: function(x,isWatch){
            var val = x.val,
                urlPath = x.urlPath,
                dispatch_id = val.dispatch_id,
                template = function(x){
                    // #91c151
                    var dispatch = ((x.dispatchDetails) ? x.dispatchDetails[0] : {status:"deleted"}) || {status:"deleted"},
                        user = getUser(x.username) || {},
                        status = dispatch.status,
                        action = (status == "deleted") ? {buttons:""} : TABLE.ROW_BUTTONS(PAGE.GET(),{username:x.username,status}),
                        readClass = (x.read === false) ? "unread" : "",
                        ongoingHTML = (!["complete","incomplete","deleted"].includes(status)) ? `<span class="ongoing" style="width: 7px;height: 7px;background: #00a548;border-radius: 20px;top: 14px;margin-left: 4px;position: absolute;"></span>` : "";
                        
                        return `<div class="container-parent col-sm-12 p-0 text-dark p-0" _row="${x._row}">
                                    <div class="container-header pt-2 pl-4 pr-4 pb-2 ${readClass}">
                                        <span class="container-header-title">${dispatch_id || "-"}${ongoingHTML}</span>
                                        <div class="container-header-body">${x.site}, ${x.escalation}, ${x.delay_type}</div>
                                        <i class="la la-angle-up" style="display:none;"></i>
                                    </div>
                                    <div class="container-body pr-4 pb-2" style="display:none;">
                                        <div><span style="display: table-cell;width: 80px;">Site</span><span style="display: table-cell;">${x.site}</span></div>
                                        <div><span style="display: table-cell;width: 80px;">Date/Time</span><span style="display: table-cell;">${DATETIME.FORMAT(x.timestamp)}</span></div>
                                        <div><span style="display: table-cell;width: 80px;">Escalation</span><span style="display: table-cell;">${x.escalation}</span></div>
                                        <div><span style="display: table-cell;width: 80px;">Timelapse</span><span style="display: table-cell;">${DATETIME.HH_MM(null,x.timelapse).hour_minute}</span></div>
                                        <div><span style="display: table-cell;width: 80px;">Delay Type</span><span style="display: table-cell;">${x.delay_type}</span></div>
                                        <div><span style="display: table-cell;width: 80px;">Sent to</span><span style="display: table-cell;">${user.name || x.username}</span></div>
                                        <div><span style="display: table-cell;width: 80px;">Action</span><span style="display: table-cell;">${action.buttons}</span></div>
                                    </div>
                                </div>`;
                },
                initializeListeners = function(){
                    var dispatch = ((val.dispatchDetails) ? val.dispatchDetails[0] : {status:"deleted"}) || {status:"deleted"};

                    $("body").on('click', `[_row="${val._row}"] > .container-header`,function(){
                        var el = $(this).parent(),
                            index = LIST[urlPath].findIndex(x => x._row == $(el).attr("_row")),
                            obj = LIST[urlPath][index],
                            removeActive = function(_el){
                                $(_el).removeClass("active");
                                $(_el).find(".container-body").slideUp(100,null,function(){
                                    $(_el).find(".container-header-body").slideDown(50);
                                });
                                $(_el).find(".la-angle-up").hide();
                                $(_el).find(".container-header-title .ongoing").css("opacity",1);
                                $(_el).find(".container-header-title > [status]").remove();
                            };
                        if($(el).hasClass("active")){
                            removeActive(el);
                        } else {
                            $(`.container-parent`).each((i,el1) => { removeActive(el1); });
                            $(el).addClass("active");
                            $(el).find(".container-body").slideDown(100,null,function(){
                                $(el).find(".container-header-body").slideUp(50);
                                $(el).find(".la-angle-up").slideDown(50);
                            });
                            $(el).find(".container-header-title .ongoing").css("opacity",0);
                            $(el).find(".container-header-title").append(`<span status> - ${dispatch.status.capitalize()}</span>`);
                            if(obj && !obj.read){
                                LIST[urlPath][index].read = true;
                                $(el).find(".container-header").removeClass("unread");
                                GET.AJAX({
                                    url: `/api/${urlPath}/${CLIENT.id}/${USER.username}/${obj._id}/read`,
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json; charset=utf-8",
                                        "Authorization": SESSION_TOKEN
                                    },
                                    data: JSON.stringify({})
                                });
                            }
                        }
                    });

                    $("body").on('click', `[_row="${val._row}"] [view]`,function(e){
                        e.stopImmediatePropagation();
                        $(`body`).append(MODAL.CREATE.EMPTY(`View Dispatch Entry`,modalViews.dispatch.form()));
                        DISPATCH.FUNCTION.form({_id:dispatch_id});
                        $("html, body,#modal").animate({ scrollTop: 0 }, "fast");
                    });
                    $("body").on('click', `[_row="${val._row}"] [comment]`,function(e){
                        e.stopImmediatePropagation();
                        $(`body`).append(MODAL.CREATE.EMPTY(`Add Comment on Dispatch Entry`,modalViews.dispatch.form()));
                        DISPATCH.FUNCTION.form({_id:dispatch_id,escalation:val.escalation,type:"delay"});
                        $("html, body,#modal").animate({ scrollTop: 0 }, "fast");
                    });
                };

            if(isWatch === true) {
                return new Promise((resolve,reject) => {
                    GET.AJAX({
                        url: `/api/dispatch/${CLIENT.id}/${USER.username}/${val.dispatch_id}`,
                        method: "GET",
                        headers: {
                            "Authorization": SESSION_TOKEN
                        },
                    }, function(docs){
                        var doc = docs[0];
                        if(doc){
                            val.dispatchDetails = [doc];
                        }
                        initializeListeners();
                        resolve(template(val));
                    });
                });
            } else {
                initializeListeners();
                return template(val);
            }
        }
    }
};
var EVENT_VIEWER = {
    FUNCTION: {
        stream:null,
        init:function(){
            var table = new Table({
                id: "#tbl-events",
                urlPath: "events",
                goto: "events_sn",
                dataTableOptions: {
                    columns: TABLE.COL_ROW(CUSTOM.COLUMN.event_viewer()).column,
                    order: [[ 0, "desc" ]],
                    createdRow: function (row, data, dataIndex) {
                        var _row = data._row;
                        $(row).attr(`_row`, _row);
                        table.rowListeners(_row,data._id);
                    },
                    dom: 'lB<"toolbar">frti<"tbl-progress-bar">p',
                }
            });
            table.filter = (CLIENT.type != 2) ? {timestamp: FILTER.DATERANGE(), shipment_number: {$exists:true}} : {timestamp: FILTER.DATERANGE()};
            table.setButtons({
                actions:{
                    refresh: function(){ table.countRows(); },
                    filter: function(){ $(`#filter-container`).toggle("slide", {direction:'right'},100); },
                    report: function(){ $(`#report-container`).toggle("slide", {direction:'right'},100); }, 
                }
            });
            table.addRow = function(obj){
                const _this = this;
                var _class = (obj.stage=="start") ? "text-success" : "text-danger",
                    action = TABLE.ROW_BUTTONS(PAGE.GET()); 
                $(`${_this.id} th:last-child`).css({"min-width":action.width,"width":action.width});

                obj.shipment_number = obj.shipment_number || [];
    
                return TABLE.COL_ROW(null,{
                    '_id': obj._id,
                    '_row':  obj._row,
                    'Date': DATETIME.FORMAT(obj.timestamp),
                    'Shipment Numbers': `${obj.shipment_number[0]}${GET.LENGTH(obj.shipment_number.length).text}`,
                    'Rule Name': `${obj.RULE_NAME} (<span class="${_class}">${obj.stage}</span>)`,
                    'Vehicle Name': obj.USER_NAME || "-",
                    'Geofence Name': obj.GEOFENCE_NAME || "-",
                    'Action': action.buttons,
                }).row;
            };
            table.rowListeners = function(_row,_id){
                const _this = this;
                $(_this.id).on('click', `[_row="${_row}"] [view],[_row="${_row}"] + tr.child [view]`,function(e){
                    e.stopImmediatePropagation();
                    var obj = LIST[_this.urlPath].find(x => x._id.toString() == _id.toString());
                    if(obj){
                        var _show = ["stage", "GEOFENCE_NAME","GEOFENCE_ID","RULE_NAME","USER_NAME","USER_USERNAME","ASSIGNED_VEHICLE_ID","Region","Cluster","Site"],
                            tbody = "";
                        $(`body`).append(modalViews.events.details(obj._id,obj.shipment_number));
                        
                        _show.forEach(key => {
                            tbody += `<tr>
                                <td>${key}</td>
                                <td>${obj[key] || "-"}</td>
                            </tr>`;
                        });
                        $(`#tbl-notification > tbody`).html(tbody);
                    }
                });
            };
            table.filterListener = function(_row,_id){
                FILTER.RESET({
                    dateEl: `#_date,#_rdate`,
                    populateTable: function(){
                        var _date = $(`#_date`).val() || DEFAULT_DATE;

                        FILTER.STATUS = "new";

                        $(this).html(`<i class="la la-spinner la-spin"></i> Apply`).addClass("disabled");
                        table.filter = (CLIENT.type != 2) ? {timestamp: FILTER.DATERANGE(_date), shipment_number: {$exists:true}} : {timestamp: FILTER.DATERANGE(_date)};
                        table.countRows();
                    }
                });
                $(`#_date,#_rdate`).daterangepicker({
                    opens: 'left',
                    autoUpdateInput: false,
                    singleDatePicker:true,
                    autoApply: true
                }, function(start, end, label) {
                    FILTER.INITIALIZE($(this)["0"].element,start,end);
                    $('.clearable').trigger("input");
                }).on('apply.daterangepicker', function (ev, picker) {
                    FILTER.INITIALIZE($(this),picker.startDate,picker.endDate);
                    $('.clearable').trigger("input");
                });
                $(`#filter-btn`).click(function(){
                    var _date = $(`#_date`).val() || DEFAULT_DATE;

                    FILTER.STATUS = "new";

                    $(this).html(`<i class="la la-spinner la-spin"></i> Apply`).addClass("disabled");

                    
                    table.filter = (CLIENT.type != 2) ? {timestamp: FILTER.DATERANGE(_date), shipment_number: {$exists:true}} : {timestamp: FILTER.DATERANGE(_date)};
                    table.countRows();
                });
                
                // for CokeT2
                var todr;
                $(`#report-btn`).click(function(){
                    var _rdate = $(`#_rdate`).val() || DEFAULT_DATE;
                    $(this).html(`<i class="la la-spinner la-spin"></i> Generate`).addClass("disabled");
                    $(`#mreport-container`).hide();
                    $(`[mreport]`).addClass("disabled");

                    var yesterday = moment(new Date(_rdate)).subtract(1, 'days').format("MM/DD/YYYY"),
                        filter = {
                            timestamp: FILTER.DATERANGE(`${yesterday}, 05:00 PM - ${_rdate}`,true),
                        };
                    $.ajax({
                        url: `/api/events/${CLIENT.id}/${USER.username}/all/${JSON.stringify(filter)}/0/0`,
                        method: "GET",
                        timeout: 90000, // 1 minute and 30 seconds
                        headers: {
                            "Authorization": SESSION_TOKEN
                        },
                        async: true
                    }).done(function (docs) {
                        console.log("Events SN:",docs);
                        // check until what time only
                        // enable or show dl links if here is report
                        todr = REPORTS.UI.REPORTS.TODR.process(docs,_rdate);

                        $(`#report-btn`).html(`Generate`).removeClass("disabled");
                        $(`#mreport-container`).show();
                        $(`#mreport-date`).html(moment(_rdate).format("MMMM DD, YYYY"));

                        Object.keys(todr.summaryTotal).forEach(key => {
                            if(todr.summaryTotal[key] > 0){
                                if(key == "P05:01:00 PM - 12:00:59 AM") $(`[mreport="todr-05-12"]`).removeClass("disabled");
                                if(key == "12:01:00 AM - 07:00:59 AM") $(`[mreport="todr-12-07"]`).removeClass("disabled");
                                if(key == "07:01:00 AM - 09:00:59 AM") $(`[mreport="todr-07-09"]`).removeClass("disabled");
                                if(key == "09:01:00 AM - 12:00:59 PM") $(`[mreport="todr-09-12"]`).removeClass("disabled");
                                if(key == "12:01:00 PM - 03:00:59 PM") $(`[mreport="todr-12-03"]`).removeClass("disabled");
                                if(key == "03:01:00 PM - 05:00:59 PM") $(`[mreport="todr-03-05"]`).removeClass("disabled");
                            }
                        });
                    }).fail(function(error){
                        console.log(error);
                        $(`#report-btn`).html(`Generate`).removeClass("disabled");
                        toastr.error("Something went wrong</br></br>Error Code - ec016/01");
                    });
                });
                var excelTitle = "Trucks Outside DC",
                    generateReport = function(type,customType){
                        var _title = `${excelTitle} On ${todr.date} @ ${customType || type}`,
                            _filename = _title.replace(/\//g,"_").replace(/:/g,"_").replace(/ /g,"_").replace(/@/g,"");
                        $(`body`).append(REPORTS.UI.REPORTS.TODR.generate(_title,type,todr.obj));
                        GENERATE.TABLE_TO_EXCEL("report-hidden",_filename);
                        $(`#report-hidden,#temp-link,[data-SheetName]`).remove();
                    };
                $(`[mreport="todr-05-12"]`).click(function(){
                    generateReport("P05:01:00 PM - 12:00:59 AM","(Prev) 05:01:00 PM - 12:00:59 AM");
                });
                $(`[mreport="todr-12-07"]`).click(function(){
                    generateReport("12:01:00 AM - 07:00:59 AM");
                });
                $(`[mreport="todr-07-09"]`).click(function(){
                    generateReport("07:01:00 AM - 09:00:59 AM");
                });
                $(`[mreport="todr-09-12"]`).click(function(){
                    generateReport("09:01:00 AM - 12:00:59 PM");
                });
                $(`[mreport="todr-12-03"]`).click(function(){
                    generateReport("12:01:00 PM - 03:00:59 PM");
                });
                $(`[mreport="todr-03-05"]`).click(function(){
                    generateReport("03:01:00 PM - 05:00:59 PM");
                });
                // end for CokeT2
            };
            table.initialize();
            table.countRows();
        }
    }
};
var ALL_EVENTS = {
    FUNCTION: {
        stream:null,
        init:function(){
            var table = new Table({
                id: "#tbl-all-events",
                urlPath: "events",
                perColumnSearch: true,
                goto: "all_events",
                dataTableOptions: {
                    columns: TABLE.COL_ROW(CUSTOM.COLUMN.all_events).column,
                    order: [[ 0, "desc" ]],
                    createdRow: function (row, data, dataIndex) {
                        var _row = data._row;
                        $(row).attr(`_row`, _row);
                        table.rowListeners(_row,data._id);
                    },
                    dom: 'lBrti<"tbl-progress-bar">p',
                }
            });
            table.filter = {timestamp: FILTER.DATERANGE()};
            table.setButtons({
                actions:{
                    refresh: function(){ table.countRows(); },
                    filter: function(){ $(`#filter-container`).toggle("slide", {direction:'right'},100); },
                    search: function(){ $(`.row-filter`).toggle(); }
                }
            });
            table.addRow = function(obj){
                const _this = this;
                var _class = (obj.stage=="start") ? "text-success" : "text-danger",
                    action = TABLE.ROW_BUTTONS(PAGE.GET()); 
                $(`${_this.id} th:last-child`).css({"min-width":action.width,"width":action.width});

                obj.shipment_number = obj.shipment_number || [];
    
                return TABLE.COL_ROW(null,{
                    '_id': obj._id,
                    '_row':  obj._row,
                    'Date': DATETIME.FORMAT(obj.timestamp,"MMM D, YYYY, h:mm:ss A"),
                    'Rule Name': `${obj.RULE_NAME} (<span class="${_class}">${obj.stage}</span>)`,
                    'Vehicle Name': obj.USER_NAME || "-",
                    'Geofence Name': obj.GEOFENCE_NAME || "-",
                    'Action': action.buttons,
                }).row;
            };
            table.rowListeners = function(_row,_id){
                const _this = this;
                $(table.id).on('click', `[_row="${_row}"] [view],[_row="${_row}"] + tr.child [view]`,function(e){
                    e.stopImmediatePropagation();
                    var obj = LIST[_this.urlPath].find(x => x._id.toString() == _id.toString());
                    if(obj){
                        var _show = ["stage","GEOFENCE_NAME","GEOFENCE_ID","RULE_NAME","USER_NAME","USER_USERNAME","ASSIGNED_VEHICLE_ID","Region","Cluster","Site"],
                            tbody = "";
                        $(`body`).append(modalViews.events.details(obj._id));
                        
                        _show.forEach(key => {
                            tbody += `<tr>
                                <td>${key}</td>
                                <td>${obj[key] || "-"}</td>
                            </tr>`;
                        });
                        $(`#tbl-notification > tbody`).html(tbody);
                    }
                });
            };
            table.filterListener = function(_row,_id){
                // initialize filter
                FILTER.RESET({
                    dateEl: `#_date`,
                    populateTable: function(){
                        var _date = $(`#_date`).val() || DEFAULT_DATE;

                        FILTER.STATUS = "new";

                        $(this).html(`<i class="la la-spinner la-spin"></i> Apply`).addClass("disabled");

                        table.filter = {timestamp: FILTER.DATERANGE(_date)};
                        table.countRows();
                    }
                });
                $(`#_date`).daterangepicker({
                    opens: 'left',
                    autoUpdateInput: false,
                    singleDatePicker:true,
                    autoApply: true
                }, function(start, end, label) {
                    FILTER.INITIALIZE($(this)["0"].element,start,end);
                    $('.clearable').trigger("input");
                }).on('apply.daterangepicker', function (ev, picker) {
                    FILTER.INITIALIZE($(this),picker.startDate,picker.endDate);
                    $('.clearable').trigger("input");
                });
                $(`#filter-btn`).click(function(){
                    var _date = $(`#_date`).val() || DEFAULT_DATE;

                    FILTER.STATUS = "new";

                    $(this).html(`<i class="la la-spinner la-spin"></i> Apply`).addClass("disabled");

                    table.filter = {timestamp: FILTER.DATERANGE(_date)};
                    table.countRows();
                });
                // initialize filter
            };
            table.initialize();
            table.countRows();
        }
    }
};
var USERS = {
    FUNCTION: {
        stream: null,
        init: function(){
            var urlPath = "users",
                actionWidth = "0px",
                _new_ = true,
                permission = PERMISSION[PAGE.GET()] || {},
                table = new Table({
                    id: "#tbl-users",
                    urlPath,
                    goto: "users",
                    dataTableOptions: {
                        columns: TABLE.COL_ROW(CUSTOM.COLUMN.users()).column,
                        createdRow: function (row, data, dataIndex) {
                            var _row = data._row;
                            $(row).attr(`_row`, data._row);
                            table.rowListeners(_row,data._id);
                        },
                        dom: 'lB<"toolbar">frti<"tbl-progress-bar">p',
                    }
                });
            table.setButtons({
                actions:{
                    create: function(){
                        initializeModal({
                            url: `/api/users/${CLIENT.id}/${USER.username}`,
                            method: "POST",
                        });
                    },
                    refresh: function(){ table.countRows(); },
                }
            });
            table.addRow = function(obj){
                const _this = this;
                var action = TABLE.ROW_BUTTONS(PAGE.GET(),{username:obj._id});
                    (action.width != "0px") ? actionWidth = action.width : null;
                    $(`${_this.id} th:last-child`).css({"min-width":actionWidth,"width":actionWidth});
    
                return TABLE.COL_ROW(null,{
                    '_row':  obj._row,
                    'Name': obj.name || "-",
                    '_id': obj._id,
                    'Title': obj.title || "-",
                    'Email': obj.email || "-",
                    'Phone Number': obj.phoneNumber || "-",
                    'Role': (obj.role || "User").capitalize(),
                    'Exempted': (obj.exemptAutoLogout) ? "Yes" : "No",
                    'Action': action.buttons,
                }).row;
            };
            table.rowListeners = function(_row,_id){
                const _this = this;
                TABLE.ROW_LISTENER({table_id:_this.id,_row,urlPath,_id,initializeModal});
            };

            var initializeModal = function(x){
                var title = (x.method == "POST") ? "Create New User" : "Edit User";
                $(`body`).append(modalViews.user.create(title,x.obj,null,"Please note that upon creating or updating user's information here will <u>not</u> affect the user in WRU Main."));
                x.obj = x.obj || {}; // put after append
                x.obj.role = x.obj.role || "user";
                GET.INTLTELINPUT("#phoneNumber");

                if(permission.editPermission !== "all"){
                    $(`#role,#priv-title,#exemptAutoLogout`).parent().remove();
                    $(`.modal-dialog.modal-md`).removeClass("modal-md").addClass("modal-sm").css({"width":""});
                    $(`.modal-body > div`).removeClass("col-sm-5").addClass("col-sm-12");
                }
                if(!CLIENT.tabCloseAutoLogout){
                    $(`#exemptAutoLogout`).parent().remove();
                }

                var new_permission = PERMISSION_BY_ROLE[x.obj.role] || {};
                
                var populatePages = function(_obj_){
                    new_permission = {};
                    $(`#tbl-permission > tbody`).html("");
                    
                    Object.keys(_obj_).forEach(key => {
                        if(PAGE_FUNCTIONALITIES[key]){
                            var subText = "",
                                readPermission = _obj_[key].read || "None",
                                createPermission = _obj_[key].create || "None",
                                updatePermission = _obj_[key].update || "None",
                                deletePermission = _obj_[key].delete || "None";
                            new_permission[key] = _obj_[key];
                            if(_obj_[key].editPermission == "all"){
                                subText = `<small class="d-block text-muted">Allowed to Update User's Role & Privileges</small>`;
                            }
                            // if(_obj_[key].adminButton == "all"){
                            //     subText = `<small class="d-block text-muted">Allowed to Access Admin Create & Edit Buttons</small>`;
                            // }
                            $(`#tbl-permission > tbody`).append(`
                                <tr>
                                    <td class="font-normal" style="word-break: break-word;">${PAGE_FUNCTIONALITIES[key].title || "Unknown"}${subText}</td>
                                    <td>${readPermission.capitalize()}</td>
                                    <td>${createPermission.capitalize()}</td>
                                    <td>${updatePermission.capitalize()}</td>
                                    <td>${deletePermission.capitalize()}</td>
                                </tr>`);
                        }
                    });
                };

                var roleOptions = "";
                Object.keys(PERMISSION_BY_ROLE).forEach(key => {
                    var isValid = true;
                    clientCustom.ignoreRolesWithString.forEach(val => {
                        if(key.indexOf(val) > -1) isValid = false;
                    });
                    if(isValid){
                        var selected = (x.obj.role == key) ? "selected" : "";
                        roleOptions += `<option value="${key}" ${selected}>${key.capitalize()}</option>`;
                    }
                });
                $(`#role`).append(roleOptions);
                var roleSelected = $(`#role option:selected`).val() || "user";
                populatePages(PERMISSION_BY_ROLE[roleSelected]);
                $(`#priv-title`).text(`Privileges of ${roleSelected.capitalize()}`);
                $(`#role`).change(function(){
                    var role = $(this).val();
                    
                    populatePages(PERMISSION_BY_ROLE[role.toLowerCase()]);
                    $(`#priv-title`).text(`Privileges of ${role.capitalize()}`);
                });

                $(`#exemptAutoLogout`).val((x.obj.exemptAutoLogout||"false").toString());
                
                $(`#submit`).click(function(){
                    var name = $(`#name`).val()._trim(),
                        username = $(`#username`).val()._trim().toLowerCase(),
                        email = $(`#email`).val()._trim(),
                        role = ($(`#role option:selected`).val() || x.obj.role)._trim(),
                        phoneNumber = GET.INTLTELINPUT_VALUE("#phoneNumber"),
                        exemptAutoLogout = $(`#exemptAutoLogout option:selected`).val() || x.obj.exemptAutoLogout || false;
                    if(ALERT.REQUIREDFIELDS(`#modal-error`,$(this).parents("#overlay"))){}
                    else {
                        $(`#submit`).html(`<i class="la la-spinner la-spin mr-2"></i>Submit`).attr("disabled",true);
                        var body = {
                            _id: username,
                            name,
                            email,
                            phoneNumber,
                            role: role.toLowerCase(),
                            exemptAutoLogout: (exemptAutoLogout=='true'||exemptAutoLogout==true)
                        };
                        if(x.method == "PUT"){
                            delete body._id;
                        }
                        GET.AJAX({
                            url: x.url,
                            method: x.method,
                            headers: {
                                "Content-Type": "application/json; charset=utf-8",
                                "Authorization": SESSION_TOKEN
                            },
                            data: JSON.stringify(body)
                        }, function(docs){
                            if(docs.ok == 1){
                                $(`#overlay`).remove();
                                (x.method == "PUT") ? TOASTR.UPDATEDSUCCESSFULLY() : TOASTR.CREATEDSUCCESSFULLY();
                            } else {
                                console.log(docs);
                                TOASTR.ERROR(docs);
                                $(`#submit`).html(`Submit`).attr("disabled",false);
                            }
                        }, function(error){
                            console.log(error);
                            TOASTR.ERROR(error.responseJSON);
                            $(`#submit`).html(`Submit`).attr("disabled",false);
                        });
                    }
                });
            };

            /******** TABLE CHECK ********/
            TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                isFinishedLoading(["USERS"], _new_, function(){
                    _new_ = false;
                    table.initialize();
                    table.populateRows(LIST[urlPath]);
                    table.hideProgressBar();
                });
            }
            TABLE.FINISH_LOADING.START_CHECK();
            /******** END TABLE CHECK ********/
        },
    }
};
var LOCATIONS = {
    FUNCTION: {
        regions: {
            stream: null,
            init: function(){
                var urlPath = "regions",
                    _new_ = true,  
                    _userData = null,
                    table = new Table({
                        id: "#tbl-regions",
                        urlPath,
                        goto: "regions",
                        dataTableOptions: {
                            columns: TABLE.COL_ROW(CUSTOM.COLUMN.regions).column,
                            // sDom: "t" + "<'row'<'col-sm-6'i><'col-sm-6'p>>", // remove all filter container
                            createdRow: function (row, data, dataIndex) {
                                var _row = data._row;
                                $(row).attr(`_row`,_row);
                                table.rowListeners(_row,data._id);
                            },
                            dom: 'lB<"toolbar">frti<"tbl-progress-bar">p',
                        },
                        initializeCallback: function(){
                            TABLE.WATCH({urlPath,rowData:table.addRow,options:function(){TABLE.FINISH_LOADING.START_CHECK();}});
                            if(_userData){
                                TABLE.FINISH_LOADING.UPDATE();
                            }
                        }
                    });
                table.setButtons({
                    loadView: ["create"],
                    actions:{
                        create: function(){
                            initializeModal({
                                url: `/api/${urlPath}/${CLIENT.id}/${USER.username}`,
                                method: "POST"
                            });
                        },
                        refresh: function(){ table.countRows(); },
                        column: function(){
                            $(`#cv-container`).toggle("slide", {direction:'right'},100);
                        },
                    }
                });
                table.addRow = function(obj){
                    const _this = this;
                    var action = TABLE.ROW_BUTTONS(PAGE.GET(),{loadView:["edit"],readonlyArr:["edit"]});
                    $(`${table.id} th:last-child`).css({"min-width":action.width,"width":action.width});

                    var getEscalationUsers = function(escalation,type){
                        var person_in_charge = obj.person_in_charge || {};
                        person_in_charge[escalation] = person_in_charge[escalation] || {};
                        var arr = person_in_charge[escalation][type] || [];

                        var str = null;
                        if(_userData){
                            var names = [];
                            arr.forEach(val => {
                                // did not use _userData because if _users is already in LIST[urlPath], it will not load the users' name
                                var user = LIST["users"].find(x => x._id === val);
                                (user) ? names.push(user.name || val) : names.push(`<span class="text-danger" style="font-style: italic;">${val}</span>`);
                            });
                            str = names.join(", ") || `<span class="text-muted font-italic">Unassigned</span>`;
                        } else {
                            str = `<small class="font-italic text-muted">loading...</small>`;
                        }
                        return str;
                    };

                    return TABLE.COL_ROW(null,{
                        '_id': obj._id,
                        '_row':  obj._row,
                        'Region': obj.region || "-",
                        'Sequence': obj.sequence,
                        'esq1_lq': getEscalationUsers("escalation1","lq"),
                        'esq1_oc': getEscalationUsers("escalation1","oc"),
                        'esq1_ot': getEscalationUsers("escalation1","ot"),
                        'esq2_lq': getEscalationUsers("escalation2","lq"),
                        'esq2_oc': getEscalationUsers("escalation2","oc"),
                        'esq2_ot': getEscalationUsers("escalation2","ot"),
                        'esq3_lq': getEscalationUsers("escalation3","lq"),
                        'esq3_oc': getEscalationUsers("escalation3","oc"),
                        'esq3_ot': getEscalationUsers("escalation3","ot"),
                        'Action': action.buttons,
                    }).row;
                };
                table.rowListeners = function(_row,_id){
                    const _this = this;
                    
                    TABLE.ROW_LISTENER({table_id:table.id,_row,urlPath,_id,initializeModal,
                        deleteModalContent: `All of the clusters and geofences linked to this region will be deleted too. Are you sure you still want to delete this region?`,
                    });
                };
                table.filterListener = function(){
                    $(`.page-box`).append(SLIDER.COLUMN_VISIBILITY(CUSTOM.COLUMN.regions)); 
                    $('span.toggle-vis').on( 'click', function (e) {
                        var index = $(this).attr('data-column'),
                            column = table.dt.column(index);

                        column.visible( ! column.visible() );
                        CUSTOM.COLUMN.regions[index].visible = column.visible();
                        CUSTOM.COLUMN.regions[index].bVisible = column.visible();
                        $(table.id).attr("style","");

                        $(`${table.id} thead tr th`).each((i,el) => {
                            if(!$(el).is(":visible")){
                                $(`${table.id} tr:not(.child)`).each((i1,el1) => {
                                    $(el1).find("td").eq(i).hide();
                                });
                            }
                        });
                    });
                }

                var initializeModal = function(x){
                    var title = (x.method == "PUT") ? `Edit Region Data` : `Create New Region`,
                        modalElements = function(obj){
                            obj = obj || {};
                            return [
                                {title:"Region",id:"region",type:"text",required:true,value:obj.region},
                                {title:"Sequence",id:"sequence",type:"number",required:true,value:obj.sequence,sub_title:"Please enter a number. This refers to the sequence of the tabs in the Deployment Dashboard."},
                            ];
                        };
                        var column2Content = `${ALERT.HTML.INFO("This will be overridden by the Person In-Charge set in clusters and/or sites linked to this region.","m-0 mb-3",true)}
                                            <div class="panel panel-tab">
                                                <div class="panel-heading">
                                                    <h3 class="panel-title">Person In-Charge</h3>
                                                    <ul class="nav nav-tabs pull-right">
                                                        <li class="active"><a href="#esc1" data-toggle="tab" aria-expanded="false"><i class="fa fa-user"></i> Escalation 1</a></li>
                                                        <li class=""><a href="#esc2" data-toggle="tab" aria-expanded="true"><i class="fa fa-feed"></i> Escalation 2</a></li>
                                                        <li class=""><a href="#esc3" data-toggle="tab" aria-expanded="false"><i class="fa fa-gear"></i> Escalation 3</a></li>
                                                    </ul>
                                                </div>
                                                <div class="panel-body p-0">
                                                    <div class="tab-content no-padding">
                                                        <div class="tab-pane fade active in" id="esc1">
                                                            <div class="panel panel-tab" style="border: none;">
                                                                <div class="panel-heading">
                                                                    <h3 class="panel-title"></h3>
                                                                    <ul class="nav nav-tabs pull-right">
                                                                        <li class="active"><a href="#_esc1-lq_" data-toggle="tab" aria-expanded="false"><i class="fa fa-user"></i>Long Queueing</a></li>
                                                                        <li class=""><a href="#_esc1-oc_" data-toggle="tab" aria-expanded="false"><i class="fa fa-feed"></i> Over CICO</a></li>
                                                                        <li class=""><a href="#_esc1-ot_" data-toggle="tab" aria-expanded="true"><i class="fa fa-gear"></i>Over Transit</a></li>
                                                                    </ul>
                                                                </div>
                                                                <div class="panel-body">
                                                                    <div class="tab-content no-padding">
                                                                        <div class="tab-pane fade active in" id="_esc1-lq_">
                                                                            <select id="esc1-lq" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                            <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                        </div>
                                                                        <div class="tab-pane fade" id="_esc1-oc_">
                                                                        <select id="esc1-oc" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                        </div>
                                                                        <div class="tab-pane fade" id="_esc1-ot_">
                                                                            <select id="esc1-ot" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                            <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="tab-pane fade" id="esc2">
                                                            <div class="panel panel-tab" style="border: none;">
                                                                <div class="panel-heading">
                                                                    <h3 class="panel-title"></h3>
                                                                    <ul class="nav nav-tabs pull-right">
                                                                        <li class="active"><a href="#_esc2-lq_" data-toggle="tab" aria-expanded="true"><i class="fa fa-user"></i>Long Queueing</a></li>
                                                                        <li class=""><a href="#_esc2-oc_" data-toggle="tab" aria-expanded="true"><i class="fa fa-feed"></i> Over CICO</a></li>
                                                                        <li class=""><a href="#_esc2-ot_" data-toggle="tab" aria-expanded="true"><i class="fa fa-gear"></i>Over Transit</a></li>
                                                                    </ul>
                                                                </div>
                                                                <div class="panel-body">
                                                                    <div class="tab-content no-padding">
                                                                        <div class="tab-pane fade active in" id="_esc2-lq_">
                                                                            <select id="esc2-lq" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                            <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                        </div>
                                                                        <div class="tab-pane fade" id="_esc2-oc_">
                                                                            <select id="esc2-oc" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                            <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                        </div>
                                                                        <div class="tab-pane fade" id="_esc2-ot_">
                                                                            <select id="esc2-ot" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                            <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="tab-pane fade" id="esc3">
                                                            <div class="panel panel-tab" style="border: none;">
                                                                <div class="panel-heading">
                                                                    <h3 class="panel-title"></h3>
                                                                    <ul class="nav nav-tabs pull-right">
                                                                        <li class="active"><a href="#_esc3-lq_" data-toggle="tab" aria-expanded="true"><i class="fa fa-user"></i>Long Queueing</a></li>
                                                                        <li class=""><a href="#_esc3-oc_" data-toggle="tab" aria-expanded="true"><i class="fa fa-feed"></i> Over CICO</a></li>
                                                                        <li class=""><a href="#_esc3-ot_" data-toggle="tab" aria-expanded="true"><i class="fa fa-gear"></i>Over Transit</a></li>
                                                                    </ul>
                                                                </div>
                                                                <div class="panel-body">
                                                                    <div class="tab-content no-padding">
                                                                        <div class="tab-pane fade active in" id="_esc3-lq_">
                                                                            <select id="esc3-lq" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                            <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                        </div>
                                                                        <div class="tab-pane fade" id="_esc3-oc_">
                                                                            <select id="esc3-oc" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                            <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                        </div>
                                                                        <div class="tab-pane fade" id="_esc3-ot_">
                                                                            <select id="esc3-ot" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                            <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>`;

                        $(`body`).append(MODAL.CREATE.BASIC({
                            modalStyle: "width:900px;",
                            title,
                            el: modalElements(x.obj),
                            columned:true,
                            column1Style: "col-sm-5",
                            column2Style: "col-sm-7",
                            column2Content,
                        }));

                        var obj = x.obj || {};
                        var person_in_charge = obj.person_in_charge || {};
                        var options = "";
                        _userData.forEach(op => {
                            options += `<option value="${op.id}">${op.value || op.id}</option>`;
                        });
                        $(`#esc1-lq,#esc2-lq,#esc3-lq,#esc1-oc,#esc2-oc,#esc3-oc,#esc1-ot,#esc2-ot,#esc3-ot`).html(options).select2({
                            multiple: true,
                            tokenSeparators: [',', ', '],
                            matcher: function(query, data) {
                                var term = query.term;
                                var text = data.text;
                                var id = data.id;
                                if(text.toUpperCase().indexOf(term.toUpperCase()) > -1 || id.toUpperCase().indexOf(term.toUpperCase()) > -1){
                                    return data;
                                } else {
                                    return null;
                                }
                            }
                        });
                        function populateSelect2(escalation,short,type){
                            if(person_in_charge[escalation]){
                                if(person_in_charge[escalation][type]){
                                    var value = person_in_charge[escalation][type] || [];
                                    var options = "";
                                    _userData.forEach(op => {
                                        var selected = (value.includes(op.id)) ? "selected" : "";
                                        options += `<option value="${op.id}" ${selected}>${op.value || op.id}</option>`;
                                    });
                                    $(`#${short}-${type}`).html(options).select2({
                                        multiple: true,
                                        tokenSeparators: [',', ', '],
                                        matcher: function(query, data) {
                                            var term = query.term;
                                            var text = data.text;
                                            var id = data.id;
                                            if(text.toUpperCase().indexOf(term.toUpperCase()) > -1 || id.toUpperCase().indexOf(term.toUpperCase()) > -1){
                                                return data;
                                            } else {
                                                return null;
                                            }
                                        }
                                    });
                                }
                            }
                        }
                        populateSelect2("escalation1","esc1","lq");
                        populateSelect2("escalation1","esc1","oc");
                        populateSelect2("escalation1","esc1","ot");
                        populateSelect2("escalation2","esc2","lq");
                        populateSelect2("escalation2","esc2","oc");
                        populateSelect2("escalation2","esc2","ot");
                        populateSelect2("escalation3","esc3","lq");
                        populateSelect2("escalation3","esc3","oc");
                        populateSelect2("escalation3","esc3","ot");

                        MODAL.SUBMIT(x,null, function(){
                            var pic = {
                                escalation1: {
                                    lq: $(`#esc1-lq`).val() || [],
                                    oc: $(`#esc1-oc`).val() || [],
                                    ot: $(`#esc1-ot`).val() || [],
                                },
                                escalation2: {
                                    lq: $(`#esc2-lq`).val() || [],
                                    oc: $(`#esc2-oc`).val() || [],
                                    ot: $(`#esc2-ot`).val() || [],
                                },
                                escalation3: {
                                    lq: $(`#esc3-lq`).val() || [],
                                    oc: $(`#esc3-oc`).val() || [],
                                    ot: $(`#esc3-ot`).val() || [],
                                },
                            };
                            return {
                                person_in_charge: pic
                            };
                        });
                        
                    // $(`#person_in_charge`).select2({
                    //     tokenSeparators: [',', ', '],
                    //     matcher: function(query, data) {
                    //         var term = query.term;
                    //         var text = data.text;
                    //         var id = data.id;
                    //         if(text.toUpperCase().indexOf(term.toUpperCase()) > -1 || id.toUpperCase().indexOf(term.toUpperCase()) > -1){
                    //             return data;
                    //         } else {
                    //             return null;
                    //         }
                    //     }
                    // });
                };

                /******** TABLE CHECK ********/
                // always put before POPULATE functions
                LIST[urlPath] = LIST[urlPath] || [];
                TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                    isFinishedLoading(["REGIONS"], _new_, function(){
                        _new_ = false;
                        table.initialize();
                        table.populateRows(LIST[urlPath]);
                        table.hideProgressBar();
                    });
                    if(_userData) {
                        if(LIST[urlPath].length > 0 && !LIST[urlPath][0]._users && table.dt){
                            table.updateRows(LIST[urlPath]);
                        }
                        TABLE.FINISH_LOADING.UPDATE();
                    }
                }
                /******** END TABLE CHECK ********/
                
                /******** USERS ********/
                var _USERS_ = {
                    urlPath: "users",
                    populate: function(){
                        var _THIS_ = this;
                        _userData = [];
                        LIST[_THIS_.urlPath].forEach(val => {
                            _userData.push({
                                id: val._id,
                                value: val.name
                            });
                        });
                        _userData = SORT.ARRAY_OBJECT(_userData,"value",{sortType:"asc"});
                        TABLE.FINISH_LOADING.START_CHECK();
                    },
                    fetch: function(){
                        var _THIS_ = this;
                        if(LIST[_THIS_.urlPath]){
                            _USERS_.populate();
                        } else {
                            GET.AJAX({
                                url: `/api/${_THIS_.urlPath}/${CLIENT.id}/${USER.username}/all/${JSON.stringify({})}/0/0`,
                                method: "GET",
                                headers: {
                                    "Authorization": SESSION_TOKEN
                                },
                            }, function(docs){
                                console.log("Users",docs);
                                LIST[_THIS_.urlPath] = LIST[_THIS_.urlPath] || [];
                                docs.forEach(val => {
                                    var index = LIST[_THIS_.urlPath].findIndex(x => x._id == val._id);
                                    if(index > -1){
                                        LIST[_THIS_.urlPath][index] = val;
                                    } else {
                                        val._row = GENERATE.RANDOM(36);
                                        LIST[_THIS_.urlPath].push(val);
                                    }
                                });
                                _USERS_.populate();
                            });
                        }
                    }
                };
                _USERS_.fetch();
                /******** END USERS ********/

                TABLE.FINISH_LOADING.START_CHECK();
            }
        },
        clusters: {
            stream: null,
            init: function(){
                var urlPath = "clusters",
                    _new_ = false,
                    _userData = null,
                    _USERS_,
                    table = new Table({
                        id: "#tbl-clusters",
                        urlPath,
                        goto: "clusters",
                        dataTableOptions: {
                            columns: TABLE.COL_ROW(CUSTOM.COLUMN.clusters).column,
                            // sDom: "t" + "<'row'<'col-sm-6'i><'col-sm-6'p>>", // remove all filter container
                            createdRow: function (row, data, dataIndex) {
                                var _row = data._row;
                                $(row).attr(`_row`, data._row);
                                table.rowListeners(_row,data._id);
                                
                            },
                            dom: 'lB<"toolbar">frti<"tbl-progress-bar">p',
                        },
                        initializeCallback: function(){
                            TABLE.WATCH({urlPath,rowData:table.addRow,options:function(){TABLE.FINISH_LOADING.START_CHECK();}});
                            if(_userData && GGS.STATUS.REGIONS){
                                TABLE.FINISH_LOADING.UPDATE();
                            }
                        }
                    });
                table.setButtons({
                    loadView: ["create"],
                    actions:{
                        create: function(){
                            initializeModal({
                                url: `/api/${urlPath}/${CLIENT.id}/${USER.username}`,
                                method: "POST"
                            });
                        },
                        refresh: function(){ table.countRows(); },
                        search: function(){ $(`.row-filter`).toggle(); },
                        column: function(){
                            $(`#cv-container`).toggle("slide", {direction:'right'},100);
                        },
                    }
                });
                table.addRow = function(obj){
                    new loadInBackground("regions","REGIONS").g_select_settings();

                    const _this = this;
                    var action = TABLE.ROW_BUTTONS(PAGE.GET(),{loadView:["edit"],readonlyArr:["edit"]});
                    $(`${_this.id} th:last-child`).css({"min-width":action.width,"width":action.width});

                    var region;
                    if(G_SELECT["regions"]){
                        region = G_SELECT["regions"].find(x => x.id == obj.region_id) || {};
                        obj._region = region.value;
                    } else {
                        region = {value:`<small class="font-italic text-muted">loading...</small>`};
                    }
                    var totalGeofences;
                    if(GGS.STATUS.GEOFENCES){
                        totalGeofences = LIST["geofences"].filter(x=> x.cluster_id == obj._id).length;
                        obj.totalGeofences = totalGeofences;
                    } else {
                        totalGeofences = `<small class="font-italic text-muted">loading...</small>`;
                    }

                    var getEscalationUsers = function(escalation,type){
                        var person_in_charge = obj.person_in_charge || {};
                        person_in_charge[escalation] = person_in_charge[escalation] || {};
                        var arr = person_in_charge[escalation][type] || [];

                        var str = null;
                        if(_userData){
                            var names = [];
                            arr.forEach(val => {
                                // did not use _userData because if _users is already in LIST[urlPath], it will not load the users' name
                                var user = LIST["users"].find(x => x._id === val);
                                (user) ? names.push(user.name || val) : names.push(`<span class="text-danger" style="font-style: italic;">${val}</span>`);
                            });
                            str = names.join(", ") || `<span class="text-muted font-italic">Unassigned</span>`;
                        } else {
                            str = `<small class="font-italic text-muted">loading...</small>`;
                        }
                        return str;
                    };
        
                    return TABLE.COL_ROW(null,{
                        '_id': obj._id,
                        '_row':  obj._row,
                        'Cluster': obj.cluster || "-",
                        'Region': region.value || "-",
                        'Geofences': totalGeofences,
                        'esq1_lq': getEscalationUsers("escalation1","lq"),
                        'esq1_oc': getEscalationUsers("escalation1","oc"),
                        'esq1_ot': getEscalationUsers("escalation1","ot"),
                        'esq2_lq': getEscalationUsers("escalation2","lq"),
                        'esq2_oc': getEscalationUsers("escalation2","oc"),
                        'esq2_ot': getEscalationUsers("escalation2","ot"),
                        'esq3_lq': getEscalationUsers("escalation3","lq"),
                        'esq3_oc': getEscalationUsers("escalation3","oc"),
                        'esq3_ot': getEscalationUsers("escalation3","ot"),
                        'Action': action.buttons,
                    }).row;
                };
                table.rowListeners = function(_row,_id){
                    const _this = this;
                    TABLE.ROW_LISTENER({table_id:_this.id,_row,urlPath,_id,initializeModal,
                        deleteModalContent: `All of the geofences linked to this cluster will be deleted too. Are you sure you still want to delete this cluster?`,
                    });
                };
                table.filterListener = function(){
                    $(`.page-box`).append(SLIDER.COLUMN_VISIBILITY(CUSTOM.COLUMN.clusters)); 
                    $('span.toggle-vis').on( 'click', function (e) {
                        var index = $(this).attr('data-column'),
                            column = table.dt.column(index);

                        column.visible( ! column.visible() );
                        CUSTOM.COLUMN.clusters[index].visible = column.visible();
                        CUSTOM.COLUMN.clusters[index].bVisible = column.visible();
                        $(table.id).attr("style","");

                        $(`${table.id} thead tr th`).each((i,el) => {
                            if(!$(el).is(":visible")){
                                $(`${table.id} tr:not(.child)`).each((i1,el1) => {
                                    $(el1).find("td").eq(i).hide();
                                });
                            }
                        });
                    });
                }

                var initializeModal = function(x){
                    new loadInBackground("regions","REGIONS").g_select_settings();

                    var title = (x.method == "PUT") ? `Edit Cluster Data` : `Create New Cluster`,
                        modalElements = function(obj){
                            obj = obj || {};
                            return [
                                {title:"Cluster",id:"cluster",type:"text",required:true,value:obj.cluster},
                                {title:"Region",id:"region_id",type:"select",required:true,value:obj.region_id,options:G_SELECT["regions"]},
                            ];
                        };
                    var column2Content = `${ALERT.HTML.INFO("This will override the Person In-Charge set in cluster's region but will be overridden by the Person In-Charge set per Site, if any.","m-0 mb-3",true)}
                                        <div class="panel panel-tab">
                                            <div class="panel-heading">
                                                <h3 class="panel-title">Person In-Charge</h3>
                                                <ul class="nav nav-tabs pull-right">
                                                    <li class="active"><a href="#esc1" data-toggle="tab" aria-expanded="false"><i class="fa fa-user"></i> Escalation 1</a></li>
                                                    <li class=""><a href="#esc2" data-toggle="tab" aria-expanded="true"><i class="fa fa-feed"></i> Escalation 2</a></li>
                                                    <li class=""><a href="#esc3" data-toggle="tab" aria-expanded="false"><i class="fa fa-gear"></i> Escalation 3</a></li>
                                                </ul>
                                            </div>
                                            <div class="panel-body p-0">
                                                <div class="tab-content no-padding">
                                                    <div class="tab-pane fade active in" id="esc1">
                                                        <div class="panel panel-tab" style="border: none;">
                                                            <div class="panel-heading">
                                                                <h3 class="panel-title"></h3>
                                                                <ul class="nav nav-tabs pull-right">
                                                                    <li class="active"><a href="#_esc1-lq_" data-toggle="tab" aria-expanded="false"><i class="fa fa-user"></i>Long Queueing</a></li>
                                                                    <li class=""><a href="#_esc1-oc_" data-toggle="tab" aria-expanded="false"><i class="fa fa-feed"></i> Over CICO</a></li>
                                                                    <li class=""><a href="#_esc1-ot_" data-toggle="tab" aria-expanded="true"><i class="fa fa-gear"></i>Over Transit</a></li>
                                                                </ul>
                                                            </div>
                                                            <div class="panel-body">
                                                                <div class="tab-content no-padding">
                                                                    <div class="tab-pane fade active in" id="_esc1-lq_">
                                                                        <select id="esc1-lq" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="_esc1-oc_">
                                                                    <select id="esc1-oc" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                    <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="_esc1-ot_">
                                                                        <select id="esc1-ot" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="tab-pane fade" id="esc2">
                                                        <div class="panel panel-tab" style="border: none;">
                                                            <div class="panel-heading">
                                                                <h3 class="panel-title"></h3>
                                                                <ul class="nav nav-tabs pull-right">
                                                                    <li class="active"><a href="#_esc2-lq_" data-toggle="tab" aria-expanded="true"><i class="fa fa-user"></i>Long Queueing</a></li>
                                                                    <li class=""><a href="#_esc2-oc_" data-toggle="tab" aria-expanded="true"><i class="fa fa-feed"></i> Over CICO</a></li>
                                                                    <li class=""><a href="#_esc2-ot_" data-toggle="tab" aria-expanded="true"><i class="fa fa-gear"></i>Over Transit</a></li>
                                                                </ul>
                                                            </div>
                                                            <div class="panel-body">
                                                                <div class="tab-content no-padding">
                                                                    <div class="tab-pane fade active in" id="_esc2-lq_">
                                                                        <select id="esc2-lq" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="_esc2-oc_">
                                                                        <select id="esc2-oc" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="_esc2-ot_">
                                                                        <select id="esc2-ot" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="tab-pane fade" id="esc3">
                                                        <div class="panel panel-tab" style="border: none;">
                                                            <div class="panel-heading">
                                                                <h3 class="panel-title"></h3>
                                                                <ul class="nav nav-tabs pull-right">
                                                                    <li class="active"><a href="#_esc3-lq_" data-toggle="tab" aria-expanded="true"><i class="fa fa-user"></i>Long Queueing</a></li>
                                                                    <li class=""><a href="#_esc3-oc_" data-toggle="tab" aria-expanded="true"><i class="fa fa-feed"></i> Over CICO</a></li>
                                                                    <li class=""><a href="#_esc3-ot_" data-toggle="tab" aria-expanded="true"><i class="fa fa-gear"></i>Over Transit</a></li>
                                                                </ul>
                                                            </div>
                                                            <div class="panel-body">
                                                                <div class="tab-content no-padding">
                                                                    <div class="tab-pane fade active in" id="_esc3-lq_">
                                                                        <select id="esc3-lq" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="_esc3-oc_">
                                                                        <select id="esc3-oc" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="_esc3-ot_">
                                                                        <select id="esc3-ot" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`;

                    $(`body`).append(MODAL.CREATE.BASIC({
                        modalStyle: "width:900px;",
                        title,
                        el: modalElements(x.obj),
                        columned:true,
                        column1Style: "col-sm-5",
                        column2Style: "col-sm-7",
                        column2Content,
                    }));

                    var obj = x.obj || {};
                    var person_in_charge = obj.person_in_charge || {};
                    var options = "";
                    _userData.forEach(op => {
                        options += `<option value="${op.id}">${op.value || op.id}</option>`;
                    });
                    $(`#esc1-lq,#esc2-lq,#esc3-lq,#esc1-oc,#esc2-oc,#esc3-oc,#esc1-ot,#esc2-ot,#esc3-ot`).html(options).select2({
                        multiple: true,
                        tokenSeparators: [',', ', '],
                        matcher: function(query, data) {
                            var term = query.term;
                            var text = data.text;
                            var id = data.id;
                            if(text.toUpperCase().indexOf(term.toUpperCase()) > -1 || id.toUpperCase().indexOf(term.toUpperCase()) > -1){
                                return data;
                            } else {
                                return null;
                            }
                        }
                    });
                    function populateSelect2(escalation,short,type){
                        if(person_in_charge[escalation]){
                            if(person_in_charge[escalation][type]){
                                var value = person_in_charge[escalation][type] || [];
                                var options = "";
                                _userData.forEach(op => {
                                    var selected = (value.includes(op.id)) ? "selected" : "";
                                    options += `<option value="${op.id}" ${selected}>${op.value || op.id}</option>`;
                                });
                                $(`#${short}-${type}`).html(options).select2({
                                    multiple: true,
                                    tokenSeparators: [',', ', '],
                                    matcher: function(query, data) {
                                        var term = query.term;
                                        var text = data.text;
                                        var id = data.id;
                                        if(text.toUpperCase().indexOf(term.toUpperCase()) > -1 || id.toUpperCase().indexOf(term.toUpperCase()) > -1){
                                            return data;
                                        } else {
                                            return null;
                                        }
                                    }
                                });
                            }
                        }
                    }
                    populateSelect2("escalation1","esc1","lq");
                    populateSelect2("escalation1","esc1","oc");
                    populateSelect2("escalation1","esc1","ot");
                    populateSelect2("escalation2","esc2","lq");
                    populateSelect2("escalation2","esc2","oc");
                    populateSelect2("escalation2","esc2","ot");
                    populateSelect2("escalation3","esc3","lq");
                    populateSelect2("escalation3","esc3","oc");
                    populateSelect2("escalation3","esc3","ot");

                    MODAL.SUBMIT(x,null, function(){
                        var pic = {
                            escalation1: {
                                lq: $(`#esc1-lq`).val() || [],
                                oc: $(`#esc1-oc`).val() || [],
                                ot: $(`#esc1-ot`).val() || [],
                            },
                            escalation2: {
                                lq: $(`#esc2-lq`).val() || [],
                                oc: $(`#esc2-oc`).val() || [],
                                ot: $(`#esc2-ot`).val() || [],
                            },
                            escalation3: {
                                lq: $(`#esc3-lq`).val() || [],
                                oc: $(`#esc3-oc`).val() || [],
                                ot: $(`#esc3-ot`).val() || [],
                            },
                        };
                        return {
                            person_in_charge: pic
                        };
                    });
                };

                /******** TABLE CHECK ********/
                // always put before POPULATE functions
                LIST[urlPath] = LIST[urlPath] || [];
                TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                    if(_userData) {
                        if(LIST[urlPath].length > 0 && !LIST[urlPath][0]._users && table.dt){
                            table.updateRows(LIST[urlPath]);
                        }
                    }
                    if(GGS.STATUS.GEOFENCES){
                        if(LIST[urlPath].length > 0 && LIST[urlPath][0].totalGeofences == null && table.dt){
                            table.updateRows(LIST[urlPath]);
                        }
                    }
                    if(GGS.STATUS.REGIONS) {
                        if(LIST[urlPath].length > 0 && !LIST[urlPath][0]._region){
                            table.updateRows(LIST[urlPath]);
                        }
                    }
                    if(GGS.STATUS.CLUSTERS) { 
                        if(!_new_) {
                            _new_ = true;
                            
                            table.initialize();
                            table.populateRows(LIST[urlPath]);
                            table.hideProgressBar();
                        }
                    }
                    if(_userData && GGS.STATUS.REGIONS){
                        TABLE.FINISH_LOADING.UPDATE();
                    }
                }
                /******** END TABLE CHECK ********/
                
                /******** USERS & REGIONS********/
                _USERS_ = {
                    urlPath: "users",
                    populate: function(){
                        var _THIS_ = this;
                        _userData = [];
                        LIST[_THIS_.urlPath].forEach(val => {
                            _userData.push({
                                id: val._id,
                                value: val.name
                            });
                        });
                        _userData = SORT.ARRAY_OBJECT(_userData,"value",{sortType:"asc"});
                        TABLE.FINISH_LOADING.START_CHECK();
                    },
                    fetch: function(){
                        var _THIS_ = this;
                        if(LIST[_THIS_.urlPath]){
                            _USERS_.populate();
                        } else {
                            GET.AJAX({
                                url: `/api/${_THIS_.urlPath}/${CLIENT.id}/${USER.username}/all/${JSON.stringify({})}/0/0`,
                                method: "GET",
                                headers: {
                                    "Authorization": SESSION_TOKEN
                                },
                            }, function(docs){
                                console.log("Users",docs);
                                LIST[_THIS_.urlPath] = LIST[_THIS_.urlPath] || [];
                                docs.forEach(val => {
                                    var index = LIST[_THIS_.urlPath].findIndex(x => x._id == val._id);
                                    if(index > -1){
                                        LIST[_THIS_.urlPath][index] = val;
                                    } else {
                                        val._row = GENERATE.RANDOM(36);
                                        LIST[_THIS_.urlPath].push(val);
                                    }
                                });
                                _USERS_.populate();
                            });
                        }
                    }
                };
                _USERS_.fetch();
                /******** END USERS & REGIONS ********/

                TABLE.FINISH_LOADING.START_CHECK();
            }
        },
        geofences: {
            stream: null,
            init: function(){
                var urlPath = "geofences",
                    _new_ = false,  
                    _userData = null,
                    _USERS_,
                    table = new Table({
                        id: "#tbl-geofences",
                        urlPath,
                        goto: "geofences",
                        dataTableOptions: {
                            columns: TABLE.COL_ROW(CUSTOM.COLUMN.geofences).column,
                            order: [[ 0, "desc" ]],
                            createdRow: function (row, data, dataIndex) {
                                var _row = data._row;
                                $(row).attr(`_row`, data._row);
                                table.rowListeners(_row,data._id);
                            },
                            dom: 'lB<"toolbar">frti<"tbl-progress-bar">p',
                        },
                        initializeCallback: function(){
                            $(`.row-filter`).hide();
                            PAGE.TOOLTIP();
                            TABLE.WATCH({urlPath,rowData:table.addRow,options:function(){TABLE.FINISH_LOADING.START_CHECK();}});
                            if(_userData && GGS.STATUS.REGIONS && GGS.STATUS.CLUSTERS){
                                TABLE.FINISH_LOADING.UPDATE();
                            }
                        }
                    });
                table.filter = {};
                table.setButtons({
                    loadView: ["create"],
                    actions:{
                        refresh: function(){ table.countRows(); },
                        column: function(){
                            $(`#cv-container`).toggle("slide", {direction:'right'},100);
                        },
                    }
                });
                table.addRow = function(obj){
                    const _this = this;
                    var action = TABLE.ROW_BUTTONS(PAGE.GET(),{loadView:["edit"],readonlyArr:["edit"]}),
                        getGGSRowValue = function(arr,_v_,_o_){
                            var str;
                            if(arr){
                                str = arr.find(x => x.id == obj[_v_]) || {};
                                obj[_o_] = str.value;
                            } else {
                                str = {value:`<small class="font-italic text-muted">loading...</small>`};
                            }
                            return str;
                        },
                        getUsersValue = function(_v_,_o_){
                            var str = null;
                            if(_userData){
                                obj[_v_] = obj[_v_] || [];
                                var names = [];
                                obj[_v_].forEach(val => {
                                    // did not use _userData because if _users is already in LIST[urlPath], it will not load the users' name
                                    var user = LIST["users"].find(x => x._id === val);
                                    (user) ? names.push(user.name || val) : names.push(`<span class="text-danger" style="font-style: italic;">${val}</span>`);
                                });
                                obj[_o_] = names.join(", ") || `<span class="text-muted font-italic">Unassigned</span>`;
        
                                // added additional variable because obj[_o_] is needed for checking in GGS
                                str = obj[_o_];
                            } else {
                                str = `<small class="font-italic text-muted">loading...</small>`;
                            }
                            return str;
                        },
                        getEscalationUsers = function(escalation,type){
                            var person_in_charge = obj.person_in_charge || {};
                            person_in_charge[escalation] = person_in_charge[escalation] || {};
                            var arr = person_in_charge[escalation][type] || [];

                            var str = null;
                            if(_userData){
                                var names = [];
                                arr.forEach(val => {
                                    // did not use _userData because if _users is already in LIST[urlPath], it will not load the users' name
                                    var user = LIST["users"].find(x => x._id === val);
                                    (user) ? names.push(user.name || val) : names.push(`<span class="text-danger" style="font-style: italic;">${val}</span>`);
                                });
                                str = names.join(", ") || `<span class="text-muted font-italic">Unassigned</span>`;
                            } else {
                                str = `<small class="font-italic text-muted">loading...</small>`;
                            }
                            return str;
                        },
                        region = getGGSRowValue(G_SELECT["regions"],"region_id","_region"),
                        cluster = getGGSRowValue(G_SELECT["clusters"],"cluster_id","_cluster"),
                        dUsers = getUsersValue("dispatcher","_dUsers");
        
                    $(`${table.id} th:last-child`).css({"min-width":action.width,"width":action.width});
        
                    return TABLE.COL_ROW(null,{
                        '_id': obj._id,
                        '_row':  obj._row,
                        'Site Code': obj.code || "-",
                        'Site Name': obj.site_name || "-",
                        'Short Name': obj.short_name || "-",
                        'CICO': DATETIME.HH_MM(null,obj.cico).hour_minute,
                        'Cluster': cluster.value || "-",
                        'Region': region.value || "-",
                        'Dispatcher': dUsers,
                        'esq1_lq': getEscalationUsers("escalation1","lq"),
                        'esq1_oc': getEscalationUsers("escalation1","oc"),
                        'esq1_ot': getEscalationUsers("escalation1","ot"),
                        'esq2_lq': getEscalationUsers("escalation2","lq"),
                        'esq2_oc': getEscalationUsers("escalation2","oc"),
                        'esq2_ot': getEscalationUsers("escalation2","ot"),
                        'esq3_lq': getEscalationUsers("escalation3","lq"),
                        'esq3_oc': getEscalationUsers("escalation3","oc"),
                        'esq3_ot': getEscalationUsers("escalation3","ot"),
                        'Action': action.buttons,
                    }).row;
                };
                table.rowListeners = function(_row,_id){
                    const _this = this;
                    TABLE.ROW_LISTENER({table_id:_this.id,_row,urlPath,_id,initializeModal});
                };
                table.filterListener = function(){
                    $(`.page-box`).append(SLIDER.COLUMN_VISIBILITY(CUSTOM.COLUMN.geofences)); 
                    $('span.toggle-vis').on( 'click', function (e) {
                        var index = $(this).attr('data-column'),
                            column = table.dt.column(index);

                        column.visible( ! column.visible() );
                        CUSTOM.COLUMN.geofences[index].visible = column.visible();
                        CUSTOM.COLUMN.geofences[index].bVisible = column.visible();
                        $(table.id).attr("style","");

                        $(`${table.id} thead tr th`).each((i,el) => {
                            if(!$(el).is(":visible")){
                                $(`${table.id} tr:not(.child)`).each((i1,el1) => {
                                    $(el1).find("td").eq(i).hide();
                                });
                            }
                        });
                    });
                }
        
                var initializeModal = function(x){
                    new loadInBackground("regions","REGIONS").g_select_settings();
                    new loadInBackground("clusters","CLUSTERS").g_select_settings();

                    var modalElements = function(obj){
                        obj = obj || {};
                        var readonly = (obj.code) ? true : false;
                        return [
                            {title:"Site Name",id:"site_name",type:"text",required:true,value:obj.site_name},
                            {title:"Short Name",id:"short_name",type:"text",required:true,value:obj.short_name},
                            {title:"Site Code",id:"code",type:"text",required:true,value:obj.code, readonly, sub_title:"You <u>cannot</u> change the site code once saved."},
                            {title:"CICO (HH:MM)",id:"cico",type:"time",required:true,value:obj.cico},
                            {title:"Cluster",id:"cluster_id",type:"select",value:obj.cluster_id,options:G_SELECT["clusters"]},
                            {title:"Region",id:"region_id",type:"select",required:true,value:obj.region_id,options:G_SELECT["regions"]},
                            {title:"Dispatcher",id:"dispatcher",type:"select2",multiple:true,value:obj.dispatcher,options:_userData},
                        ];
                    };

                    var column2Content = `${ALERT.HTML.INFO("This will override the Person In-Charge set in site's region and cluster.","m-0 mb-3",true)}
                                        <div class="panel panel-tab">
                                            <div class="panel-heading">
                                                <h3 class="panel-title">Person In-Charge</h3>
                                                <ul class="nav nav-tabs pull-right">
                                                    <li class="active"><a href="#esc1" data-toggle="tab" aria-expanded="false"><i class="fa fa-user"></i> Escalation 1</a></li>
                                                    <li class=""><a href="#esc2" data-toggle="tab" aria-expanded="true"><i class="fa fa-feed"></i> Escalation 2</a></li>
                                                    <li class=""><a href="#esc3" data-toggle="tab" aria-expanded="false"><i class="fa fa-gear"></i> Escalation 3</a></li>
                                                </ul>
                                            </div>
                                            <div class="panel-body p-0">
                                                <div class="tab-content no-padding">
                                                    <div class="tab-pane fade active in" id="esc1">
                                                        <div class="panel panel-tab" style="border: none;">
                                                            <div class="panel-heading">
                                                                <h3 class="panel-title"></h3>
                                                                <ul class="nav nav-tabs pull-right">
                                                                    <li class="active"><a href="#_esc1-lq_" data-toggle="tab" aria-expanded="false"><i class="fa fa-user"></i>Long Queueing</a></li>
                                                                    <li class=""><a href="#_esc1-oc_" data-toggle="tab" aria-expanded="false"><i class="fa fa-feed"></i> Over CICO</a></li>
                                                                    <li class=""><a href="#_esc1-ot_" data-toggle="tab" aria-expanded="true"><i class="fa fa-gear"></i>Over Transit</a></li>
                                                                </ul>
                                                            </div>
                                                            <div class="panel-body">
                                                                <div class="tab-content no-padding">
                                                                    <div class="tab-pane fade active in" id="_esc1-lq_">
                                                                        <select id="esc1-lq" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="_esc1-oc_">
                                                                    <select id="esc1-oc" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                    <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="_esc1-ot_">
                                                                        <select id="esc1-ot" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="tab-pane fade" id="esc2">
                                                        <div class="panel panel-tab" style="border: none;">
                                                            <div class="panel-heading">
                                                                <h3 class="panel-title"></h3>
                                                                <ul class="nav nav-tabs pull-right">
                                                                    <li class="active"><a href="#_esc2-lq_" data-toggle="tab" aria-expanded="true"><i class="fa fa-user"></i>Long Queueing</a></li>
                                                                    <li class=""><a href="#_esc2-oc_" data-toggle="tab" aria-expanded="true"><i class="fa fa-feed"></i> Over CICO</a></li>
                                                                    <li class=""><a href="#_esc2-ot_" data-toggle="tab" aria-expanded="true"><i class="fa fa-gear"></i>Over Transit</a></li>
                                                                </ul>
                                                            </div>
                                                            <div class="panel-body">
                                                                <div class="tab-content no-padding">
                                                                    <div class="tab-pane fade active in" id="_esc2-lq_">
                                                                        <select id="esc2-lq" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="_esc2-oc_">
                                                                        <select id="esc2-oc" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="_esc2-ot_">
                                                                        <select id="esc2-ot" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="tab-pane fade" id="esc3">
                                                        <div class="panel panel-tab" style="border: none;">
                                                            <div class="panel-heading">
                                                                <h3 class="panel-title"></h3>
                                                                <ul class="nav nav-tabs pull-right">
                                                                    <li class="active"><a href="#_esc3-lq_" data-toggle="tab" aria-expanded="true"><i class="fa fa-user"></i>Long Queueing</a></li>
                                                                    <li class=""><a href="#_esc3-oc_" data-toggle="tab" aria-expanded="true"><i class="fa fa-feed"></i> Over CICO</a></li>
                                                                    <li class=""><a href="#_esc3-ot_" data-toggle="tab" aria-expanded="true"><i class="fa fa-gear"></i>Over Transit</a></li>
                                                                </ul>
                                                            </div>
                                                            <div class="panel-body">
                                                                <div class="tab-content no-padding">
                                                                    <div class="tab-pane fade active in" id="_esc3-lq_">
                                                                        <select id="esc3-lq" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="_esc3-oc_">
                                                                        <select id="esc3-oc" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="_esc3-ot_">
                                                                        <select id="esc3-ot" class="select-multiple-basic" multiple="multiple" style="width:100%;" doNotSave="true"></select>
                                                                        <small class="text-muted">Search by name or username.<br>Press enter key or comma (,) to add value to list.</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`;

                    $(`body`).append(MODAL.CREATE.BASIC({
                        modalStyle: "width:900px;",
                        title:`Edit Site Data`, 
                        el: modalElements(x.obj),
                        columned:true,
                        column1Style: "col-sm-5",
                        column2Style: "col-sm-7",
                        column2Content,
                    }));

                    var obj = x.obj || {};
                    var person_in_charge = obj.person_in_charge || {};
                    var options = "";
                    _userData.forEach(op => {
                        options += `<option value="${op.id}" data-subtext="Username: ${op.id}<br>Email: ${op.email||"-"}" data-token-separators="[',']">${op.value || op.id}</option>`;
                    });
                    // clear all
                    //  $(`#esc1-lq,#esc2-lq,#esc3-lq,#esc1-oc,#esc2-oc,#esc3-oc,#esc1-ot,#esc2-ot,#esc3-ot`).val([]).change();
                    $(`#esc1-lq,#esc2-lq,#esc3-lq,#esc1-oc,#esc2-oc,#esc3-oc,#esc1-ot,#esc2-ot,#esc3-ot`).html(options).select2({
                        multiple: true,
                        tokenSeparators: [',', ', '],
                        matcher,
                        templateResult: formatCustom
                    });
                    function populateSelect2(escalation,short,type){
                        if(person_in_charge[escalation]){
                            if(person_in_charge[escalation][type]){
                                var value = person_in_charge[escalation][type] || [];
                                var options = "";
                                _userData.forEach(op => {
                                    var selected = (value.includes(op.id)) ? "selected" : "";
                                    options += `<option value="${op.id}" data-subtext="Username: ${op.id}<br>Email: ${op.email||"-"}" ${selected}>${op.value || op.id}</option>`;
                                });
                                $(`#${short}-${type}`).html(options).select2({
                                    multiple: true,
                                    tokenSeparators: [',', ', '],
                                    matcher,
                                    templateResult: formatCustom
                                });
                            }
                        }
                    }
                    populateSelect2("escalation1","esc1","lq");
                    populateSelect2("escalation1","esc1","oc");
                    populateSelect2("escalation1","esc1","ot");
                    populateSelect2("escalation2","esc2","lq");
                    populateSelect2("escalation2","esc2","oc");
                    populateSelect2("escalation2","esc2","ot");
                    populateSelect2("escalation3","esc3","lq");
                    populateSelect2("escalation3","esc3","oc");
                    populateSelect2("escalation3","esc3","ot");
                    
                    $(`#dispatcher`).select2();
                    $(`#cico-hh,#cico-mm`).change(function(){
                        var hh = $(`#cico-hh`).val() || 0,
                            mm = $(`#cico-mm`).val() || 0,
                            dh = Number(DATETIME.DH(null,`${hh}:${mm}`,"0"));
                        $(`#cico`).val(dh);
                    });
                    $(`#region_id`).change(function(){
                        $(`#cluster_id option`).hide();
                        var clusterFiltered = G_SELECT["clusters"].filter(x => x.region_id.toString() == $(this).val()),
                            cluster_id =  $(`#cluster_id`).val(),
                            boolCluster = false;
                        clusterFiltered.forEach(val => {
                            $(`#cluster_id option[value="${val.id}"]`).show();
                            if(cluster_id == val.id.toString()) boolCluster = true;
                        });
                        if(!boolCluster) $(`#cluster_id`).val("");
                    });
                    $(`#cluster_id`).change(function(){
                        var cluster = G_SELECT["clusters"].find(x => x.id.toString() == $(this).val());
                        var region = G_SELECT["regions"].find(x => x.id == cluster.region_id);
                        $(`#region_id`).val(region.id);
                    });
                    
                    MODAL.SUBMIT(x, {id: "short_name",method:"POST",url:`api/geofences/${CLIENT.id}/${USER.username}/short_name/`}, function(){
                        var pic = {
                            escalation1: {
                                lq: $(`#esc1-lq`).val() || [],
                                oc: $(`#esc1-oc`).val() || [],
                                ot: $(`#esc1-ot`).val() || [],
                            },
                            escalation2: {
                                lq: $(`#esc2-lq`).val() || [],
                                oc: $(`#esc2-oc`).val() || [],
                                ot: $(`#esc2-ot`).val() || [],
                            },
                            escalation3: {
                                lq: $(`#esc3-lq`).val() || [],
                                oc: $(`#esc3-oc`).val() || [],
                                ot: $(`#esc3-ot`).val() || [],
                            },
                        };
                        return {
                            person_in_charge: pic
                        };
                    });
                };
        
                /******** TABLE CHECK ********/
                // always put before POPULATE functions
                TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                    if(_userData) {
                        if(LIST[urlPath] && LIST[urlPath].length > 0 && !LIST[urlPath][0]._picUsers && table.dt){
                            table.updateRows(LIST[urlPath]);
                        }
                    }
                    if(GGS.STATUS.REGIONS) {
                        if(LIST[urlPath] && LIST[urlPath].length > 0 && !LIST[urlPath][0]._region && table.dt){
                            table.updateRows(LIST[urlPath]);
                        }
                    }
                    if(GGS.STATUS.CLUSTERS) {
                        if(LIST[urlPath] && LIST[urlPath].length > 0 && !LIST[urlPath][0]._cluster && table.dt){
                            table.updateRows(LIST[urlPath]);
                        }
                    }
                    if(GGS.STATUS.GEOFENCES) { 
                        if(!_new_) {
                            _new_ = true;
                            
                            table.initialize();
                            table.populateRows(LIST[urlPath]);
                            table.hideProgressBar();
                        }
                    }
                    if(_userData && GGS.STATUS.REGIONS && GGS.STATUS.CLUSTERS) { 
                        TABLE.FINISH_LOADING.UPDATE();
                    }
                }
                /******** END TABLE CHECK ********/
                
                /******** USERS & REGIONS********/
                _USERS_ = {
                    urlPath: "users",
                    populate: function(){
                        var _THIS_ = this;
                        _userData = [];
                        LIST[_THIS_.urlPath].forEach(val => {
                            _userData.push({
                                id: val._id,
                                value: val.name,
                                email: val.email
                            });
                        });
                        _userData = SORT.ARRAY_OBJECT(_userData,"value",{sortType:"asc"});
                        TABLE.FINISH_LOADING.START_CHECK();
                    },
                    fetch: function(){
                        var _THIS_ = this;
                        if(LIST[_THIS_.urlPath]){
                            _USERS_.populate();
                        } else {
                            GET.AJAX({
                                url: `/api/${_THIS_.urlPath}/${CLIENT.id}/${USER.username}/all/${JSON.stringify({})}/0/0`,
                                method: "GET",
                                headers: {
                                    "Authorization": SESSION_TOKEN
                                },
                            }, function(docs){
                                console.log("Users",docs);
                                LIST[_THIS_.urlPath] = LIST[_THIS_.urlPath] || [];
                                docs.forEach(val => {
                                    var index = LIST[_THIS_.urlPath].findIndex(x => x._id == val._id);
                                    if(index > -1){
                                        LIST[_THIS_.urlPath][index] = val;
                                    } else {
                                        val._row = GENERATE.RANDOM(36);
                                        LIST[_THIS_.urlPath].push(val);
                                    }
                                });
                                _USERS_.populate();
                            });
                        }
                    }
                };
                _USERS_.fetch();
                /******** END USERS & REGIONS ********/
        
                TABLE.FINISH_LOADING.START_CHECK(); // always put at the bottom
        
            }
        },
        routes: {
            stream: null,
            init: function(){
                var urlPath = "routes",
                    _new_ = true,  
                    _GEOFENCES_,
                    _geofencesData = null,
                    table = new Table({
                        id: "#tbl-routes",
                        urlPath,
                        goto: "routes",
                        perColumnSearch: true,
                        dataTableOptions: {
                            columns: TABLE.COL_ROW(CUSTOM.COLUMN.routes).column,
                            // sDom: "t" + "<'row'<'col-sm-6'i><'col-sm-6'p>>", // remove all filter container
                            createdRow: function (row, data, dataIndex) {
                                var _row = data._row;
                                $(row).attr(`_row`, data._row);
                                table.rowListeners(_row,data._id);
                            },
                            dom: 'lBrti<"tbl-progress-bar">p',
                        },
                        initializeCallback: function(){
                            TABLE.WATCH({urlPath,rowData:table.addRow,options:function(){TABLE.FINISH_LOADING.START_CHECK();}});
                            if(GGS.STATUS.GEOFENCES){
                                TABLE.FINISH_LOADING.UPDATE();
                            }
                        }
                    });
                table.setButtons({
                    actions:{
                        create: function(){
                            initializeModal({
                                url: `/api/${urlPath}/${CLIENT.id}/${USER.username}`,
                                method: "POST"
                            });
                        },
                        refresh: function(){ table.countRows(); },
                        search: function(){ $(`.row-filter`).toggle(); }
                    }
                });
                table.addRow = function(obj){
                    new loadInBackground("geofences","GEOFENCES").g_select_settings();

                    const _this = this;
                    var action = TABLE.ROW_BUTTONS(PAGE.GET(),{loadView:["edit"],readonlyArr:["edit"]});
                    $(`${_this.id} th:last-child`).css({"min-width":action.width,"width":action.width});

                    var origin,destination;
                    if(G_SELECT["geofences"]){
                        origin = G_SELECT["geofences"].find(x => x.id == obj.origin_id) || {};
                        destination = G_SELECT["geofences"].find(x => x.id == obj.destination_id) || {};
                        obj._origin = origin.value;
                        obj._destination = destination.value;
                    } else {
                        origin = {value:`<small class="font-italic text-muted">loading...</small>`};
                        destination = {value:`<small class="font-italic text-muted">loading...</small>`};
                    }
        
                    return TABLE.COL_ROW(null,{
                        '_id': obj._id,
                        '_row':  obj._row,
                        'Origin': obj._origin || origin.value || "-",
                        'Destination': obj._destination || destination.value || "-",
                        'Transit Time': DATETIME.HH_MM(null,obj.transit_time).hour_minute,
                        'Action': action.buttons,
                    }).row;
                };
                table.rowListeners = function(_row,_id){
                    const _this = this;
                    TABLE.ROW_LISTENER({table_id:_this.id,_row,urlPath,_id,initializeModal});
                };

                var initializeModal = function(x){
                    new loadInBackground("geofences","GEOFENCES").g_select_settings();

                    var title = (x.method == "PUT") ? `Edit Route Data` : `Create New Route`,
                        modalElements = function(obj){
                            var disabled = (obj) ? true : false;
                            obj = obj || {};
                            return [
                                {title:"Origin",id:"origin_id",type:"select2",multiple:false,required:true,value:obj.origin_id,options:G_SELECT["geofences"],disabled,sub_title:"Site Code is required for geofence to apper in the options"},
                                {title:"Destination",id:"destination_id",type:"select2",multiple:false,required:true,value:obj.destination_id,options:G_SELECT["geofences"],disabled,sub_title:"Site Code is required for geofence to apper in the options"},
                                {title:"Route",id:"_id",type:"text",required:true,value:obj._id,readonly:true},
                                {title:"Transit Time (HH:MM)",id:"transit_time",type:"time",required:true,value:obj.transit_time},
                            ];
                        };
                    $(`body`).append(MODAL.CREATE.BASIC({title, el: modalElements(x.obj)}));
                    $(`#origin_id,#destination_id`).select2().change(function(){
                        var origin_id = $(`#origin_id`).val(),
                            destination_id = $(`#destination_id`).val(),
                            originGeofence = G_SELECT["geofences"].find(x => x.id == origin_id) || {},
                            destinationGeofence = G_SELECT["geofences"].find(x => x.id == destination_id) || {};
                        $(`#_id`).val(`${originGeofence.code}${clientCustom.originDestinationSeparator}${destinationGeofence.code}`);
                    }).trigger("change");
                    $(`#transit_time-hh,#transit_time-mm`).change(function(){
                        var hh = $(`#transit_time-hh`).val() || 0,
                            mm = $(`#transit_time-mm`).val() || 0,
                            dh = Number(DATETIME.DH(null,`${hh}:${mm}`,"0"));
                        $(`#transit_time`).val(dh);
                    });
                    
                    MODAL.SUBMIT(x);
                };

                /******** TABLE CHECK ********/
                TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                    isFinishedLoading(["ROUTES"], _new_, function(){
                        _new_ = false;
                        table.initialize();
                        table.populateRows(LIST[urlPath]);
                        table.hideProgressBar();
                    });
                    isFinishedLoading(["GEOFENCES"], true, function(){
                        if(LIST[urlPath].length > 0 && !LIST[urlPath][0]._origin && table.dt){
                            table.updateRows(LIST[urlPath]);
                        }
                        TABLE.FINISH_LOADING.UPDATE();
                    });
                }
                /******** END TABLE CHECK ********/

                /******** GEOFENCES ********/
                _GEOFENCES_ = {
                    urlPath: "geofences",
                    populate: function(){
                        var _THIS_ = this;
                        _geofencesData = [];
                        LIST[_THIS_.urlPath].forEach(val => {
                            if(val.code){
                                _geofencesData.push({
                                    id: val._id,
                                    value: val.short_name,
                                    code: val.code
                                });
                            }
                        });
                        _geofencesData = SORT.ARRAY_OBJECT(_geofencesData,"value",{sortType:"asc"});
                        TABLE.FINISH_LOADING.START_CHECK();
                    }
                };
                /******** END GEOFENCES ********/
                TABLE.FINISH_LOADING.START_CHECK();
                /******** END TABLE CHECK ********/
            }
        }
    }
};
var VEHICLES = {
    STATUS: [
        {id:"Available",desc:"Working vehicle."},
        {id:"For Restoration (WRU)",desc:"WRU has been informed that the device is offline and has to be restored."},
        {id:"Standby",desc:"Working vehicle but not used."},
        {id:"Preventive Maintenance",desc:"Vehicle undergoing rehabilitation work."},
        {id:"Truck Breakdown",desc:"Vehicle is under repair."},
    ],
    FUNCTION: {
        init: function(){
            var urlPath = "vehicles",
                _new_ = true,  
                _new1_ = true,  
                table = new Table({
                    id: "#tbl-vehicles",
                    urlPath,
                    goto: "vehicles",
                    dataTableOptions: {
                        columns: TABLE.COL_ROW(CUSTOM.COLUMN.vehicles()).column,
                        order: clientCustom.columnOrder.vehicles,
                        createdRow: function (row, data, dataIndex) {
                            var _row = data._row;
                            $(row).attr(`_row`, data._row);

                            table.rowListeners(_row,data._id);
                        },
                        dom: 'lBfrti<"tbl-progress-bar">p',
                    },
                    initializeCallback: function(){
                        TABLE.WATCH({urlPath,rowData:table.addRow,options:function(){TABLE.FINISH_LOADING.START_CHECK();}});
                    }
                });
            table.setButtons({
                actions:{
                    refresh: function(){ table.countRows(); },
                    filter: function(){
                        $(`#filter-container`).toggle("slide", {direction:'right'},100);
                    },
                    export: function(){
                        $(`#filter-container`).hide("slide", {direction:'right'},100);
                        $(`#cv-container`).hide("slide", {direction:'right'},100);
                        $(`#export-container`).toggle("slide", {direction:'right'},100);
                    },
                    data_maintenance: function(){
                        var ID = CLIENT.id;
                        var USERNAME = USER.username;
                        var ROLE = USER.role;
                        var modalHTML = modalViews.vehicles.data_maintenance();
                        var initializeArray = [
                            { urlPath: "vehicles_section", key: "section", objectData: (_id) => { return getVehiclesSection(_id); } },
                            { urlPath: "vehicles_company", key: "company", objectData: (_id) => { return getVehiclesCompany(_id); } },
                        ];
                        HISTORY.defaults.data_maintenance(ID,USERNAME,ROLE,SESSION_TOKEN,modalHTML,initializeArray);
                    }
                }
            });
            table.addRow = function(obj){
                const _this = this;
                var action = TABLE.ROW_BUTTONS(PAGE.GET(),{loadView:["edit","view"],readonlyArr:["edit","view"]}),
                    status = VEHICLES.STATUS.find(x => x.id == (obj.Availability||"")) || {value:"Available"};
                $(`${_this.id} th:last-child`).css({"min-width":action.width,"width":action.width});

                var vehiclesHistory = getVehicleHistory(obj._id) || {};
                var location = vehiclesHistory.location || [],
                    loc0 = location[location.length-2],
                    loc1 = location[location.length-1],
                    lastLocHTML = "";
                // location
                if(loc1){
                    var timestamp = loc1.events[loc1.events.length-1].timestamp;
                    lastLocHTML += `<div><i class="la la-map-marker text-muted font-16"></i>${loc1.short_name} (2)<small class="text-muted ml-2">[${DATETIME.FORMAT(timestamp,"MM/DD/YYYY hh:mm A")}]</small></div>`;
                }
                if(loc0){
                    var timestamp = loc0.events[loc0.events.length-1].timestamp;
                    lastLocHTML += `<div><i class="la la-map-marker text-muted font-16"></i>${loc0.short_name} (1)<small class="text-muted ml-2">[${DATETIME.FORMAT(timestamp,"MM/DD/YYYY hh:mm A")}]</small></div>`;
                }
                // end location

                if(obj["Site"]){
                    if($(`#_site`).find(`option[value='${obj["Site"]}']`).length == 0){
                        $(`#_site`).append(`<option value="${obj["Site"]}">${obj["Site"]}</option>`);
                    }
                }
                
                var section = `<small class="font-italic text-muted">loading...</small>`;
                if(LIST["vehicles_section"]) section = (getVehiclesSection(obj.section_id) || {}).section || "-";
                
                var company = `<small class="font-italic text-muted">loading...</small>`;
                if(LIST["vehicles_company"]) company = (getVehiclesCompany(obj.company_id) || {}).company || "-";
    
                return TABLE.COL_ROW(null,{
                    '_id': obj._id,
                    '_row':  obj._row,
                    'Name': obj.name || "-",
                    'Plate Number': obj["Plate Number"] || "-",
                    'Trailer': obj["Trailer"] || "-",
                    'Equipment Number': obj["Equipment Number"] || "-",
                    'Conduction Number': obj["Tractor Conduction"] || "-",
                    'Truck Number': obj["Truck Number"] || "-",
                    'Site': obj["Site"] || "-",
                    'Section': section,
                    'Company':company,
                    'Availability': obj.Availability||"Available",
                    'Last 2 Locations': lastLocHTML || "-",
                    'Action': action.buttons,
                }).row;
            };
            table.rowListeners = function(_row,_id){
                const _this = this;
                TABLE.ROW_LISTENER({table_id:_this.id,_row,urlPath,_id,
                    editCallback: function(){
                        // LOAD SELECT 2 OPTIONS FOR: ORIGIN,DESTINATION,VEHICLES
                        getSelect2Options();

                        var obj = LIST[_this.urlPath].find(x => x._id == _id);
                        var title = `Edit Vehicle Details`,
                            modalElements = function(){
                                var arr = [];
                                clientCustom.modalFields.vehicles.forEach(val => {
                                    switch (val) {
                                        case "Trailer":
                                            arr.push({title:"Trailer",id:"Trailer",type:"select2",attr:"blankStringIfEmpty"});
                                            break;
                                        case "section_id":
                                            arr.push({ title:"Section", id:"section_id", type:"select2"});
                                            break;
                                        case "company_id":
                                            arr.push({title:"Company",id:"company_id",type:"select2"});
                                            break;
                                        case "Availability":
                                            arr.push({title:"Availability",id:"Availability",type:"select",value:obj.Availability,options:VEHICLES.STATUS,noDefault:true});
                                            break;
                                        case "desc":
                                            arr.push({title:"Description",id:"desc",type:"textarea",disabled:true,notInclude:true});
                                            break;
                                        default:
                                            break;
                                    }
                                });
                                return arr;
                            };
                        $(`body`).append(MODAL.CREATE.BASIC({title, el: modalElements()}));
                        $(`#Availability`).change(function(){
                            var option = VEHICLES.STATUS.find(x => x.id == $(this).val()) || {desc:""};
                            $(`#desc`).val(option.desc);
                        }).trigger("change");

                        $(`#Trailer`).html(G_SELECT2["form-trailers"]).select2({
                            matcher: matcher,
                            templateResult: formatCustom
                        }).val(obj["Trailer"] || "").trigger("change");
                        
                        $(`#section_id`).html(G_SELECT2["form-vehicles_section"]).select2().val(obj.section_id || "").trigger("change");
                        $(`#company_id`).html(G_SELECT2["form-vehicles_company"]).select2().val(obj.company_id || "").trigger("change");

                        var ggsUpdate = {
                            object: [],
                            ggsURL:`https://${CLIENT.ggsURL}/comGpsGate/api/v.1/batch/applications/${CLIENT.appId}/users/${_id}/customfields`
                        };
                        clientCustom.modalFields.vehicles.forEach(val => {
                            switch (val) {
                                case "Trailer":
                                    ggsUpdate.object.push({name:"Trailer",el:"#Trailer option:selected"});
                                    break;
                                case "Availability":
                                    ggsUpdate.object.push({name:"Availability",el:"#Availability option:selected"});
                                    break;
                                default:
                                    break;
                            }
                        });

                        MODAL.SUBMIT({
                            method:"PUT",
                            url:`/api/${_this.urlPath}/${CLIENT.id}/${USER.username}/${_id}`,
                        },ggsUpdate);
                    },
                    additionalListeners: function(){
                        $(_this.id).on('click', `[_row="${_row}"] [view],[_row="${_row}"] + tr.child [view]`,function(e){
                            e.stopImmediatePropagation();
                            var vehicleName = (getVehicle(_id) || {}).name;
                            var obj = getVehicleHistory(_id) || {};
                            $(`body`).append(modalViews.vehicles.location_history({title:`Location History for ${vehicleName}`,location:obj.location}));
                            var vehicleTblIds = () => { var arr = []; [0,1,2,3,4].forEach(val => { arr.push(`#vehicleLocation${val}`); });  return arr.join(",");};
                            $(vehicleTblIds()).DataTable({
                                scrollY: "200px",
                                order: [[ 0, "desc" ]],
                                paging: false,
                                dom: 't',
                                columns: TABLE.COL_ROW([
                                    {data: "Date", title: "Date", type:"date", visible: true},
                                    {data: "Rule Name", title: "Rule Name", visible: true},
                                ]).column
                            } );
                        });
                    
                    }
                });
            };
            table.filterListener = function(){
                const _this = this;
                var filter = USER.filters.vehicles || {};
                try {
                    filter = JSON.parse(USER.filters.vehicles);
                } catch(error){ }

                
                    
                $(`.page-box`).append(SLIDER.EXPORT()); 
                TABLE.TOOLBAR(_this.dt);
                $(`.buttons-copy span`).html("Copy Table");
                $(`.buttons-csv span`).html("Export Table As CSV File");
                $(`.buttons-excel span`).html("Export Table As Excel File");

                if(filter.site && filter.site != "All"){
                    $(`#filter-container`).toggle("slide", {direction:'right'},100);
                    setTimeout(function(){
                        $(`#_site`).val(filter.site);
                        $(`#filter-btn`).trigger("click");
                    },100);
                }
                
                function saveFilter(_filter_){
                    if(filter.site != _filter_.site){
                        var data = {};
                        data[`filter.vehicles`] = JSON.stringify(_filter_);
                        GET.AJAX({
                            url: `/api/users/${CLIENT.id}/${USER.username}/${USER.username}`,
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json; charset=utf-8",
                                "Authorization": SESSION_TOKEN
                            },
                            data: JSON.stringify(data)
                        }, function(docs){
                            console.log("docs1",docs);
                            _this.dt.column(4).search(_filter_.site).draw(false);
                            USER.filters.vehicles = _filter_;
                            filter.site = _filter_.site;
                            $(`#filter-btn`).html("Apply").removeClass("disabled");
                        });
                    } else {
                        _this.dt.column(4).search(_filter_.site).draw(false);
                        $(`#filter-btn`).html("Apply").removeClass("disabled");
                    }
                }
                $(`#filter-btn`).click(function(){
                    $(this).html(`<i class="la la-spinner la-spin"></i> Apply`).addClass("disabled");
                    var _site = ($(`#_site`).val() == "All") ? "" : $(`#_site`).val();

                    saveFilter({site: _site});
                });
                $(`#reset-btn`).click(function(){
                    $(`#_site`).val("All");
                    $(`#filter-btn`).trigger("click");
                });
            };

            /******** TABLE CHECK ********/
            TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                isFinishedLoading(["VEHICLES"], _new_, function(){
                    _new_ = false;
                    table.initialize();
                    table.populateRows(LIST[urlPath]);
                    table.hideProgressBar();
                });
                isFinishedLoading(["TRAILERS","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLES_HISTORY"], _new1_, function(){
                    if((LIST[urlPath]||[]).length > 0 && table.dt && _new1_){
                        _new1_ = false;
                        table.updateRows(LIST[urlPath]);
                    }
                });
                isFinishedLoading(["TRAILERS","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLES_HISTORY"], true, function(){
                    TABLE.FINISH_LOADING.UPDATE();
                });
            }
            TABLE.FINISH_LOADING.START_CHECK();
            /******** END TABLE CHECK ********/
        }
    }
};
var VEHICLE_PERSONNEL = {
    FUNCTION: {
        init: function(){
            var urlPath = "vehicle_personnel",
                _new_ = true,  
                _new1_ = true,  
                table = new Table({
                    id: "#tbl-vehicle_personnel",
                    urlPath,
                    goto: "vehicle_personnel",
                    dataTableOptions: {
                        columns: TABLE.COL_ROW(CUSTOM.COLUMN.vehicle_personnel).column,
                        order: [[ 3, "asc" ]],
                        createdRow: function (row, data, dataIndex) {
                            var _row = data._row;
                            $(row).attr(`_row`, data._row);

                            table.rowListeners(_row,data._id);
                        },
                        dom: 'lBfrti<"tbl-progress-bar">p',
                    },
                    initializeCallback: function(){
                        TABLE.WATCH({urlPath,rowData:table.addRow,options:function(){TABLE.FINISH_LOADING.START_CHECK();}});
                    }
                });
            table.setButtons({
                loadView: ["create"],
                actions:{
                    create: function(){
                        initializeModal({
                            url: `/api/${urlPath}/${CLIENT.id}/${USER.username}`,
                            method: "POST"
                        });
                    },
                    refresh: function(){ table.countRows(); },
                    data_maintenance: function(){
                        var ID = CLIENT.id;
                        var USERNAME = USER.username;
                        var ROLE = USER.role;
                        var modalHTML = modalViews.vehicle_personnel.data_maintenance();
                        var initializeArray = [
                            { urlPath: "vehicle_personnel_section", key: "section", objectData: (_id) => { return getVehiclePersonnelSection(_id); } },
                            { urlPath: "vehicle_personnel_company", key: "company", objectData: (_id) => { return getVehiclePersonnelCompany(_id); } },
                        ];
                        HISTORY.defaults.data_maintenance(ID,USERNAME,ROLE,SESSION_TOKEN,modalHTML,initializeArray);
                    }
                }
            });
            table.addRow = function(obj){
                const _this = this;
                var action = TABLE.ROW_BUTTONS(PAGE.GET(),{
                    loadView:["edit"],
                    readonlyArr:["edit"],
                    deleteArr:[
                        { button: "edit-rest-days", byPassCondition: (obj.occupation!="Driver" && obj.occupation!="Checker" && obj.occupation!="Helper") },
                    ]
                });
                $(`${_this.id} th:last-child`).css({"min-width":action.width,"width":action.width});

                var vehicle = `<small class="font-italic text-muted">loading...</small>`;
                if(LIST["vehicles"]) vehicle = (getVehicle(obj.vehicle_id) || {}).name || "-";
                
                var section = `<small class="font-italic text-muted">loading...</small>`;
                if(LIST["vehicle_personnel_section"]) section = (getVehiclePersonnelSection(obj.section_id) || {}).section || "-";
                
                var company = `<small class="font-italic text-muted">loading...</small>`;
                if(LIST["vehicle_personnel_company"]) company = (getVehiclePersonnelCompany(obj.company_id) || {}).company || "-";

                return TABLE.COL_ROW(null,{
                    '_id': obj._id,
                    '_row':  obj._row,
                    'Name': obj.name || "-",
                    'Occupation': obj.occupation || "-",
                    'Vehicle': vehicle,
                    'Section': section,
                    'Company': company,
                    'Action': action.buttons,
                }).row;
            };
            table.rowListeners = function(_row,_id){
                const _this = this;
                TABLE.ROW_LISTENER({table_id:table.id,_row,urlPath,_id,initializeModal,
                    additionalListeners: function(){
                        $(table.id).on('click', `[_row="${_row}"] [edit-rest-days],[_row="${_row}"] + tr.child [edit-rest-days]`,function(e){
                            e.stopImmediatePropagation();
                            $(`body`).append(modalViews.vehicle_personnel.rest_days(_id));
                            $("html, body,#modal").animate({ scrollTop: 0 }, "fast");

                            var obj = LIST["vehicle_personnel"].find(x => x._id.toString() == _id.toString()) || {};

                            var calendarValue = {};

                            /********** CALENDAR TYPE **********/
                            $(`#calendar_type`).change(function(){
                                var calendarType = $(this).val();
                                
                                $(`#inline-calendar`).data('daterangepicker').setDates(calendarValue[calendarType]||[]);

                                // console.log("calendarValue",calendarValue)
                                if(calendarType == "_rest_days"){
                                    $(`#recurring`).parent().parent().show();
                                    if(calendarValue[calendarType].length == 0){
                                        $(`#recurring`).attr("disabled",true);
                                        $(`#recurring`).parent().parent().addClass("text-muted").css({"pointer-events":"none"});
                                    } else {
                                        $(`#recurring`).attr("disabled",false);
                                        $(`#recurring`).parent().parent().removeClass("text-muted").css({"pointer-events":""});
                                    }
                                } else {
                                    $(`#recurring`).parent().parent().hide();
                                }
                            });
                            /********** END CALENDAR TYPE **********/


                            /********** INLINE CALENDAR **********/
                            $(`#inline-calendar`).daterangepicker({
                                multipleDates: true,
                                showSingleCalendar: true,
                                displayAsInlineCalendar: true,
                                alwaysShowCalendars: true,
                                customStyle: {
                                    width: "268px",
                                    adjustTop: 40
                                },
                                parentEl: $(`#inline-calendar`).parent(),
                                isInvalidDate: function(ele) {
                                    var currDate = moment(ele._d).format('YY-MM-DD');
                                    var calendarType = $(`#calendar_type`).val();
                                    var otherCalendarDates = [];
                                    Object.keys(calendarValue).forEach(key => {
                                        if(key != calendarType){
                                            (calendarValue[key]||[]).forEach(val => {
                                                otherCalendarDates.push(moment(val).format('YY-MM-DD'));
                                            });
                                        }
                                    });
                                    return otherCalendarDates.indexOf(currDate) != -1;
                                }
                            }).on('apply.daterangepicker', function(ev,picker){
                                var calendarType = $(`#calendar_type`).val();
                                calendarValue[calendarType] = $(`#inline-calendar`).data('daterangepicker').getDates(); 

                                if(calendarType == "_rest_days"){
                                    if(calendarValue[calendarType].length == 0){
                                        $(`#recurring`).attr("disabled",true);
                                        $(`#recurring`).parent().parent().addClass("text-muted").css({"pointer-events":"none"});
                                    } else {
                                        $(`#recurring`).attr("disabled",false);
                                        $(`#recurring`).parent().parent().removeClass("text-muted").css({"pointer-events":""});
                                    }
                                }
                            });
                            
                            // open the calendar after initialization
                            $('#inline-calendar').trigger('click');
                            /********** END INLINE CALENDAR **********/


                            /********** RECURRING **********/
                            $(`#recurring`).change(function(){
                                var arr = [];
                                var firstDate = $(`#inline-calendar`).data('daterangepicker').getDates()[0];
                                if(firstDate){
                                    arr.push(new Date(firstDate));

                                    if($(this).is(":checked")){
                                        var nextDate = null;

                                        function addPerWeek(){
                                            nextDate = moment(new Date(nextDate||firstDate)).add(7,"day").format("MM/DD/YYYY");
                                            arr.push(new Date(nextDate));
                                        }
                                        var recurringWeeks = 29; // total of 30 (included firstDate)
                                        for(var i = 0; i < recurringWeeks; i++){
                                            addPerWeek();
                                        }
                                    }
                                
                                    $(`#inline-calendar`).data('daterangepicker').setDates(arr);
                                }
                            });
                            /********** END RECURRING **********/


                            /********** OBJECT DATA INITIALIZATION **********/
                            // add this after datepicker is initialized 
                            $(`#recurring`).prop("checked",obj.recurring||false);

                            var dates = obj.dates || {};
                            $(`#calendar_type option`).each((i,el) => {
                                var calendarType = $(el).val();
                                var key = calendarType.substring(1);

                                var arrDates = [];
                                (dates[key]||[]).forEach(val => { arrDates.push(new Date(val)); });
                                calendarValue[calendarType] = arrDates;
                            });
                            $(`#calendar_type`).trigger("change");
                            /********** END OBJECT DATA INITIALIZATION **********/


                            /********** SUBMIT **********/
                            $(`#submit`).click(function(){
                                var body = {
                                    recurring: $('#recurring').is(":checked"),
                                    dates: {}
                                };
                                Object.keys(calendarValue).forEach(key => {
                                    var new_key = key.substring(1);
                                    var values = (calendarValue[key]||[]).map(d => moment(d).startOf("day").toISOString());
                                    body.dates[new_key] = values;
                                });

                                $(`#submit`).html(`<i class="la la-spin la-spinner"></i> Submit`).attr("disabled",true);
                                GET.AJAX({
                                    url: `/api/${urlPath}/${CLIENT.id}/${USER.username}/${_id}`,
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json; charset=utf-8",
                                        "Authorization": SESSION_TOKEN
                                    },
                                    data: JSON.stringify(body)
                                }, function(docs){
                                    $(`.daterangepicker`).hide();
                                    $(`#overlay`).remove();
                                    TOASTR.UPDATEDSUCCESSFULLY();
                                });
                            });
                            /********** END SUBMIT **********/
                        });
                    }
                });
            };
            table.filterListener = function(){
                const _this = this;
                var filter = USER.filters.vehicles || {};
                try {
                    filter = JSON.parse(USER.filters.vehicles);
                } catch(error){ }

                if(filter.site && filter.site != "All"){
                    $(`#filter-container`).toggle("slide", {direction:'right'},100);
                    setTimeout(function(){
                        $(`#_site`).val(filter.site);
                        $(`#filter-btn`).trigger("click");
                    },100);
                }
                
                function saveFilter(_filter_){
                    if(filter.site != _filter_.site){
                        var data = {};
                        data[`filter.vehicles`] = JSON.stringify(_filter_);
                        GET.AJAX({
                            url: `/api/users/${CLIENT.id}/${USER.username}/${USER.username}`,
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json; charset=utf-8",
                                "Authorization": SESSION_TOKEN
                            },
                            data: JSON.stringify(data)
                        }, function(docs){
                            console.log("docs1",docs);
                            _this.dt.column(4).search(_filter_.site).draw(false);
                            USER.filters.vehicles = _filter_;
                            filter.site = _filter_.site;
                            $(`#filter-btn`).html("Apply").removeClass("disabled");
                        });
                    } else {
                        _this.dt.column(4).search(_filter_.site).draw(false);
                        $(`#filter-btn`).html("Apply").removeClass("disabled");
                    }
                }
                $(`#filter-btn`).click(function(){
                    $(this).html(`<i class="la la-spinner la-spin"></i> Apply`).addClass("disabled");
                    var _site = ($(`#_site`).val() == "All") ? "" : $(`#_site`).val();

                    saveFilter({site: _site});
                });
                $(`#reset-btn`).click(function(){
                    $(`#_site`).val("All");
                    $(`#filter-btn`).trigger("click");
                });
            };

            var initializeModal = function(x={}){
                // LOAD SELECT 2 OPTIONS FOR: VEHICLES
                getSelect2Options();
                x.obj = x.obj || {};
                
                var title = (x.method == "PUT") ? `Edit Personnel Data` : `Create New Vehicle Personnel`,
                    modalElements = function(obj){
                        //  Name, Occupation, Vehicle, ID number
                        var occupationOptions = [{
                            id: "Driver",
                            value: "Driver"
                        },{
                            id: "Checker",
                            value: "Checker"
                        },{
                            id: "Helper",
                            value: "Helper"
                        }]
                        return [
                            {title:"Name",id:"name",type:"text",required:true,value:obj.name},
                            {title:"Occupation",id:"occupation",type:"select",required:true,value:obj.occupation,options:occupationOptions},
                            {title:"Vehicle",id:"vehicle_id",type:"select2",attr:"blankStringIfEmpty"},
                            {title:"Section",id:"section_id",type:"select2",attr:"blankStringIfEmpty"},
                            {title:"Company",id:"company_id",type:"select2",attr:"blankStringIfEmpty"},
                            // {title:"ID number",id:"id_number",type:"text",required:true,value:obj.id_number},
                        ];
                    };
                $(`body`).append(MODAL.CREATE.BASIC({title, el: modalElements(x.obj)}));
                
                
                $(`#vehicle_id`).html(G_SELECT2["form-vehicles"]).select2({
                    matcher: matcher,
                    templateResult: formatCustom
                }).val(x.obj.vehicle_id || "").trigger("change");

                $(`#section_id`).html(G_SELECT2["form-vehicle_personnel_section"]).select2().val(x.obj.section_id || "").trigger("change");
                $(`#company_id`).html(G_SELECT2["form-vehicle_personnel_company"]).select2().val(x.obj.company_id || "").trigger("change");

                MODAL.SUBMIT(x);
            };

            /******** TABLE CHECK ********/
            TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                isFinishedLoading(["VEHICLE_PERSONNEL"], _new_, function(){
                    _new_ = false;
                    table.initialize();
                    table.populateRows(LIST[urlPath]);
                    table.hideProgressBar();
                });
                isFinishedLoading(["VEHICLES","VEHICLE_PERSONNEL_SECTION","VEHICLE_PERSONNEL_COMPANY"], _new1_, function(){
                    if((LIST[urlPath]||[]).length > 0 && table.dt){
                        _new1_ = false;
                        table.updateRows(LIST[urlPath]);
                    }
                });
                isFinishedLoading(["VEHICLES","VEHICLE_PERSONNEL_SECTION","VEHICLE_PERSONNEL_COMPANY"], true, function(){
                    TABLE.FINISH_LOADING.UPDATE();
                });
            }
            TABLE.FINISH_LOADING.START_CHECK();
            /******** END TABLE CHECK ********/
        }
    }
};
var TRAILERS = {
    FUNCTION: {
        init: function(){
            var urlPath = "trailers",
                _new_ = true,  
                table = new Table({
                    id: "#tbl-trailers",
                    urlPath,
                    goto: "trailers",
                    dataTableOptions: {
                        columns: TABLE.COL_ROW(CUSTOM.COLUMN.trailers).column,
                        order: [[ 4, "asc" ]],
                        createdRow: function (row, data, dataIndex) {
                            var _row = data._row;
                            $(row).attr(`_row`, data._row);

                            table.rowListeners(_row,data._id);
                        },
                        dom: 'lBfrti<"tbl-progress-bar">p',
                    },
                    initializeCallback: function(){
                        // TABLE.WATCH({urlPath,rowData:table.addRow,options:function(){TABLE.FINISH_LOADING.START_CHECK();}});
                    }
                });
            table.setButtons({
                loadView: ["create"],
                actions:{
                    create: function(){ 
                        initializeModal({
                            url: `/api/${urlPath}/${CLIENT.id}/${USER.username}`,
                            method: "POST"
                        });
                        },
                    refresh: function(){ table.countRows(); },
                    filter: function(){
                        $(`#filter-container`).toggle("slide", {direction:'right'},100);
                    }
                }
            });
            table.addRow = function(obj){
                const _this = this;
                var action = TABLE.ROW_BUTTONS(PAGE.GET());
                $(`${_this.id} th:last-child`).css({"min-width":action.width,"width":action.width});
    
                if(obj.site){
                    if($(`#_site`).find(`option[value='${obj.site}']`).length == 0){
                        $(`#_site`).append(`<option value="${obj.site}">${obj.site}</option>`);
                    }
                }

                return TABLE.COL_ROW(null,{
                    '_row':  obj._row,
                    '_id': obj._id,
                    'Pal Cap': obj.pal_cap || "-",
                    'Region': obj.region || "-",
                    'Cluster': obj.cluster || "-",
                    'Site': obj.site || "-",
                    'Action': action.buttons,
                }).row;
            };
            table.rowListeners = function(_row,_id){
                const _this = this;
                TABLE.ROW_LISTENER({table_id:_this.id,_row,urlPath,_id,initializeModal});
            };
            table.filterListener = function(){
                const _this = this;
                var filter = USER.filters.trailers || {};
                try {
                    filter = JSON.parse(USER.filters.trailers);
                } catch(error){ }

                if(filter.site && filter.site != "All"){
                    $(`#filter-container`).toggle("slide", {direction:'right'},100);
                    setTimeout(function(){
                        $(`#_site`).val(filter.site);
                        $(`#filter-btn`).trigger("click");
                    },100);
                }
                
                function saveFilter(_filter_){
                    if(filter.site != _filter_.site){
                        var data = {};
                        data[`filter.trailers`] = JSON.stringify(_filter_);
                        GET.AJAX({
                            url: `/api/users/${CLIENT.id}/${USER.username}/${USER.username}`,
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json; charset=utf-8",
                                "Authorization": SESSION_TOKEN
                            },
                            data: JSON.stringify(data)
                        }, function(docs){
                            console.log("docs1",docs);
                            _this.dt.column(4).search(_filter_.site).draw(false);
                            USER.filters.trailers = _filter_;
                            filter.site = _filter_.site;
                            $(`#filter-btn`).html("Apply").removeClass("disabled");
                        });
                    } else {
                        _this.dt.column(4).search(_filter_.site).draw(false);
                        $(`#filter-btn`).html("Apply").removeClass("disabled");
                    }
                }
                $(`#filter-btn`).click(function(){
                    $(this).html(`<i class="la la-spinner la-spin"></i> Apply`).addClass("disabled");
                    var _site = ($(`#_site`).val() == "All") ? "" : $(`#_site`).val();

                    saveFilter({site: _site});
                });
                $(`#reset-btn`).click(function(){
                    $(`#_site`).val("All");
                    $(`#filter-btn`).trigger("click");
                });
            };

            var initializeModal = function(x){
                var title = (x.method == "PUT") ? `Edit Trailer Data` : `Create New Trailer`,
                    modalElements = function(obj){
                        var readonly = (x.method == "PUT") ? true : false;
                        obj = obj || {};
                        return [
                            {title:"Trailer",id:"_id",type:"text",required:true,value:obj._id,readonly,sub_title:"Once saved, trailer cannot be edited."},
                            {title:"Pal Cap",id:"pal_cap",type:"text",required:true,value:obj.pal_cap},
                            {title:"Region",id:"region",type:"text",required:true,value:obj.region},
                            {title:"Cluster",id:"cluster",type:"text",required:true,value:obj.cluster},
                            {title:"Site",id:"site",type:"text",required:true,value:obj.site},
                        ];
                    };
                $(`body`).append(MODAL.CREATE.BASIC({title, el: modalElements(x.obj)}));
                MODAL.SUBMIT(x);
            };

            /******** TABLE CHECK ********/
            TABLE.FINISH_LOADING.CHECK = function(){ // add immediately after variable initialization
                isFinishedLoading(["TRAILERS"], _new_, function(){
                    _new_ = false;
                    table.initialize();
                    table.populateRows(LIST[urlPath]);
                    table.hideProgressBar();
                    TABLE.FINISH_LOADING.UPDATE(); 
                });
            }
            TABLE.FINISH_LOADING.START_CHECK();
            /******** END TABLE CHECK ********/
        }
    }
};
var CHANGELOG = {
    FUNCTION: {
        init:function(){
            PAGE.DISPLAY();
            PAGE.TOOLTIP();

            var template = function(version,val,i){
                var className = function(){
                        return (i > 0) ? "mt-3":"";
                    },
                    logType = function(type,text){
                        var bgColors = {
                            feature: "#7ac943",
                            fix: "#ff1d25",
                            release: "#3fa9f5",
                            other: "gray",
                            improved: "#ff931e",
                            refactor: "#a9489a"
                        };
                        text = text.replace("aPAGE",`<span style="color: #334fe5;">`);
                        text = text.replace("zPAGE",`</span>`);
                        text = text.replace("aVERSION",`<span style="color: #adadad;">`);
                        text = text.replace("zVERSION",`</span>`);
                        return `<li>
                                    <div style="display: table-cell;"><span style="background: ${bgColors[type]};color: white;padding: 1px 5px;border-radius: 2px;font-weight: bold;font-size: 10px;margin-right: 2px;">${type}</span></div>
                                    <span style="display: table-cell;padding-left: 3px;">${text}</span>
                                </li>`;
                    },
                    liHTML = "";
                    Object.keys(val).forEach(key => {
                        if(!["hotfix","date"].includes(key)){
                            val[key].forEach(text => {
                                liHTML += logType(key,text);
                            });
                        }
                    });
                return `<div class="col-sm-12 ${className()}">
                            <div class="p-3" style="border: 1px solid #eee;">
                                <h4 style="border-bottom: 1px solid #dcdcdc;font-weight: bold;" class="pb-2 mb-3 mt-1">v.${version}<span class="text-muted" style="font-size: 11px;font-weight: 100;float: right;">${val.date}</span></h4>
                                <ul>${liHTML}</ul>
                            </div>
                        </div>`;
            },
            changelogs = CHANGELOG.FUNCTION.changelogs,
            listHTML = "";

            Object.keys(changelogs).forEach((key,i) => {
                if(i === 0) {
                    $(`#version`).html(key);
                }
                listHTML += template(key,changelogs[key],i);
            });
            $(`.page-box`).append(listHTML);
            $(`#guide-btn`).click(function(){
                $(`body`).append(modalViews.changelogs.guide());
            });
        },
        changelogs: changelogList
    }
};
var LOADING = {
    SPINNER: {
        UI: function(){
            return `<div class="loading-screen">
                        <div>
                            <i class="la la-spinner la-spin"></i>
                            <div id="loading-description" class="col-md-12 text-muted" style="font-size: 10px;font-weight: 100;margin-top: 8px;"></div>
                        </div>
                    </div>`;
        }
    },
    PROGRESSBAR: {
        UI: function(){
            return `<div id="progress-striped-active" class="progress progress-striped active" style="width: 100%;">
                        <div class="progress-bar progress-bar-success" data-transitiongoal="0"></div>
                    </div>`;
        },
        INITIALIZE: function(){
            $('#progress-striped .progress-bar, #progress-striped-active .progress-bar').progressbar({
                display_text: 'fill'
            });
        },
        MOVE: function(minWidth,maxWidth){
            var i = 0;
            function moveProgressBar() {
                if (i == 0) {
                    i = 1;
                    var elem = $(`#progress-striped-active .progress-bar`);
                    var id = setInterval(frame, 10);
                    function frame() {
                        if (minWidth >= maxWidth) {
                            clearInterval(id);
                            i = 0;
                            TABLE.FINISH_LOADING.START_CHECK();
                        } else {
                            minWidth++;
                            $(elem).css("width",`${minWidth}%`).html(`${minWidth}%`);
                        }
                    }
                }
            } 
            moveProgressBar();
        }
    },

};
/************** END USER INTERFACE **************/

/************** FUNCTIONS **************/
var PAGE = {
    EXISTING: [],
    LOGOUT: function(){
        if(SESSION_TOKEN && USER){
            $(`body`).append(`<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;background-color: #ffffffc2;z-index: 999999;">
                                <h3 style="text-align: center;margin-top: 40vh;font-weight: 100;">Logging out...</h3>
                                </div>`);
            GET.AJAX({
                url: `/api/sessions/${CLIENT.id}/${USER.username}/${SESSION_TOKEN}`,
                method: "DELETE",
                headers: {
                    "Authorization": SESSION_TOKEN
                },
            }, function(docs){
                Cookies.remove("GKEY");
                Cookies.remove("session_token");
                location.href = `./${CLIENT.name}/login`;
            });
        } else {
            Cookies.remove("GKEY");
            Cookies.remove("session_token");
            location.href = `./${CLIENT.name}/login`;
        }
    },
    MAIN: {
        UI: {
            PAGE: function(){
                return `<!-- WRAPPER -->
                        <div id="wrapper">
                            ${PAGE.MAIN.UI.NAVBAR()}
                            ${PAGE.MAIN.UI.LEFT_SIDEBAR()}
                            ${PAGE.MAIN.UI.BODY()}
                            <div class="clearfix"></div>
                        </div>
                        <!-- END WRAPPER -->`;
            },
            NAVBAR: function(){
                return `<!-- NAVBAR -->
                        <nav class="navbar navbar-default navbar-fixed-top">
                            <div class="container-fluid pl-0">
                                <div class="brand">
                                    <img src="public/img/logo-02.png" alt="WRU Logo" class="img-responsive logo" style="image-rendering: -webkit-optimize-contrast;">
                                </div>
                                <div id="tour-fullwidth" class="navbar-btn pl-2">
                                    <button type="button" class="btn-toggle-fullwidth"><i class="la la-arrow-circle-left"></i></button>
                                    <button type="button" class="btn-fullscreen pl-2 p-2"><i class="la la-expand-arrows-alt"></i></button>
                                </div>
                                <div id="navbar-menu">
                                    <ul class="nav navbar-nav navbar-right">
                                        <li class="dropdown">
                                            <!--<div style="display: inline-block;">
                                                <span style="display: inline-block;padding-right: 20px;padding-top: 0px;">
                                                    <img id="junkOne" src="" style="display: none;">
                                                    <i class="la la-wifi mr-1 text-success"></i>
                                                    <small id="timer">-ms</small>
                                                </span>
                                            </div>-->
                                            <img src="../public/img/${CLIENT.id}-dashboard.png" style="height: 17px;margin-top: 13px;image-rendering: -webkit-optimize-contrast;">
                                            <a href="#" class="dropdown-toggle pt-0 pr-2 pl-1" style="min-width: 100px;float: right;text-align: right;" data-toggle="dropdown">
                                                <span>${USER.username}<i style="font-size: 9px;margin-left: 6px;" class="icon-submenu la la-angle-down"></i></span>
                                            </a>
                                            <ul class="dropdown-menu logged-user-menu">
                                                <li><a href="#profile"><i class="la la-user"></i> <span>Profile</span></a></li>
                                                <!-- <li><a href="appviews-inbox.html"><i class="la la-email"></i> <span>Message</span></a></li> -->
                                                <li><a href="#settings"><i class="la la-cog"></i> <span>Settings</span></a></li>
                                                <li><a href="#logout"><i class="la la-sign-out-alt"></i> <span>Logout</span></a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </nav>
                        <!-- END NAVBAR -->`;
            },
            LEFT_SIDEBAR: function(){
                var link = function(page){
                        var badge = (page.notification) ? `<span id="${page.name}-badge" class="badge" style="display:none;">0</span>` : "";
                        return `<li><a href="#${page.name}"><i class="${page.icon}"></i> <span class="title">${page.title}</span>${badge}</a></li>`;
                    },
                    menubar = function(sub_menu,parentText){
                        // var badge = (notification) ? `<span class="badge">15</span>` : "";
                        var finalParentText = parentText || "Parent Menu";
                        finalParentText = finalParentText.capitalize();
                        var __sub = "",
                            icon = "";
                        sub_menu.forEach(val => {
                            var page = PAGE_FUNCTIONALITIES[val];
                            __sub += link(page);
                            icon = page.icon;
                        });
                        return `<li class="panel">
                                    <a href="#${parentText}" data-toggle="collapse" class="collapsed" aria-expanded="false"><i class="${icon}"></i> <span class="title">${finalParentText}</span> <i class="icon-submenu la la-angle-left"></i></a>
                                    <div id="${parentText}" class="collapse" aria-expanded="false" style="height: 0px;">
                                        <ul class="submenu">${__sub}</ul>
                                    </div>
                                </li>`;
                    },
                    li = "";
                GRANTED_PAGES.forEach(x => {
                    if(!ISMOBILE  || (ISMOBILE && x.allowOnMobile === true)) {
                        var menu_group = "";
                        if(x.menu_group){
                            var menu_group_class = x.menu_group.class || "";
                            menu_group = `<li class="menu-group ${menu_group_class}">${x.menu_group.title}</li>`
                        }
                        li+=menu_group;
                        if(x.sub_menu) li+=menubar(x.sub_menu,x.name);
                        else li+=link(x);
                    }
                });
                return `<!-- LEFT SIDEBAR -->
                        <div id="sidebar-nav" class="sidebar">
                            <nav>
                                <ul class="nav" id="sidebar-nav-menu">
                                    <!-- <li class="menu-group">Menu</li> -->
                                    <li class="panel">${li}</li>
                                </ul>
                            </nav>
                        </div>
                        <!-- END LEFT SIDEBAR -->`;
            },
            BODY: function(){
                var version = "";
                Object.keys(CHANGELOG.FUNCTION.changelogs).forEach((key,i) => { if(i === 0) { version = key; } });
                return `<!-- MAIN -->
                        <div class="main">
                            <!-- MAIN CONTENT -->
                            <div class="main-content">
                                <div class="container-fluid p-0">
                                    <a href="javascript:void(0)" class="btn-close-fullscreen" style="display:none;position: absolute;width: 100%;text-align: center;padding: 7px 0px 2px;">Click here to exit fullscreen or press ESC key</a>
                                    <div class="panel panel-profile">
                                        <div class="clearfix"></div>
                                    </div>
                                </div>
                            </div>
                            <!-- END MAIN CONTENT -->
                            <footer>
                                <div class="container-fluid">
                                    <p class="copyright">
                                        <span>Version ${version}</span>
                                        <span class="float-right">&copy; 2020 - ${new Date().getFullYear()} <a href="https://www.wru.ph" target="_blank">WRU Corporation</a>. All Rights Reserved.</span>
                                    </p>
                                </div>
                            </footer>
                        </div>
                        <!-- END MAIN -->`;
            },
            BOTTOM_NAVBAR: function(){
                var link = function(page){
                        return `<a href="#${page.name}" class="navbar-bottom-button"><i class="${page.icon}"></i><div>${page.title_m || page.title}</div></a>`;
                    },
                    li = "",
                    MOBILE_PAGES = GRANTED_PAGES;
                MOBILE_PAGES.push(PAGE_FUNCTIONALITIES["profile"]);
                MOBILE_PAGES.push(PAGE_FUNCTIONALITIES["settings"]);
                MOBILE_PAGES.forEach(x => {
                    if(ISMOBILE && x.allowOnMobile === true) {
                        li+=link(x);
                    }
                });
                return `<!-- BOTTOM NAVBAR -->
                        <div class="navbar navbar-bottom">
                            <div class="navbar-bottom-toggle">
                                <i class="la la-ellipsis-h"></i>
                            </div>
                            <div class="flex-container">
                                ${li}
                            </div>
                        </div>
                        <!-- END BOTTOM NAVBAR -->`;
            },
            MOBILE: function(){
                return `<!-- WRAPPER -->
                            <div id="wrapper">
                                <!-- MAIN -->
                                <div class="main pt-0" style="height: calc(100% - 65px);position: fixed;overflow-y: auto;overflow-x: hidden;">
                                    <!-- MAIN CONTENT -->
                                    <div class="main-content">
                                        <div class="container-fluid p-0">
                                            <div class="panel panel-profile" style="margin-bottom:10px;">
                                                <div style="height: 40px;position: fixed;top: 0;z-index: 99;background: white;width: 100%;">
                                                    <img src="../public/img/logo-02.png" style="width: 190px;padding-top: 7px;display: block;margin: auto;image-rendering: -webkit-optimize-contrast;">
                                                </div>
                                                <div class="clearfix"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- END MAIN CONTENT -->
                                </div>
                                <!-- END MAIN -->
                                ${PAGE.MAIN.UI.BOTTOM_NAVBAR()}
                            </div>
                            <!-- END WRAPPER -->`;
            }
        }, 
        FUNCTION:{
            init:function(){
                // VERSION
                Object.keys(CHANGELOG.FUNCTION.changelogs).forEach((key,i) => { if(i === 0) { VERSION = key; } });

                DEFAULT_DATE = moment(new Date()).format("MM/DD/YYYY");

                PAGE.SET_FUNCTIONALITIES();
                GRANTED_PAGES = [];
                Object.keys(PERMISSION).forEach(key => {
                    if(["all","self"].includes(PERMISSION[key].read)){
                        var page = PAGE_FUNCTIONALITIES[key];
                        if(page){
                            GRANTED_PAGES.push({
                                name: page.name,
                                title: page.title,
                                notification: page.notification,
                                title_m: page.title_m,
                                icon: page.icon,
                                allowOnMobile: page.allowOnMobile,
                                menu_group: page.menu_group
                            });
                        }
                    }
                });

                if(USER.username){
                    if(ISMOBILE){
                        $(`#version`).remove();
                        $(`#body-main`).html(PAGE.MAIN.UI.MOBILE());
                        $(`.navbar-bottom-toggle`).click(function(){
                            $(`.navbar-bottom,.main,#filter-container`).toggleClass("navbar-bottom-hidden");
                        });
                        $(`.panel.panel-profile .clearfix`).css({"margin-top":"40px"});
                        if(HASNOTIFICATION){
                            $(`a[href="#notifications"] > .la-business-time`).html(`<div style="width: 10px;height: 10px;background: #fce146;border-radius: 20px;position: absolute;top: 22px;margin-left: -2px;border: 1px solid #daeb60;"></div>`);
                        }
                    } else {
                        $(`#body-main`).html(PAGE.MAIN.UI.PAGE());
                        // PING.GET();
                    }
                    PAGE.GO_TO();

                    if(USER.role.toLowerCase() != "user"){
                        $(`#sidebar-nav`).css("padding-top","27px").prepend(`
                        <div style="padding: 3px;text-align: center;color: white;background-color: #00a548;font-size: 10px;">${USER.role.capitalize().toUpperCase()}</div>
                        `);
                    }

                    PAGE_SETUP();
                    
                    window.onhashchange = function () {
                        window.history.pushState({}, null, `${window.location.pathname}#${PAGE.GET()}`);
                        PAGE.GO_TO();
                    }
                } else {
                    LOGOUT();
                }

                $(`body`).append(`<audio id="audio01" src="public/sounds/notif.mp3" autostart="0" ></audio>`);
                $(`.btn-toggle-fullwidth`).click(function(){
                    setTimeout(function(){
                        $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
                    },400);
                });
                $(`.btn-fullscreen`).click(function(){
                    $(`.main,.main .main-content .container-fluid`).attr("style","position: absolute;top: 0;left: 0;width: 100%;height: 100%;z-index:9999;");
                    
                    if(PAGE.GET() == "de_dashboard") document.body.style.zoom = 1.3;

                    setTimeout(function(){
                        $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
                    },400);
                    
                    var docElm = document.documentElement;
                    if (docElm.requestFullscreen) {
                        docElm.requestFullscreen();
                    } else if (docElm.msRequestFullscreen) {
                        docElm.msRequestFullscreen();
                    } else if (docElm.mozRequestFullScreen) {
                        docElm.mozRequestFullScreen();
                    } else if (docElm.webkitRequestFullScreen) {
                        docElm.webkitRequestFullScreen();
                    }
                });
                document.addEventListener('fullscreenchange', exitHandler);
                document.addEventListener('webkitfullscreenchange', exitHandler);
                document.addEventListener('mozfullscreenchange', exitHandler);
                document.addEventListener('MSFullscreenChange', exitHandler);

                function exitHandler() {
                    if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
                        ///fire your event
                        if($(`.main,.main .main-content .container-fluid`).attr("style")){
                            $(`.main,.main .main-content .container-fluid`).attr("style","");
                            if(PAGE.GET() == "de_dashboard") document.body.style.zoom = 1;
                            setTimeout(function(){
                                $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
                            },400);
                        }
                    }
                }  
                $(document).keyup(function(e) {
                    if (e.key === "Escape") { // escape key maps to keycode `27`
                        $(`.main,.main .main-content .container-fluid`).attr("style","");
                        if(PAGE.GET() == "de_dashboard") document.body.style.zoom = 1;
                        setTimeout(function(){
                            $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
                        },400);
                    }
                });

                var timeout = 2000,
                    loadDataInBackground = function(instant,delayed){
                        if((CLIENT.loadInBackground||[]).includes(instant)){
                            instant ? new loadInBackground(instant.toLowerCase(),instant.toUpperCase()).load() : null;
                        }

                        setTimeout(function(){ 
                            delayed.forEach(val => { 
                                if((CLIENT.loadInBackground||[]).includes(val)){
                                    new loadInBackground(val.toLowerCase(),val.toUpperCase()).load();
                                }
                            }); 
                        },timeout);
                    },
                    tableWatch = function(urlPath){
                        if((CLIENT.loadInBackground||[]).includes(urlPath.toUpperCase())){
                            TABLE.WATCH({ urlPath });
                        }
                    };

                if(PAGE.GET() == "regions") loadDataInBackground("REGIONS",["CLUSTERS","GEOFENCES","ROUTES","VEHICLES","TRAILERS","VEHICLE_PERSONNEL","SHIFT_SCHEDULE","USERS","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLE_PERSONNEL_SECTION","VEHICLE_PERSONNEL_COMPANY","VEHICLES_HISTORY"]);
                else if(PAGE.GET() == "clusters")loadDataInBackground("CLUSTERS",["REGIONS","GEOFENCES","ROUTES","VEHICLES","TRAILERS","VEHICLE_PERSONNEL","SHIFT_SCHEDULE","USERS","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLE_PERSONNEL_SECTION","VEHICLE_PERSONNEL_COMPANY","VEHICLES_HISTORY"]);
                else if(PAGE.GET() == "geofences") loadDataInBackground("GEOFENCES",["REGIONS","CLUSTERS","ROUTES","VEHICLES","TRAILERS","VEHICLE_PERSONNEL","SHIFT_SCHEDULE","USERS","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLE_PERSONNEL_SECTION","VEHICLE_PERSONNEL_COMPANY","VEHICLES_HISTORY"]);
                else if(PAGE.GET() == "routes" || PAGE.GET() == "dashboard") loadDataInBackground("ROUTES",["GEOFENCES","REGIONS","CLUSTERS","VEHICLES","TRAILERS","VEHICLE_PERSONNEL","SHIFT_SCHEDULE","USERS","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLE_PERSONNEL_SECTION","VEHICLES_HISTORY"]);
                else if(PAGE.GET() == "trailers") loadDataInBackground("TRAILERS",["REGIONS","CLUSTERS","GEOFENCES","ROUTES","VEHICLES","VEHICLE_PERSONNEL","SHIFT_SCHEDULE","USERS","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLE_PERSONNEL_SECTION","VEHICLE_PERSONNEL_COMPANY","VEHICLES_HISTORY"]);
                else if(PAGE.GET() == "vehicles") loadDataInBackground("VEHICLES",["REGIONS","CLUSTERS","GEOFENCES","ROUTES","TRAILERS","VEHICLE_PERSONNEL","SHIFT_SCHEDULE","USERS","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLE_PERSONNEL_SECTION","VEHICLE_PERSONNEL_COMPANY","VEHICLES_HISTORY"]);
                else if(PAGE.GET() == "vehicle_personnel") loadDataInBackground("VEHICLE_PERSONNEL",["REGIONS","CLUSTERS","GEOFENCES","ROUTES","VEHICLES","TRAILERS","USERS","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLE_PERSONNEL_SECTION","VEHICLE_PERSONNEL_COMPANY","VEHICLES_HISTORY"]);
                else if(PAGE.GET() == "shift_schedule") loadDataInBackground("SHIFT_SCHEDULE",["REGIONS","CLUSTERS","GEOFENCES","ROUTES","VEHICLES","TRAILERS","VEHICLE_PERSONNEL","USERS","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLE_PERSONNEL_SECTION","VEHICLE_PERSONNEL_COMPANY","VEHICLES_HISTORY"]);
                else if(PAGE.GET() == "users") loadDataInBackground("USERS",["REGIONS","CLUSTERS","GEOFENCES","ROUTES","VEHICLES","TRAILERS","VEHICLE_PERSONNEL","SHIFT_SCHEDULE","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLE_PERSONNEL_SECTION","VEHICLE_PERSONNEL_COMPANY","VEHICLES_HISTORY"]);
                else loadDataInBackground("VEHICLES",["REGIONS","CLUSTERS","GEOFENCES","ROUTES","TRAILERS","VEHICLE_PERSONNEL","SHIFT_SCHEDULE","USERS","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLE_PERSONNEL_SECTION","VEHICLE_PERSONNEL_COMPANY","VEHICLES_HISTORY"]);

                tableWatch("notifications");
                tableWatch("users");
                tableWatch("sessions");
                tableWatch("vehicles_history");
                tableWatch("vehicles_section");
                tableWatch("vehicles_company");
                tableWatch("vehicle_personnel_section");
                tableWatch("vehicle_personnel_company");

                // PAGE.IDLE();

                (USER) ? _SESSION_.lastActive(CLIENT.id,USER.username,SESSION_TOKEN) : null;
            },
        }
    },
    GO_TO: function(){
        var goto = PAGE.GET(),
            a_href = `a[href="#${goto}"]`,
            urlParams = new URLSearchParams(window.location.search),
            __data = CRYPTO.DECRYPT(urlParams.get('data'));
        PAGE.SET_TITLE(goto);

        (__data.for != goto) ? window.history.pushState({}, null, `/${CLIENT.name}#${goto}`) : null;
        $(`.panel-profile > .dt-buttons`).remove();
        
        DASHBOARD.FUNCTION.addDataToTable = null;
        DASHBOARD.FUNCTION.addDataToTable2 = null;

        TABLE.FINISH_LOADING.CHECK = null;

        clearInterval(DE_CHECKDUPS);

        // set so that at 12 midnight, it will change DEFAULT_DATE
        DEFAULT_DATE = moment(new Date()).format("MM/DD/YYYY");

        // if(goto == "dispatch"){
        //     $(`.main-content .clearfix`).css({"height":(($(window).innerHeight()-167)+"px")}).html(LOADING.PROGRESSBAR.UI());
        //     LOADING.PROGRESSBAR.FUNCTION();
        // } else {
            $(`.main-content .clearfix`).css({"height":(($(window).innerHeight()-167)+"px")}).html(LOADING.SPINNER.UI());
        // }

        // add "active" class to menu. For dropdown menus. Do not delete for future references.
        var __parent_id = $(a_href).parents(".collapse").attr("id");
        ($(`#${__parent_id}`).attr("aria-expanded") == "false") ?  $(`[href="#${__parent_id}"]`).click() : null;
        $(`[aria-expanded="true"][href!="#${__parent_id}"]:not(#${__parent_id})`).click();

        $(`li > a.active,.navbar > .flex-container > a.active`).removeClass("active");
        ($(a_href).length > 0) ? $(a_href).addClass("active") : $(`a[href="#create"]`).addClass("active");

        if(PAGE_FUNCTIONALITIES[goto] && (["profile","settings","logout"].includes(goto) || GRANTED_PAGES.some(x=>x.name==goto))){
            if(ISMOBILE){
                if(PAGE_FUNCTIONALITIES[goto] && PAGE_FUNCTIONALITIES[goto].allowOnMobile === true){} 
                else {
                    goto = "default";
                }
            }
        } else {
            goto = "default";
        }
        PAGE_FUNCTIONALITIES[goto].function(goto);

        $("html, body").animate({ scrollTop: 0 }, "fast");
    },
    DISPLAY:function(){
        var goto = (PAGE_FUNCTIONALITIES[PAGE.GET()]) ? PAGE.GET() : "default";
        $(`.main-content .clearfix`).html(PAGE_FUNCTIONALITIES[goto].display()).css({"height":""});
    },
    SET_TITLE: function(goto){
        goto = (PAGE_FUNCTIONALITIES[goto]) ? goto : "default";
        document.title = `${PAGE_FUNCTIONALITIES[goto].title} | WRU Dispatch`;
    },
    DEFAULT: function(){
        var page = null;
        GRANTED_PAGES.forEach(x => {
            if(x.name == "dispatch_entry" && autorizationLevel.dispatcher() && !USER.dc){

            } else {
                if(x.sub_menu && page == null && PAGE_FUNCTIONALITIES[x.name]) page = x.sub_menu[0];
                else if(page == null && PAGE_FUNCTIONALITIES[x.name]) page = x.name;
            }
        });
        window.history.pushState({}, null, `#${page}`);
        return page;
    },
    GET: function(){
        return window.location.hash.replace("#","") || PAGE.DEFAULT();
    },
    TOOLTIP: function(){
        $('[data-toggle="tooltip"]').tooltip({
            html: "true", 
            container : "body",
            delay: {"show": 50, "hide": 50}
        });
    },
    SET_FUNCTIONALITIES: function(){
        var permission = PERMISSION["dispatch"] || {},
            cnRerportTbl = (CLIENT.type == 2) ? ["refresh","filter","report"] : ["refresh","filter"],
            vehicleBtn = (USER.role == "developer") ? ["edit","view"] : ["edit"],
            notificationsTblBtn = (clientCustom.allowExportTable.notifications) ? ["refresh","filter","export"] : ["refresh","filter"],
            dispatchTblBtn = (ENVIRONMENT == "development") ? ["create","import","refresh","column","export","filter","clone"] : ["create","import","refresh","column","export","filter"];
        
        function getClientTableButtons(key){
            var buttons = clientCustom.tableButtons[key].buttons || [];
            (clientCustom.tableButtons[key].condition||[]).forEach(val => {
                if((val.roles||[]).includes(USER.role)){
                    buttons = buttons.concat(val.additionalButton||[]);
                }
            });
            return buttons;
        }
        function getRowButtons(key){
            var buttons = clientCustom.rowButtons[key].buttons || [];
            (clientCustom.rowButtons[key].condition||[]).forEach(val => {
                if(val.not){
                    if(!(val.roles||[]).includes(USER.role)){
                        (val.removeButtons||[]).forEach(val1 => {
                            var index = buttons.indexOf(val1);
                            if (index !== -1) {
                                buttons.splice(index, 1);
                            }
                        });
                    }
                } else {
                    if((val.roles||[]).includes(USER.role)){
                        buttons = buttons.concat(val.additionalButton||[]);
                    }
                }
            });
            return buttons;
        }

        PAGE_FUNCTIONALITIES = {
            dashboard: {
                title: "Deployment Dashboard",
                title_m: "Dashboard",
                name: "dashboard",
                icon: "la la-chart-line",
                display: function() { return views.dashboard(); },
                function: function() { DASHBOARD.FUNCTION.init() },
                buttons: {
                    table:["column"],
                    row: ["view"]
                },
                allowOnMobile:true
            },
            de_dashboard: {
                title: "Delay Escalation Dashboard",
                name: "de_dashboard",
                icon: "la la-chart-line",
                display: function() { return views.de_dashboard(); },
                function: function() { DE_DASHBOARD.FUNCTION.init() },
                notification: true,
                buttons: {
                    table:["column"]
                },
            },
            dispatch: {
                title: "Dispatch Entries",
                name: "dispatch",
                icon: "la la-table",
                display: function() { return views.dispatch(); },
                function: function() { DISPATCH.FUNCTION.monitoring() },
                buttons: {
                    table: dispatchTblBtn,// dispatchTblBtn,
                    row: getRowButtons("dispatch")  //dispatchRowBtn
                }
            },
            shift_schedule: {
                title: "Shift Schedule",
                name: "shift_schedule",
                icon: "la la-clock",
                display: function() { return views.shift_schedule(); },
                function: function() { SHIFT_SCHEDULE.FUNCTION.init() },
                buttons: {
                    table:["create","refresh"],
                    row:["delete"]
                }
            },
            dispatch_deleted: {
                title: "Dispatch Entries (Deleted)",
                name: "dispatch_deleted",
                icon: "la la-table",
                display: function() { return views.dispatch_deleted(); },
                function: function() { DISPATCH.FUNCTION.monitoring_deleted() },
                buttons: {
                    table: ["refresh","column","export","filter"],// dispatchTblBtn,
                    row: ["view"]  //dispatchRowBtn
                }
            },
            reports: {
                title: "Reports",
                name: "reports",
                icon: "la la-chart-bar",
                display: function() { return views.reports(); },
                function: function() { REPORTS.FUNCTION.init(); },
                buttons: {}
            },
            users: {
                title: "Users",
                name: "users",
                icon: "la la-users",
                display: function() { return views.users(); },
                function: function() { USERS.FUNCTION.init() },
                buttons: {
                    table:["create","refresh"],
                    row:["edit","delete"]
                }
            },
            notifications: {
                title: "Delay Notifications",
                title_m: "Notifications",
                name: "notifications",
                icon: "la la-business-time",
                display: function() { return views.notifications(); },
                function: function() { NOTIFICATIONS.FUNCTION.init() },
                buttons: {
                    table: notificationsTblBtn,
                    row:["comment","delete"]
                },
                allowOnMobile:true
            },
            events_sn: {
                title: "Event Viewer",
                name: "events_sn",
                icon: "la la-calendar-day",
                display: function() { return views.event_viewer(); },
                function: function() { EVENT_VIEWER.FUNCTION.init() },
                buttons: {
                    table: cnRerportTbl,
                    row:["view"]
                }
            },
            vehicles: {
                title: "Vehicles",
                name: "vehicles",
                icon: "la la-truck",
                display: function() { return views.vehicles(); },
                function: function() { VEHICLES.FUNCTION.init() },
                menu_group: {
                    title: "Vehicles",
                },
                buttons: {
                    table: getClientTableButtons("vehicles"),
                    row: vehicleBtn
                }
            },
            vehicle_personnel: {
                title: "Vehicle Personnel",
                name: "vehicle_personnel",
                icon: "la la-users-cog",
                display: function() { return views.vehicle_personnel(); },
                function: function() { VEHICLE_PERSONNEL.FUNCTION.init() },
                buttons: {
                    table: getClientTableButtons("vehicle_personnel"),
                    row: ["edit","edit-rest-days","delete"] // ,"edit-rest-days"
                }
            },
            trailers: {
                title: "Trailers",
                name: "trailers",
                icon: "la la-truck-loading",
                display: function() { return views.trailers(); },
                function: function() { TRAILERS.FUNCTION.init() },
                buttons: {
                    table:["create","refresh","filter"],
                    row: ["edit","delete"]
                }
            },
            regions: {
                title: "Regions",
                name: "regions",
                icon: "la la-map-marked-alt",
                display: function() { return views.regions(); },
                function: function() { LOCATIONS.FUNCTION.regions.init() },
                menu_group: {
                    title: "Locations",
                },
                buttons: {
                    table:["create","refresh","column"],
                    row:["edit","delete"]
                }
            },
            clusters: {
                title: "Clusters",
                name: "clusters",
                icon: "la la-sitemap",
                display: function() { return views.clusters(); },
                function: function() { LOCATIONS.FUNCTION.clusters.init() },
                buttons: {
                    table:["create","refresh","column"],
                    row:["edit","delete"]
                }
            },
            geofences: {
                title: "Sites",
                name: "geofences",
                icon: "la la-warehouse",
                display: function() { return views.geofences(); },
                function: function() { LOCATIONS.FUNCTION.geofences.init() },
                buttons: {
                    table:["refresh","column"],
                    row: ((USER.role == "developer") ? ["edit","delete"] : ["edit"])
                }
            },
            routes: {
                title: "Routes",
                name: "routes",
                icon: "la la-route",
                display: function() { return views.routes(); },
                function: function() { LOCATIONS.FUNCTION.routes.init() },
                buttons: {
                    table:["create","refresh","search"],
                    row:["edit","delete"]
                }
            },
            all_events: {
                title: "All Events",
                name: "all_events",
                icon: "la la-calendar",
                display: function() { return views.all_events(); },
                function: function() { ALL_EVENTS.FUNCTION.init() },
                buttons: {
                    table: ["refresh","filter","search"],
                    row:["view"]
                },
                menu_group: {
                    title: "For Developers",
                }
            },
            changelog: {
                title: "Changelog",
                name: "changelog",
                icon: "la la-tasks",
                display: function() { return views.changelogs(); },
                function: function() { CHANGELOG.FUNCTION.init() },
            },
            profile: {
                title: "Profile",
                name: "profile",
                icon: "la la-user",
                display: function() { return views.profile(); },
                function: function() { PROFILE.FUNCTION.init() },
                allowOnMobile:true
            },
            settings: {
                title: "Settings",
                name: "settings",
                icon: "la la-cog",
                display: function() { return views.settings(); },
                function: function() { SETTINGS.FUNCTION.init() },
                allowOnMobile:true
            },
            logout: {
                title: "Logging out...",
                display: function() { return LOADING.SPINNER.UI(); },
                function: function() { LOGOUT() },
                allowOnMobile:true
            },
            default: {
                title: "Profile",
                display: function() { return views.profile(); },
                function: function(goto) {
                    var new_go_to = (PAGE.EXISTING.includes(goto)) ? PAGE.DEFAULT() : "profile";
                    window.history.pushState({}, null, `#${new_go_to}`)
                    PAGE.GO_TO();
                },
                allowOnMobile:true
            },
        };
    }
};
GET.STATUS = function(status=""){
    var color = "label-default";
    var stat = { color: "label-default", text: "" };
    if(status == "plan") stat = { color: "label-info", text: "Plan" }; // light blue
    if(status == "assigned") stat = { color: "label-brown", text: "Assigned" }; // brown
    if(status == "scheduled") stat = { color: "label-default", text: "Scheduled" }; // default
    if(status == "queueingAtOrigin") stat = { color: "label-warning", text: "Queueing (Origin)" }; // yellow
    if(status == "processingAtOrigin") stat = { color: "label-lime", text: "Processing (Origin)" }; // lime
    if(status == "idlingAtOrigin") stat = { color: "label-purple", text: "Idling (Origin)" }; // purple
    if(status == "in_transit") stat = { color: "label-orange", text: "In Transit" }; // orange
    if(status == "onSite") stat = { color: "label-blue", text: "On-Site" }; // blue
    if(status == "returning") stat = { color: "label-pink", text: "Returning" }; // pink
    if(status == "complete") stat = { color: "label-success", text: "Complete" }; // green
    if(status == "incomplete") stat = { color: "label-danger", text: "Incomplete" }; // red
    if(status == "deleted") stat = { color: "label-default", text: "Deleted" }; // gray
    
    return {
        html:`<span class="label ${stat.color} label-transparent">${stat.text.toUpperCase()}</span>`,
        color: stat.color,
        text: stat.text
    };
};
var FILTER = {
    INITIALIZE: function(el,start,end,format='MM/DD/YYYY'){
        var start_formatted = DATETIME.FORMAT(new Date(start),format),
            end_formatted = DATETIME.FORMAT(new Date(end),format);
        // console.log(start_formatted,end_formatted,format,format.indexOf("h:mm") > -1);
        if(start_formatted == end_formatted){
            if(format.indexOf("h:mm") > -1){
                start_formatted = moment(new Date(start)).startOf('day').format(format);
                end_formatted = moment(new Date(end)).endOf('day').format(format);
                $(el).val(`${start_formatted} - ${end_formatted}`);
            } else {
                $(el).val(start_formatted);
            }
        } else {
            $(el).val(`${start_formatted} - ${end_formatted}`);
        }
        $(el).data('daterangepicker').setStartDate(start_formatted);
        $(el).data('daterangepicker').setEndDate(end_formatted);
    },
    ISEMPTY: function(x){
        var emptyFilter = true;
        x.forEach(val => {
            if(val === false) emptyFilter = false;
        });
        if(emptyFilter === true) $(`#filter-btn,#reset-btn`).addClass("disabled");

        return emptyFilter;
    },
    CHECKING: function(x){
        x.dateEl = x.dateEl || [];
        x.dateElnoVal = x.dateElnoVal || [];
        x.selectEl = x.selectEl || [];
        if($(x.dateEl[0]).length > 0 || $(x.dateElnoVal[0]).length > 0 || $(x.selectEl[0]).length > 0){
            var arr = [];
            x.dateEl.forEach(el => { arr.push($(el).val() == DEFAULT_DATE); });
            x.dateElnoVal.forEach(el => { arr.push($(el).val().isEmpty()); });
            x.selectEl.forEach(el => { arr.push($(el).val() == "all"); });
            if(!x.isPopulate && FILTER.ISEMPTY(arr) === true) {
                $(`#filter-btn,#reset-btn`).addClass("disabled");
                if(FILTER.STATUS != "reset"){
                    $(`#reset-btn`).removeClass("disabled");
                }
            } else {
                $(`#filter-btn`).removeClass("disabled");
            }
        }
    },
    CALLBACK: null,
    DATE: function(__date=DATETIME.FORMAT(new Date(),"MM/DD/YYYY")){
        var _date = new Date(__date),
            dateStart = _date.setHours(0,0,0,0),
            dateEnd = _date.setHours(23,59,59,999);
        return {
            start: new Date(dateStart).toISOString(), 
            end: new Date(dateEnd).toISOString()
        };
    },
    convertTZ: function(date, tzString){
        // convertTZ(_date,"Asia/Manila")
        return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));
    },
    DATERANGE: function(__date=DATETIME.FORMAT(new Date(),"MM/DD/YYYY"),hasTime0,hasTime1){
        var _date = __date.split(" - "),
            _date1 = new Date(_date[0]),
            _date2 = (_date[1]) ? new Date(_date[1]) : new Date(_date[0]);
            
        if(!hasTime0) _date1 = moment(_date1).startOf('day');
        if(!hasTime1) _date2 = moment(_date2).endOf('day');

        if(new Date(_date1).getTime() == new Date(_date2).getTime()){
            _date1 = moment(_date1).startOf('day');
            _date2 = moment(_date2).endOf('day');
        }
        // console.log(_date1,_date2)
        
        return {
            $gte: _date1.toISOString(),
            $lt: _date2.toISOString()
        };
    },
    RESET: function(x){
        $(`#reset-btn`).click(function(){
            FILTER.STATUS = "reset";
            // $(`#filter-btn,#reset-btn`).addClass("disabled");
            if(x.dateEl || x.dateElnoVal){
                $(x.dateEl).data('daterangepicker').setStartDate(DEFAULT_DATE);
                $(x.dateEl).data('daterangepicker').setEndDate(DEFAULT_DATE);
                if(x.dateEl) $(x.dateEl).removeClass('x onX').val(DEFAULT_DATE).change().blur();
                if(x.dateElnoVal) $(x.dateElnoVal).removeClass('x onX').val('').change().blur();
            }
            if(x.selectEl){
                $(x.selectEl).val("all");
            }

            var data = {};
            data[`filter.${x.urlPath}`] = JSON.stringify({});
            USER.filters[x.urlPath] = {};
            GET.AJAX({
                url: `/api/users/${CLIENT.id}/${USER.username}/${USER.username}`,
                method: "PUT",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": SESSION_TOKEN
                },
                data: JSON.stringify(data)
            }, function(docs){
                console.log("docs1",docs);
            });

            if (typeof x.populateTable === 'function') { x.populateTable(); }
        });
    },
    STATUS: "new",
    APPROVAL: {
        dispatch: function(docs=[],dt,rowData){
            var filter = USER.filters.dispatch || {};

            try {
                filter = JSON.parse(filter);
            } catch(error){}

            console.log(filter);
            // departure_date
            // posting_date
            // status
            // region - NONE YET
            // cluster - NONE YET
            var rows = [];
            docs.forEach(val => {
                var approved = true;
                if(filter.departure_date){
                    if(val.departure_date){
                        var gte = new Date(filter.departure_date.$gte).getTime();
                        var lt = new Date(filter.departure_date.$lt).getTime();
                        var date = new Date(val.departure_date).getTime();
                        // gte: march 01
                        // lt:  march 25
                        // date: march 15
                        // gte <= date && date < lt
                        if(gte <= date && date < lt){} 
                        else {
                            approved = false;
                        }
                    } else {
                        approved = false;
                    }
                }
                if(filter.posting_date){
                    if(val.posting_date){
                        var gte = new Date(filter.posting_date.$gte).getTime();
                        var lt = new Date(filter.posting_date.$lt).getTime();
                        var date = new Date(val.posting_date).getTime();
                        if(gte <= date && date < lt){} 
                        else {
                            approved = false;
                        }
                    } else {
                        approved = false;
                    }
                }
                if(filter.scheduled_date){
                    if(val.scheduled_date){
                        var gte = new Date(filter.scheduled_date.$gte).getTime();
                        var lt = new Date(filter.scheduled_date.$lt).getTime();
                        var date = new Date(val.scheduled_date).getTime();
                        if(gte <= date && date < lt){} 
                        else {
                            approved = false;
                        }
                    } else {
                        approved = false;
                    }
                }
                if(filter.status){
                    if(filter.status == val.status){}
                    else {
                        approved = false;
                    }
                }
                
                if(approved){
                    if(filter.$or){
                        approved = false;
                        filter.$or.forEach(_f => {
                            if(_f.posting_date){
                                if(val.posting_date){
                                    var gte = new Date(_f.posting_date.$gte).getTime();
                                    var lt = new Date(_f.posting_date.$lt).getTime();
                                    var date = new Date(val.posting_date).getTime();
                                    if(gte <= date && date < lt){
                                        approved = true;
                                    }
                                }
                            }
                            if(_f.scheduled_date){
                                if(val.scheduled_date){
                                    var gte = new Date(_f.scheduled_date.$gte).getTime();
                                    var lt = new Date(_f.scheduled_date.$lt).getTime();
                                    var date = new Date(val.scheduled_date).getTime();
                                    if(gte <= date && date < lt){
                                        approved = true;
                                    }
                                }
                            }
                            if(_f.status){
                                if(_f.status == val.status){
                                    approved = true;
                                }
                            }
                            if(_f.$and){
                                _f.$and.forEach(_f2 => {
                                    console.log("HIIII",_f2)
                                    if(_f2.scheduled_date){
                                        if(val.scheduled_date){
                                            var gte = new Date(_f2.scheduled_date.$gte).getTime();
                                            var lt = new Date(_f2.scheduled_date.$lt).getTime();
                                            var date = new Date(val.scheduled_date).getTime();
                                            if(gte <= date && date < lt){
                                                approved = true;
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
                
                if(approved){
                    rows.push(rowData(val));
                }
            });
            dt.rows.add(rows).draw(false);
        }
    }
};
var SLIDER = {
    FILTER: function(filterOptionsHTML){
        return `<div id="filter-container" class="slider-container" style="display:none;">
                    <h5 class="pl-3">Filter<i id="slider-close" class="la la-times" style="float: right;font-size: 13px;line-height: 20px;padding: 0px 8px;cursor: pointer;"></i></h5>
                    <div class="p-3" style="border-top: 1px solid #eee;">
                        ${filterOptionsHTML}
                        <button id="filter-btn" style="width: 100%;" class="btn btn-success mt-3">Apply</button>
                        <a href="javascript:void(0)" id="reset-btn" style="font-size: 11px;width: max-content;margin: auto;" class="text-success p-2 d-block">Reset filters</a>
                    </div>
                </div>`;
    },
    CLONE: function(cloneOptionsHTML){
        return `<div id="clone-container" class="slider-container" style="display:none;">
                    <h5 class="pl-3">Clone Live Data<i id="slider-close" class="la la-times" style="float: right;font-size: 13px;line-height: 20px;padding: 0px 8px;cursor: pointer;"></i></h5>
                    <div class="p-3" style="border-top: 1px solid #eee;">
                        ${cloneOptionsHTML}
                        <button id="clone-btn" style="width: 100%;" class="btn btn-success mt-3">Apply</button>
                    </div>
                </div>`;
    },
    COLUMN_VISIBILITY: function(x){
        var checkbox = "";
        x.forEach((val,i) => {
            var fancyClass = (val.disabled)?"":"custom-bgcolor-green",
                pointerEvent = (val.disabled)?`style="pointer-events: none;"`:"",
                visible = (val.visible)?"checked":"";
            if(!val.hiddenInCustomVisibilityOptions) {
                checkbox += `<div class="fancy-checkbox ${fancyClass}" ${pointerEvent}>
                                <label>
                                    <input type="checkbox" ${visible}>
                                    <span class="toggle-vis" data-column="${i}">${val.title}</span>
                                </label>
                            </div>`;
            }
        });
        return `<div id="cv-container" class="slider-container" style="display:none;">
                    <h5 class="pl-3">Customize Display Options<i id="slider-close" class="la la-times" style="float: right;font-size: 13px;line-height: 20px;padding: 0px 8px;cursor: pointer;"></i></h5>
                    <div class="p-3" style="border-top: 1px solid #eee;">
                    ${checkbox}
                    </div>
                </div>`;
    },
    EXPORT: function(){
        return `<div id="export-container" class="slider-container" style="display:none;">
                    <h5 class="pl-3">Export Options<i id="slider-close" class="la la-times" style="float: right;font-size: 13px;line-height: 20px;padding: 0px 8px;cursor: pointer;"></i></h5>
                    <div class="p-3" style="border-top: 1px solid #eee;"></div>
                </div>`;
    },
    REPORT: function(){
        return `<div id="report-container" class="slider-container" style="display:none;">
                    <h5 class="pl-3">Generate Report<i id="slider-close" class="la la-times" style="float: right;font-size: 13px;line-height: 20px;padding: 0px 8px;cursor: pointer;"></i></h5>
                    <div class="p-3" style="border-top: 1px solid #eee;">
                        <div>
                            <div style="font-size: 10px;">Date:</div>
                            <input type="text" id="_rdate" class="clearable form-control" style="padding-left: 10px;" value="${DEFAULT_DATE}" readonly>
                        </div>
                        <button id="report-btn" style="width: 100%;" class="btn btn-success mt-3">Apply</button>
                        <div id="mreport-container" class="mt-3" style="display:none;">
                            <div class="mt-3 mb-1 font-bold">Generate Report for <span id="mreport-date">October 30, 2020</span>:</div>
                            <div mreport="todr-05-12" class="custom-btn-01 col-sm-12 pt-2 pb-2 pr-3 pl-3 disabled">
                                <span class="float-right pt-1 pl-3 "><i class="la la-download"></i></span>
                                <span>Trucks Outside DC Report<br>(Prev) 05:01:00 PM - 12:00:59 AM</span>
                            </div>
                            <div mreport="todr-07-09" class="custom-btn-01 col-sm-12 pt-2 pb-2 pr-3 pl-3 mt-1 disabled">
                                <span class="float-right pt-1 pl-3 "><i class="la la-download"></i></span>
                                <span>Trucks Outside DC Report<br>07:01:00 AM - 09:00:59 AM</span>
                            </div>
                            <div mreport="todr-09-12" class="custom-btn-01 col-sm-12 pt-2 pb-2 pr-3 pl-3 mt-1 disabled">
                                <span class="float-right pt-1 pl-3 "><i class="la la-download"></i></span>
                                <span>Trucks Outside DC Report<br>09:01:00 AM - 12:00:59 PM</span>
                            </div>
                            <div mreport="todr-12-03" class="custom-btn-01 col-sm-12 pt-2 pb-2 pr-3 pl-3 mt-1 disabled">
                                <span class="float-right pt-1 pl-3 "><i class="la la-download"></i></span>
                                <span>Trucks Outside DC Report<br>12:01:00 PM - 03:00:59 PM</span>
                            </div>
                            <div mreport="todr-03-05" class="custom-btn-01 col-sm-12 pt-2 pb-2 pr-3 pl-3 mt-1 disabled">
                                <span class="float-right pt-1 pl-3 "><i class="la la-download"></i></span>
                                <span>Trucks Outside DC Report<br>03:01:00 PM - 05:00:59 PM</span>
                            </div>
                            <div style="font-size: 9px;font-weight: 100;" class="col-sm-12 text-muted mt-2 p-0">
                                Please click 'Yes' when a pop-up appears saying "The file format and extension of 'FILENAME.xls' don't match. The file could be corrupted or unsafe. Unless you trust its source, don't open it. Do you want to open it anyway?".
                            </div>
                        </div>
                    </div>
                </div>`;
    },
};
var MODAL = {
    CONFIRMATION: function(data){
        var content = data.content || `Are you sure you want to delete this entry?`;
        var confirmBGStyle = data.confirmBGStyle || ``;
        var _modal = `<div class="cd-popup" id="confirm-modal">
                        <div class="cd-popup-container">
                            <p class="mb-0">${content}</p>
                            <ul class="cd-buttons">
                                <li><a style="${confirmBGStyle}" confirm>${data.confirmButtonText || "Yes"}</a></li>
                                <li><a cancel>No</a></li>
                            </ul>
                            <a close class="cd-popup-close img-replace"></a>
                        </div>
                    </div>`;
                    
        $(`body`).append(_modal);

        $(`#confirm-modal [confirm]`).click(function(){
            $(`#confirm-modal [confirm]`).html(`<i class="la la-spinner la-spin mr-2"></i>${data.confirmButtonText || "Yes"}`).addClass("disabled");
            if (typeof data.confirmCallback === 'function') { data.confirmCallback(); }
            if (data.confirmCloseCondition !== true) { $(`#confirm-modal`).remove(); }
        });
        $(`#confirm-modal [cancel],#confirm-modal [close]`).click(function(){
            if (typeof data.cancelCallback === 'function') { data.cancelCallback(); }
            $(`#confirm-modal`).remove();
        });          
    },
    CONFIRMATION_W_FIELD: function(data){
        var content = data.content || `Are you sure you want to delete this entry?`;
        var confirmBGStyle = data.confirmBGStyle || ``;
        var _modal = `<div class="cd-popup" id="confirm-modal">
                        <div class="cd-popup-container">
                            <div class="pt-5 pb-4">${content}</div>
                            <div class="col-sm-12 mb-3">
                                <textarea class="form-control" id="modal-field"></textarea>
                            </div>
                            <ul class="cd-buttons">
                                <li><a style="${confirmBGStyle}" confirm>${data.confirmButtonText || "Yes"}</a></li>
                                <li><a cancel>${data.cancelButtonText || "No"}</a></li>
                            </ul>
                            <a close class="cd-popup-close img-replace"></a>
                        </div>
                    </div>`;
        $(`body`).append(_modal);
        $(`#confirm-modal [confirm]`).click(function(){
            var field_val = $(`#modal-field`).val();

            if(field_val.isEmpty()){} 
            else {
                $(`#confirm-modal [confirm]`).html(`<i class="la la-spinner la-spin mr-2"></i>${data.confirmButtonText || "Yes"}`).addClass("disabled");
                if (typeof data.confirmCallback === 'function') { data.confirmCallback($(`#modal-field`).val()); }
                if (data.confirmCloseCondition !== true) { $(`#confirm-modal`).remove(); }
            }
        });
        $(`#confirm-modal [cancel],#confirm-modal [close]`).click(function(){
            if (typeof data.cancelCallback === 'function') { data.cancelCallback(); }
            $(`#confirm-modal`).remove();
        });          
    },
    MINI_MONITOR: function(x){
        var container = `<div class="col-sm-12 mt-2" style="height: 100%;overflow: auto;">
                            <div class="table-wrapper">
                                <table id="tbl-mini-monitor" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>`;
        if(ISMOBILE) {
            container = `<div id="mini-monitor-container" class="col-sm-12 p-0" style="max-height: 100%;overflow: auto;"></div>`;
        }
        return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                    <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                        <div role="document" class="modal-dialog" style="width: 100%;margin: 0;height: 100%;">
                            <div class="modal-content" style="height: 100%;">
                                <div class="modal-header pb-2">
                                    <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                    <h4 class="modal-title" id="myModalLabel2">${x.title}</h4>
                                </div>
                                <div class="modal-body row pt-2" style="height: calc(100% - 70px);">${container}</div>
                            </div>
                        </div>
                    </div>
                </div>`;
    },
    CREATE: {
        EMPTY: function( title="Modal", html="", modalSize="lg" ){
            return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                        <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                            <div role="document" class="modal-dialog modal-${modalSize}" style="margin:20px auto;">
                                <div class="modal-content">
                                    <div class="modal-header pb-2">
                                        <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                        <h4 class="modal-title" id="myModalLabel2">${title}</h4>
                                    </div>
                                    <div class="modal-body row pl-4 pr-4 pt-2">
                                        ${html}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        },
        BASIC: function(x){
            var inputs = "";

            x.el.forEach(val => {
                var _reqHtml = (val.required) ? `<span class="text-danger">*</span>` : "",
                    required = (val.required) ? `required` : "",
                    attr = val.attr || "",
                    readonly = (val.readonly) ? `readonly` : "",
                    disabled = (val.disabled) ? `disabled="disabled"` : "",
                    notInclude = (val.notInclude) ? `time=true` : "",
                    type = val.type||"text",
                    multiple = val.multiple || false,
                    value = val.value||"",
                    sub_title = (val.sub_title) ? `<small class="text-muted mb-1 d-block">${val.sub_title}</small>` : "",
                    placeholder = val.placeholder || "";
                if(type == "select"){
                    val.value = val.value || [];

                    var options = (val.noDefault) ? "" : `<option value="" disabled selected>Select ${val.title}</option>`;
                    val.options.forEach(op => {
                        var selected = (value.includes(op.id)) ? "selected" : "";
                        options += `<option value="${op.id}" ${selected}>${op.value || op.id}</option>`;
                    });
                    inputs += `<div class="col-sm-12">
                                    <small>${_reqHtml}${val.title}:</small>
                                    <select id="${val.id}" class="form-control" ${attr} ${required} ${readonly} ${disabled}>${options}</select>
                                </div>`;
                } else if(type == "select2"){
                    var options = ``,
                        selectClass = (multiple === true) ? "select-multiple-basic" : "select-basic",
                        selectAttr = (multiple === true) ? `multiple="multiple"` : "";
                    val.value = val.value || [];
                    val.options = val.options || [];
                    val.options.forEach(op => {
                        var selected = (val.value.includes(op.id)) ? "selected" : "";
                        options += `<option value="${op.id}" ${selected}>${op.value || op.id}</option>`;
                    });
                    inputs += `<div class="col-sm-12">
                                    <small>${_reqHtml}${val.title}:</small>
                                    <select id="${val.id}" class="${selectClass}" ${selectAttr} style="width: 100%;" ${attr} ${required} ${disabled}>${options}</select>
                                    ${sub_title}
                                </div>`;
                } else if(type == "time") {
                    var hh_mm = DATETIME.HH_MM(null,val.value);
                    inputs += `<div class="col-sm-12 mb-4">
                                    <small>${_reqHtml}${val.title}:</small>
                                    <div class="form-control">
                                        <input id="${val.id}-hh" time=true type="number" class="wo_arrow" step="any" min="0" value="${hh_mm.hour}" style="border:none;width: 48%;text-align: center;background: transparent;" placeholder="HH">:<input type="number" id="${val.id}-mm" class="wo_arrow" time=true step="any" min="0" value="${hh_mm.minute}" style="border:none;width: 48%;text-align: center;background: transparent;" placeholder="MM">
                                        <input id="${val.id}" type="number" value="${val.value}" class="hidden">
                                    </div>
                                </div>`;
                } else if(type == "textarea") {
                    inputs += `<div class="col-sm-12">
                                    <small>${_reqHtml}${val.title}:</small>
                                    <textarea id="${val.id}" class="form-control" ${attr} ${notInclude} ${required} ${readonly} ${disabled}></textarea>
                                </div>`;
                } else {
                    inputs += `<div class="col-sm-12">
                                    <small>${_reqHtml}${val.title}:</small>
                                    <input id="${val.id}" type="${type}" ${attr} class="form-control" placeholder="${placeholder}" value="${value}" autocomplete="off" ${required} ${readonly}>
                                    ${sub_title}
                                </div>`;
                }
            });

            var content = inputs;
            if(x.columned){
                content = `<div class="${x.column1Style||"col-sm-6"}">${inputs}</div>
                            <div class="${x.column2Style||"col-sm-6"}">${x.column2Content}</div>`;
            }
            return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                        <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                            <div role="document" class="modal-dialog modal-sm" style="${x.modalStyle||""}">
                                <div class="modal-content">
                                    <div class="modal-header pb-2">
                                        <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                        <h4 class="modal-title" id="myModalLabel2">${x.title}</h4>
                                    </div>
                                    <div class="modal-body row pt-2">
                                        <div id="modal-error"></div>
                                        ${content}
                                        <div class="col-sm-12"> 
                                            <button id="submit" type="button" class="btn btn-primary col-sm-12 mt-4">Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        },
    },
    SUBMIT: function(x,options,additionalValues){
        $(`#submit`).click(function(){
            $(`#modal-error`).hide();
            var body = {},
                css_default = {"background-color":"white"},
                css_error = {"background-color":"#ffe4e4"},
                completeFields = true;
            $(`#modal :input[type="text"],#modal :input[type="number"],#modal :input[type="email"],#modal select`).each((i,el) => {
                var defaultValue = ($(el).is("select")) ? [] : ($.isNumeric(($(el).val())) ? 0 : "");
                
                if($(el).attr("doNotSave") == null){
                    if($(el).attr("blankStringIfEmpty") != null){
                        defaultValue = "";
                    }
                    var _el = {
                        id: $(el).attr("id"),
                        value: $(el).val() || defaultValue,
                        valueTemp: $(el).val() || defaultValue,
                        time: $(el).attr("time"),
                        required: $(el).attr("required"),
                    };
                    if(_el.id){
                        if(_el.id == "phoneNumber"){
                            _el.value = GET.INTLTELINPUT_VALUE("#phoneNumber");
                        }
                        if(!_el.time) {
                            // if time-true, ignore
                            body[_el.id] = _el.value;
                        }
                    } else {
                        var id = $(el).parents("table").attr("id");
                        _el.id = id;
                        if(!body[_el.id]){
                            var trs = $(el).parents("table").find("tr");
                            trs.each((i1,el1) => {
                                var inputs = $(el1).find("input");
                                var _tdData = {};
                                inputs.each((i2,el2) => {
                                    var attr = $(el2).attr("_attr");
                                    if(attr.substring(0, 3) != "___"){
                                        _tdData[attr] = $(el2).val() || "";
                                    }
                                });
                                if(!body[_el.id]){
                                    body[_el.id] = [];
                                }
                                if(Object.keys(_tdData).length > 0){
                                    body[_el.id].push(_tdData);
                                }
                            });
                        }
                    }
                    if(_el.required && _el.valueTemp.isEmpty()) {
                        $(el).css(css_error);
                        $(el).next(".select2-container").find(".select2-selection").css(css_error);
                        completeFields = false;
                    } else {
                        $(el).css(css_default);
                        $(el).next(".select2-container").find(".select2-selection").css(css_default);
                    }
                }
            });
            
            if (typeof additionalValues === 'function') { 
                console.log("additionalValues()",additionalValues())
                body = $.extend(body,additionalValues());
            }
            if(!completeFields) {
                ALERT.REQUIREDFIELDS(`#modal-error`);
            } else {
                $(`#submit`).html(`<i class="la la-spinner la-spin mr-2"></i>Submit`).attr("disabled",true);
                (x.method == "PUT") ? delete body._id : null;
                if(options){
                    if(x.method == "POST" && options.method == "POST"){
                        GET.AJAX({
                            url: `${options.url}${$(`#${options.id}`).val()}`,
                            method: "GET",
                            headers: {
                                "Authorization": SESSION_TOKEN
                            },
                        }, function(docs){
                            if(docs.length > 0){
                                MODAL.CONFIRMATION({
                                    content: `A geofence with short name "${$(`#${options.id}`).val()}" already exists. This will overwrite the existing geofence. Do you want to continue?`,
                                    confirmCloseCondition: true,
                                    confirmBGStyle: "background-color:#64b03a;",
                                    confirmCallback: function(){
                                        proceedSubmit();
                                        $(`#confirm-modal,#overlay`).remove(); 
                                    },
                                    cancelCallback: function(){
                                        $(`#modal #submit`).html(`Submit`).attr("disabled",false);
                                    }
                                });
                            } else {
                                proceedSubmit();
                            }
                        });
                    } else if(options.ggsURL){
                        var ggsFunction = function(tries){
                                if(options.object && options.object.length > 0){
                                    var new_object = [];
                                    (options.object||[]).forEach(val => {
                                        new_object.push({name: val.name, value:$(val.el).val()||" "});
                                        if(val.name == "Trailer" && $(val.el).val()){
                                            var trailer = getTrailer($(val.el).val());
                                            if(trailer){
                                                new_object.push({name:"Pal Cap", value:trailer.pal_cap});
                                                new_object.push({name:"Region", value:trailer.region});
                                                new_object.push({name:"Cluster", value:trailer.cluster});
                                                new_object.push({name:"Site", value:trailer.site});
                                            }
                                        }
                                    });
                                    console.log("new_object",new_object);
                                    console.log("body",body);
                                    
                                    GET.AJAX({
                                        "url": options.ggsURL,
                                        "method": "PUT",
                                        "headers": {
                                            // "Content-Type": "application/json",
                                            "Authorization": USER.apiKey
                                        },
                                        "data": JSON.stringify(new_object),
                                    }, function(response){
                                        proceedSubmit();
                                    }, function(error){
                                        if(error.status == 0 && tries < MAX_TRIES){
                                            tries++;
                                            ggsFunction(tries);
                                        } else {
                                            proceedSubmit();
                                        }
                                        TOASTR.ERROR(error);
                                    });
                                } else {
                                    proceedSubmit();
                                }
                            };
                        ggsFunction(0);
                    } else {
                        proceedSubmit();
                    }
                } else {
                    proceedSubmit();
                }
                function proceedSubmit(){
                    GET.AJAX({
                        url: x.url,
                        method: x.method,
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                            "Authorization": SESSION_TOKEN
                        },
                        data: JSON.stringify(body)
                    }, function(docs){
                        if(docs.ok == 1){
                            $(`#overlay`).remove();
                            (x.method == "PUT") ? TOASTR.UPDATEDSUCCESSFULLY() : TOASTR.CREATEDSUCCESSFULLY();
                        } else {

                            toastr.error(`${docs.error.message}</br></br>Error Code - ec014/01`);
                            $(`#submit`).html(`Submit`).attr("disabled",false);
                        }
                    }, function(error) {
                        console.log(error);
                        if(error.status == 409){
                            toastr.error(`Record already exists.</br></br>Error Code - ec014/01`);
                        } else {
                            toastr.error(`${error.responseJSON.error.message}</br></br>Error Code - ec014/01`);
                        }
                        $(`#submit`).html(`Submit`).attr("disabled",false);
                    });
                }
            }
        });
    },
};
var TABLE = {
    BUTTONS: function(x){
        var goto = x.goto,
            pageButtons = PAGE_FUNCTIONALITIES[goto].buttons.table || [],
            dt_buttons = x.dt_buttons || [],
            loadView = x.loadView || [],
            dispatcherCondition = true,//(autorizationLevel.dispatcher()) ? ((!USER.dc)?false:true) : true,
            actions = x.actions || {};
        
        pageButtons.forEach(val => {
            var className = (dt_buttons.length == 0) ? "ml-1" : "";
            var condClass =(dispatcherCondition == null || dispatcherCondition == true) ? "" : "dispatcherCondition";
            className += (loadView.includes(val)) ? " disabled" : "";
            if(PERMISSION[goto].create && PERMISSION[goto].create != "none"){
                // if(val == "create"){
                //     var icon = (loadView.includes(val)) ? "la-spin la-spinner" : "la-plus";
                //     dt_buttons.push({
                //         text: `<i class="la ${icon}" data-toggle="tooltip" title="Create New Record"></i> Create`,
                //         className: `create-btn ${className} ${condClass}`,
                //         action: function ( e, dt, node, config ) {
                //             if (typeof actions[val] === 'function') { actions[val](); }
                //         },
                //     });
                // }
                if(val == "create"){ // create-admin
                    var icon = (loadView.includes(val)) ? "la-spin la-spinner" : "la-plus";
                    var title = (CLIENT.id != "wilcon") ? "Create New Record (v2.0)" : "Create New Record";
                    var text = (CLIENT.id != "wilcon") ? "Create v2.0" : "Create";
                    dt_buttons.push({
                        text: `<i class="la ${icon}" data-toggle="tooltip" title="${title}"></i> ${text}`,
                        className: `create-btn ${className} ${condClass}`,
                        action: function ( e, dt, node, config ) {
                            if (typeof actions[val] === 'function') { actions[val](); }
                        },
                    });
                }
                if(val == "import"){
                    var icon = (loadView.includes(val)) ? "la-spin la-spinner" : "la-file-upload";
                    dt_buttons.push({
                        text: `<i class="la ${icon}" data-toggle="tooltip" title="Import Batch File"></i> Import`,
                        className: `import-btn ${className} ${condClass}`,
                        action: function ( e, dt, node, config ) {
                            if (typeof actions[val] === 'function') { actions[val](); }
                        },
                    });
                }
            }
            if(val == "refresh"){
                dt_buttons.push({
                    text: '<i class="la la-refresh" data-toggle="tooltip" title="Refresh Table"></i>',
                    className,
                    action: function ( e, dt, node, config ) {
                        if (typeof actions[val] === 'function') { actions[val](); }
                    }
                });
            }
            if(val == "filter"){
                dt_buttons.push({
                    text: '<i class="la la-filter" data-toggle="tooltip" title="Filter"></i>',
                    className,
                    action: function ( e, dt, node, config ) {
                        if (typeof actions[val] === 'function') { actions[val](); }
                    }
                });
            }
            if(val == "export"){
                dt_buttons.push({
                    text: '<i class="la la-file-export" data-toggle="tooltip" title="Export Options"></i>',
                    className,
                    action: function ( e, dt, node, config ) {
                        if (typeof actions[val] === 'function') { actions[val](); }
                    }
                });
            }
            if(val == "report"){
                dt_buttons.push({
                    text: '<i class="la la-download" data-toggle="tooltip" title="Generate Report"></i>',
                    className,
                    action: function ( e, dt, node, config ) {
                        if (typeof actions[val] === 'function') { actions[val](); }
                    }
                });
            }
            if(val == "column"){
                dt_buttons.push({
                    text: '<i class="la la-columns" data-toggle="tooltip" title="Customize Display Options"></i>',
                    className,
                    action: function ( e, dt, node, config ) {
                        if (typeof actions[val] === 'function') { actions[val](); }
                    },
                });
            }
            if(val == "search"){
                dt_buttons.push({
                    text: '<i class="la la-search" data-toggle="tooltip" title="Search Table"></i>',
                    className,
                    action: function ( e, dt, node, config ) {
                        if (typeof actions[val] === 'function') { actions[val](); }
                    },
                });
            }
            if(val == "eye"){
                dt_buttons.push({
                    text: '<i class="la la-eye" data-toggle="tooltip" title="Hide/Show All In Transit Entries (Including from previous dates)"></i>',
                    className,
                    action: function ( e, dt, node, config ) {
                        if (typeof actions[val] === 'function') { actions[val](); }
                    },
                });
            }
            if(val == "clone"){
                dt_buttons.push({
                    text: '<i class="la la-copy" data-toggle="tooltip" title="Clone Live Data"></i>',
                    className,
                    action: function ( e, dt, node, config ) {
                        if (typeof actions[val] === 'function') { actions[val](); }
                    },
                });
            }
        });
        return dt_buttons;
    },
    POPULATE: function(x){
        $(`.dt-button .la-refresh`).addClass("la-spin disabled");
        $(`.dt-button .la-refresh`).parents(".dt-button").addClass("disabled");
        $(`.cb-container .la-refresh`).addClass("la-spin disabled");
        
        $(`#filter-container input,#filter-container select`).attr("disabled",true);
        $(`#filter-container button,#filter-container a`).addClass("disabled");

        x.filter = x.filter || {};
        x.dataTableOptions = $.extend(x.dataTableOptions,{
            language: { search: '', searchPlaceholder: "Search", sLengthMenu: "_MENU_" },
        });
        if (ISMOBILE) {
            x.dataTableOptions = $.extend(x.dataTableOptions,{responsive: true});
        }
        x.dataTableOptions = $.extend(x.dataTableOptions,{responsive: true});

        var _dt = null,
            skip = 0,
            table_id = x.table_id,
            paginationLoad = function(length){
                if(length == null || length == LIMIT){
                    var urlExtend = (x.withFilter)?`/${JSON.stringify(x.filter)}`:``;
                    urlExtend += (x.withPagination)?`/${skip}/${LIMIT}`:``;

                    GET.AJAX({
                        url: `/api/${x.url}${urlExtend}`,
                        method: "GET",
                        headers: {
                            "Authorization": SESSION_TOKEN
                        },
                    }, function(docs){
                        console.log(`${x.commentTitle}:`,docs);
                        if(!docs.error){
                            if (typeof FILTER.CALLBACK === 'function') { FILTER.CALLBACK(true); }
                            $(`#filter-btn`).html("Apply").removeClass("disabled");
                            
                            $(`.dt-button .la-refresh`).removeClass("la-spin");
                            $(`.dt-button .la-refresh`).parents(".dt-button").removeClass("disabled");
                            if(FILTER.STATUS == "reset") $(`.cb-container .la-refresh`).removeClass("la-spin");
                            else $(`.cb-container .la-refresh`).removeClass("la-spin disabled");

                            
                            $(`#filter-container input,#filter-container select`).attr("disabled",false);
                            $(`#filter-container button,#filter-container a`).removeClass("disabled");
                            
                            length = docs.length;

                            if(x.newlyLoaded === true){
                                x.newlyLoaded = false;

                                if([x.goto].includes(PAGE.GET())){
                                    PAGE.DISPLAY();
                                    initDT();
                                    
                                    // always put end of datatable
                                    if (typeof x.initializeCallback === 'function') { x.initializeCallback(docs,_dt); }
                                }
                            } 

                            if(docs.error){
                                toastr.error(docs.error.message);
                            } else {
                                docs.forEach(val => {
                                    var index = LIST[x.urlPath].findIndex(x => x._id.toString() == val._id.toString());
                                    if(index > -1){} 
                                    else {
                                        val._row = GENERATE.RANDOM(36);
                                        LIST[x.urlPath].push(val);
                                    }
                                });

                                skip += length;
                                if([x.goto].includes(PAGE.GET())){
                                    if (typeof x.populateCallback === 'function') { x.populateCallback(docs); }
                                    ($(table_id).length > 0) ? paginationLoad(length) : null;
                                }
                            }
                            // TABLE.FINISH_LOADING.START_CHECK();
                        }
                    });
                } else {
                    $(`#progress-striped-active .progress-bar`).css("width",`0%`).html(`0%`);
                    $("div.tbl-progress-bar").hide();
                    if(x.newlyLoaded === true){
                        x.newlyLoaded = false;
                        if([x.goto].includes(PAGE.GET())){
                            PAGE.DISPLAY();
                            initDT();
                            
                            // always put end of datatable
                            if (typeof x.initializeCallback === 'function') { x.initializeCallback(null,_dt); }
                        }
                    }
                }
        }

        if(x.noData === true){
            PAGE.DISPLAY();
            initDT();
            if (typeof x.initializeCallback === 'function') { x.initializeCallback(null,_dt); }
            if (typeof x.noDataFunction === 'function') { x.noDataFunction(); }
            TABLE.FINISH_LOADING.START_CHECK();
        } else {
            paginationLoad();
        }

        function initDT(){
            if ($.fn.DataTable.isDataTable(table_id) ) {
                $(table_id).DataTable().clear().destroy();
            }
            _dt = $(table_id).DataTable(x.dataTableOptions);

            if(ISMOBILE){
                $(`.dt-buttons`).addClass("d-inline-block");
                $(`.dataTables_wrapper`).css("text-align","center");
                $(`.table.dataTable`).css("text-align","unset");
            }

            $(table_id).on('page.dt length.dt draw.dt order.dt', function () {
                PAGE.TOOLTIP();
                TABLE.FINISH_LOADING.START_CHECK();

                $(`${table_id} thead tr th`).each((i,el) => {
                    if(!$(el).is(":visible")){
                        $(`${table_id} tr:not(.child)`).each((i1,el1) => {
                            $(el1).find("td").eq(i).hide();
                        });
                    }
                });
            });
            
            $(`.dt-button [data-toggle="tooltip"]`).each((i,el) => {
                var title = $(el).attr("data-original-title") || $(el).attr("title");
                $(el).parents(".dt-button").attr({"data-toggle":"tooltip","data-original-title":title});
                $(el).removeAttr("data-toggle data-original-title");
            });
            PAGE.TOOLTIP();

            if(x.perColumnSearch){
                $(table_id).find('thead').append('<tr class="row-filter"><th></th><th></th><th></th><th></th><th></th></tr>');
                $(table_id).find('thead .row-filter th:not(:last-child)').each(function() {
                    $(this).html('<input type="text" class="form-control input-sm" placeholder="Search...">');
                });
                $(table_id).find('.row-filter input').on('keyup change', function() {
                    _dt.column($(this).parent().index() + ':visible')
                        .search(this.value)
                        .draw();
                });
            }
        }
    },
    ROW_LISTENER: function(x){
        var table_id = x.table_id,
            _row = x._row,
            _id = x._id,
            urlPath = x.urlPath,
            deleteURL = x.deleteURL || `/api/${urlPath}/${CLIENT.id}/${USER.username}/${_id}`,
            editCallback = x.editCallback || function(){
                var obj = LIST[urlPath].find(y => y._id.toString() == _id.toString());
                x.initializeModal({
                    url: `/api/${urlPath}/${CLIENT.id}/${USER.username}/${_id}`,
                    method: "PUT",
                    obj
                });
            };
        $(table_id).on('click', `[_row="${_row}"] [edit],[_row="${_row}"] + tr.child [edit]`,function(e){
            e.stopImmediatePropagation();
            editCallback();
        });
        $(table_id).on('click', `[_row="${_row}"] [delete],[_row="${_row}"] + tr.child [delete]`,function(e){
            e.stopImmediatePropagation();
            MODAL.CONFIRMATION({
                confirmCloseCondition: true,
                content: x.deleteModalContent,
                confirmCallback: function(){
                    $.ajax({ 
                        url: deleteURL, 
                        method: "DELETE", 
                        timeout: 90000 ,
                        headers: {
                            "Authorization": SESSION_TOKEN
                        },
                        async: true
                    }).done(function (docs) {
                        // console.log("docs2222",docs)
                        if(docs.ok == 1){
                            $(`#confirm-modal`).remove();
                            $(table_id).DataTable().row(`[_row="${_row}"]`).remove().draw(false);
                            TOASTR.DELETEDSUCCESSFULLY();
                        } else {
                            TOASTR.ERROR(docs);
                        }
                    }).fail(function(error){
                        TOASTR.ERROR(error);
                    });
                }
            });
        });
        if (typeof x.additionalListeners === 'function') { x.additionalListeners(); }
    },
    ROW_BUTTONS: function(goto,options={}){
        options = options || {};
        var status = options.status,
            attrs = options.attrs || "",
            readonlyArr = options.readonlyArr || [],
            disabledArr = options.disabledArr || [],
            adminArr = options.adminArr || [],
            loadView = options.loadView || [],
            customButtons = options.customButtons,
            dispatcherCondition = (autorizationLevel.dispatcher()) ? ((!USER.dc)?false:true) : true,
            username = options.username,
            deleteArr = options.deleteArr || [];
        var condClass =(dispatcherCondition == null || dispatcherCondition == true) ? "" : "dispatcherCondition";
            
        var pageButtons = PAGE_FUNCTIONALITIES[goto].buttons || {},
            permission = PERMISSION[goto] || {},
            grantedActions = pageButtons.row || [],
            count = 0,
            buttonDetails = {
                add: {
                    permission: "update",
                    icon: "la-plus",
                    title: "Add Record",
                    attr: "add"
                },
                view: {
                    permission: "read",
                    icon: "la-search-plus",
                    title: "View Record",
                    attr: "view"
                },
                edit: {
                    permission: "update",
                    icon: "la-pencil",
                    title: "Edit Record",
                    attr: "edit",
                    statusCheck: true,
                },
                "edit-admin": {
                    permission: "update",
                    icon: "la-pencil",
                    title: "Edit Record (v2.0)",
                    attr: "edit-admin",
                    statusCheck: true,
                },
                "edit-rest-days": {
                    permission: "update",
                    icon: "la-calendar-week",
                    title: "Edit Rest Days",
                    attr: "edit-rest-days",
                },
                comment: {
                    permission: "update",
                    icon: "la-comment",
                    title: "Add Comment",
                    attr: "comment",
                    statusCheck: true,
                },
                delete: {
                    permission: "delete",
                    icon: "la-trash-o",
                    title: "Delete Record",
                    attr: "delete"
                },
                statusUpdate: {
                    permission: "update",
                    icon: "la-stream",
                    title: "Update Record's Status",
                    attr: "statusUpdate"
                },
                history: {
                    permission: "read",
                    icon: "la-history",
                    title: "History",
                    attr: "history"
                }
            },
            permissionValid = function(type){
                var valid = false;
                if(permission[type] == "all" || (permission[type] == "self" && username == USER.username)){
                    valid = true;
                }
                return valid;
            },
            buttonsHTML = "";
        grantedActions.forEach(val => {
            if(customButtons) {
                if(customButtons.includes(val)){
                    loadButton();
                }
            } else {
                loadButton();
            }
            function loadButton(){
                var button = buttonDetails[val],
                    admin = (adminArr.includes(val))?"admin":"",
                    disable = (disabledArr.includes(val))?"disabled":"",
                    readonly = (readonlyArr.includes(val))?"readonly":"";
                if(button){
                    var icon = (loadView.includes(val))?"la-spin la-spinner":button.icon;
    
                    function shouldDelete(){
                        var delete_ = false;
                        deleteArr.forEach(val_ => {
                            if(val_.button == val && val_.byPassCondition){
                                delete_ = true;
                            } else {
                                if(val_.button == val && (val_.status||[]).includes(status)){
                                    delete_ = true;
                                }
                            }
                        });
                        return delete_;
                    }

                    if(permissionValid(button.permission) && !shouldDelete()) {
                        buttonsHTML += `<a title="${button.title}" class="dt-button action-icon ${admin} ${disable} ${readonly} ${condClass}" ${attrs} ${button.attr}><i class="la ${icon}"></i></a>`;
                        count++;
                    }
                }
            }
        });

        return { buttons: `<div style="text-align:center;">${buttonsHTML}</div>`, width: `${(count*22)}px` };
    },
    WATCH: function(x){
        var urlPath = x.urlPath;
        CHANGESTREAMS[urlPath] = function(event){
            var table_id = `#tbl-${urlPath}`,
                dt = null,
                operationType = event.operationType,
                _id = event.documentKey._id,
                docs = event.fullDocument,
                id_index = (LIST[urlPath]) ? LIST[urlPath].findIndex(x =>x._id.toString() == _id.toString()) : null,
                obj = (LIST[urlPath]) ? LIST[urlPath][id_index] : null;

            console.log(urlPath,operationType,_id,docs);
            if(operationType == "insert"){
                if(urlPath == "notifications" && docs.type != "test" && PERMISSION["de_dashboard"]){
                    var txt = `${docs.escalation}_${docs.delay_type}_${docs.dispatch_id}_${docs.site}`;
                    if(!DE_NOTIF_COUNT.includes(txt)){
                        
                        DE_NOTIF_COUNT.push(txt);
                        DE_DASHBOARD.FUNCTION.setBadge("add");

                        if(USER.settings.push_notification == "none"){} 
                        else {
                            var sound = document.getElementById("audio01");
                            sound.play();

                            var redDot = `<span style="background-color:red; display:inline-block;border-radius:20px; width:7px;height:7px;margin-right:4px;"></span>`;
                            var runningDurationType = "Transit";
                            if(docs.delay_type.indexOf("Queueing") > -1) runningDurationType = "Queueing";
                            if(docs.delay_type.indexOf("CICO") > -1) runningDurationType = "CICO";

                            try {
                                if(USER.settings.push_notification == "desktop"){
                                    try {
                                        if(Notification.permission == "granted"){
                                            var notification = new Notification(`${docs.dispatch_id} | Escalation ${docs.escalation}`, {
                                                // icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
                                                body: `Running ${runningDurationType} Duration: ${DATETIME.HH_MM(null,docs.timelapse).hour_minute}`,
                                                tag: `${docs.dispatch_id} | Escalation ${docs.escalation}`
                                            });
                                            // will not work if onclick is included upon initialization of the notification.
                                            notification.onclick = function(e){
                                                // e.preventDefault(); // prevent the browser from focusing the Notification's tab; will not go to the tab that called the browser
                                                window.history.pushState({}, null, `#de_dashboard`);
                                                PAGE.GO_TO();
                                            }
                                        }
                                    } catch(error){}
                                } else { // unset or set to toast notif
                                    toastr.error(`${redDot}<b>${docs.dispatch_id}</b> | Escalation ${docs.escalation}<br>Running ${runningDurationType} Duration: ${DATETIME.HH_MM(null,docs.timelapse).hour_minute}`,"",{
                                        positionClass: "toast-bottom-right toastr-white-bg",
                                        showDuration: "300",
                                        closeButton: true,
                                        hideDuration: "1000",
                                        timeOut: "20000",
                                        preventDuplicates: true,
                                        onclick: function(){
                                            window.history.pushState({}, null, `#de_dashboard`);
                                            PAGE.GO_TO();
                                        }
                                    });
                                }
                            } catch (error) {
                                
                            }
                        }
                    }
                }
                if(LIST[urlPath]){ //  && docs.type != "test"
                    var index = LIST[urlPath].findIndex(x => x._id.toString() == docs._id.toString());
                    
                    // put before docs._row = (index > -1) ?  ....
                    if(urlPath == "notifications" && $.fn.DataTable.isDataTable("#tbl-oc")){
                        var arr = [100,500,1000,1500,2000];
                        var minRandom = Math.floor(Math.random() * arr.length);
                        var maxRandom = Math.floor(Math.random() * arr.length);
                        var ms = (Math.floor(Math.random() * arr[maxRandom]) + arr[minRandom]);
                        console.log("ms",minRandom,maxRandom,ms);
                        setTimeout(function(){
                            if(docs.delay_type == "Over Transit") table_id = "#tbl-ot";
                            if(docs.delay_type == "Long Queueing") table_id = "#tbl-lq";
                            if(docs.delay_type == "Over CICO") table_id = "#tbl-oc";
                            dt = $(table_id).DataTable();

                            // docs.id = docs._id;
                            var same = LIST[urlPath].find(x=> x.dispatch_id == docs.dispatch_id && x.delay_type == docs.delay_type);
                            if(same){
                                if(docs.escalation > same.escalation){
                                    // if escalation level increased, delete lower escalation level and replace by higher escalation level
                                    dt.row(`[_row="${same._row}"]`).remove().draw(false);
                                    var newList = $.grep(LIST[urlPath], function(x){ return x.dispatch_id != docs.dispatch_id; });
                                    LIST["notifications"] = newList;
                                    DE_DASHBOARD.FUNCTION.setSummary();

                                    docs.id = docs._id;

                                    DE_DASHBOARD.FUNCTION.addDataToTable(docs).then(result => {
                                        dt.row.add(result).draw(false);
                                        DE_DASHBOARD.FUNCTION.setSummary();
                                    });
                                }
                            } else {
                                docs.id = docs._id;
                                DE_DASHBOARD.FUNCTION.addDataToTable(docs).then(result => {
                                    dt.row.add(result).draw(false);
                                    DE_DASHBOARD.FUNCTION.setSummary();
                                });
                            }
                        },ms);
                    }
                    // end put before docs._row = (index > -1) ?  .... 
                    if(urlPath == "notifications" && $.fn.DataTable.isDataTable(table_id)){
                        $.ajax({ 
                            url: `/api/dispatch/${CLIENT.id}/${USER.username}/${docs.dispatch_id}`, 
                            method: "GET", 
                            timeout: 90000, 
                            headers: {
                                "Authorization": SESSION_TOKEN
                            },
                            async: true
                        }).done(function (_docs_) {
                            var _doc_ = _docs_[0];
                            docs.dispatchDetails = {
                                status: _doc_.status,
                                departure_date: _doc_.departure_date
                            };
                            docs._row = (index > -1) ? obj._row : GENERATE.RANDOM(36);
                            (index > -1) ? LIST[urlPath][index] = docs : LIST[urlPath].push(docs);

                            if ($.fn.DataTable.isDataTable(table_id) && x.rowData) {
                                dt = $(table_id).DataTable();
                                if(FILTER.APPROVAL[urlPath] && PAGE.GET() == urlPath){
                                    FILTER.APPROVAL[urlPath]([docs],dt,x.rowData);
                                } else {
                                    dt.row.add(x.rowData(docs)).draw(false);
                                }
                            }
                        });
                    } else {
                        if(!(urlPath == "notifications" && $.fn.DataTable.isDataTable("#tbl-oc"))){
                            docs._row = (index > -1) ? obj._row : GENERATE.RANDOM(36);
                            (index > -1) ? LIST[urlPath][index] = docs : LIST[urlPath].push(docs);
                        }
    
                        if ($.fn.DataTable.isDataTable(table_id) && x.rowData) {
                            dt = $(table_id).DataTable();
                            if(FILTER.APPROVAL[urlPath] && PAGE.GET() == urlPath){
                                FILTER.APPROVAL[urlPath]([docs],dt,x.rowData);
                            } else {
                                dt.row.add(x.rowData(docs)).draw(false);
                            }
                        }
                    }
                    if(urlPath == "dispatch" && $.fn.DataTable.isDataTable("#tbl-dashboard")){
                        // if(DASHBOARD_COUNTER > 5) {
                        //     DASHBOARD_COUNTER = 0;
                            if (typeof DASHBOARD.FUNCTION.addDataToTable === 'function') { DASHBOARD.FUNCTION.addDataToTable([docs],false); }
                            if (typeof DASHBOARD.FUNCTION.addDataToTable2 === 'function') { DASHBOARD.FUNCTION.addDataToTable2([docs],false); }
                        // }
                    }
                    if(urlPath == "notifications" && ISMOBILE){
                        NOTIFICATIONS.FUNCTION.mobileAddToList({val:docs,urlPath},true).then(template => {
                            if($(`.page-box.row > .col-sm-12 [_row]`).length > 0){
                                $(`.page-box.row > .col-sm-12`).prepend(template);
                            } else {
                                $(`.page-box.row > .col-sm-12`).html(template);
                            }
                        });
                    }
                }
            }
            if(operationType == "update" || operationType == "replace"){
                if(obj){
                    docs._row = obj._row;

                    var index = LIST[urlPath].findIndex(x => x._row == docs._row);
                    (index > -1) ? LIST[urlPath][index] = docs : LIST[urlPath].push(docs);

                    if ($.fn.DataTable.isDataTable(table_id)) {
                        dt = $(table_id).DataTable();
                        var rowNode = dt.row(`[_row="${obj._row}"]`).node();
                        (rowNode && x.rowData) ? dt.row(rowNode).data(x.rowData(docs)).draw(false) : null;
                    }
                }
                if(urlPath == "dispatch" && $.fn.DataTable.isDataTable("#tbl-dashboard")){
                    if (typeof DASHBOARD.FUNCTION.addDataToTable === 'function') { DASHBOARD.FUNCTION.addDataToTable([docs],false); }
                    if (typeof DASHBOARD.FUNCTION.addDataToTable2 === 'function') { DASHBOARD.FUNCTION.addDataToTable2([docs],false); }
                }
                if(urlPath == "dispatch" && $.fn.DataTable.isDataTable("#tbl-oc")){
                    var _table_id_;
                    if(["processingAtOrigin","idlingAtOrigin","in_transit","complete","incomplete"].includes(docs.status)){
                        _table_id_ = "#tbl-lq";
                    }
                    if(["in_transit","complete","incomplete"].includes(docs.status)){
                        _table_id_ = "#tbl-oc";
                    }
                    if(["complete","incomplete"].includes(docs.status)){
                        _table_id_ = "#tbl-ot";
                    }
                    if(_table_id_ && LIST["notifications"]){
                        var notifArr = LIST["notifications"].filter(x => x.dispatch_id == docs._id);
                        notifArr.forEach(val => {
                            if ($.fn.DataTable.isDataTable(_table_id_)) {
                                var _dt_ = $(_table_id_).DataTable();
                                _dt_.row(`[_row="${val._row}"]`).remove().draw(false);
                            }
                        });
                        var newList = $.grep(LIST["notifications"], function(x){ return x.dispatch_id != docs._id; });
                        LIST["notifications"] = newList;
                        DE_DASHBOARD.FUNCTION.setSummary();
                    }
                }
            }
            if(operationType == "delete"){
                var newList = $.grep((LIST[urlPath]||[]), function(x){ return x._id.toString() != _id.toString(); });
                if ($.fn.DataTable.isDataTable(table_id)) {
                    dt = $(table_id).DataTable();
                    dt.row(`[_row="${obj._row}"]`).remove().draw(false);
                }
                
                if(urlPath == "dispatch" && $.fn.DataTable.isDataTable("#tbl-oc")){
                    var _table_id_ = "#tbl-ot,#tbl-lq,#tbl-oc";
                    var notifArr = LIST["notifications"].filter(x => x.dispatch_id == _id);
                    notifArr.forEach(val => {
                        if ($.fn.DataTable.isDataTable(_table_id_)) {
                            var _dt_ = $(_table_id_).DataTable();
                            _dt_.row(`[_row="${val._row}"]`).remove().draw(false);
                        }
                    });
                    var newList = $.grep(LIST["notifications"], function(x){ return x.dispatch_id != _id; });
                    LIST["notifications"] = newList;
                    DE_DASHBOARD.FUNCTION.setSummary();
                }
                if(urlPath == "notifications" && $.fn.DataTable.isDataTable("#tbl-oc")){
                    console.log("Deleted notifications",_id);
                    var _table_id_ = "#tbl-ot,#tbl-lq,#tbl-oc";
                    var notifArr = LIST[urlPath].filter(x => ((x.id && x.id.toString() == _id.toString()) || (x._id.toString() == _id.toString())));
                    notifArr.forEach(val => {
                        if ($.fn.DataTable.isDataTable(_table_id_)) {
                            var _dt_ = $(_table_id_).DataTable();
                            _dt_.row(`[_row="${val._row}"]`).remove().draw(false);
                        }
                    });
                    var newList = $.grep(LIST[urlPath], function(x){ return ((x.id && x.id.toString() != _id.toString()) || (x._id.toString() != _id.toString())); });
                    LIST[urlPath] = newList;
                    DE_DASHBOARD.FUNCTION.setSummary();
                }
                // end put before LIST[urlPath] = newList;

                if(!(urlPath == "notifications" && $.fn.DataTable.isDataTable("#tbl-oc")) || !(urlPath == "dispatch" && $.fn.DataTable.isDataTable("#tbl-oc"))){
                    LIST[urlPath] = newList;
                }
                
                if(urlPath == "dispatch" && $.fn.DataTable.isDataTable("#tbl-dashboard")){
                    if (typeof DASHBOARD.FUNCTION.addDataToTable === 'function') { DASHBOARD.FUNCTION.addDataToTable(null,false,obj); }
                    if (typeof DASHBOARD.FUNCTION.addDataToTable2 === 'function') { DASHBOARD.FUNCTION.addDataToTable2(null,false,obj); }
                }
                if(urlPath == "notifications" && ISMOBILE){
                    $(`.page-box.row > .col-sm-12 [_row="${obj._row}"]`).remove();
                    if($(`.page-box.row > .col-sm-12 [_row]`).length == 0){
                        $(`.page-box.row > .col-sm-12`).html(`<div style="text-align: center;margin-top: 15px;">You do not have any notifications</div>`);
                    }
                }
                if(urlPath == "sessions"){
                    (_id == SESSION_TOKEN) ? LOGOUT() : null;
                }
            }

            if(urlPath == "users"){
                // console.log("usersssss",docs._id,USER.username);
                if(docs && docs._id == USER.username){
                    var originalRole = USER.role;
                    USER.fullName = docs.name;
                    USER.email = docs.email;
                    USER.phoneNumber = docs.phoneNumber;
                    USER.role = docs.role;

                    $(`#profile-page #fullname`).html(docs.name);
                    $(`#profile-page #email`).html(docs.email);
                    $(`#profile-page #phoneNumber`).html(docs.phoneNumber);
                    $(`#profile-page #role`).html(USER.role.capitalize());

                    if((docs.role||"user") != originalRole){
                        toastr.warning("Your privileges has been changed. This page will automatically refresh in 5 seconds.",null,{timeOut: 5000});
                        setTimeout(function(){
                            location.reload();
                        },5000);
                    }
                }
            }
            
            if (typeof x.options === 'function') { x.options(); }
        };
    },
    COL_ROW: function(column,row,userKey){
        // if Action column is not visible, try making create/update/delete from auth.js "all". 
        var permission = PERMISSION[PAGE.GET()] || {},
            removeColRow = function(key){
                if(column){
                    var index = column.findIndex(x => x.data == key);
                    (index > -1) ? column.splice(index, 1) : null;
                }
                (row) ? delete row[key] : null;

                if(CUSTOM.COLUMN[PAGE.GET()] && key){
                    var index = CUSTOM.COLUMN[PAGE.GET()].findIndex(x => x.text == key);
                    (index > -1) ? CUSTOM.COLUMN[PAGE.GET()].splice(index, 1) : null;
                }
            };

        if(!["all","self"].includes(permission.read) && !["all","self"].includes(permission.update) && !["all","self"].includes(permission.delete)){
            removeColRow("Action");
            removeColRow(userKey);
        }
        return {column,row};
    },
    TOOLBAR: function(dt){
        new $.fn.dataTable.Buttons(dt, {
                buttons: [
                    {
                        extend: 'copy',
                        text: 'Copy',
                        title: null,
                        exportOptions: {
                            modifier: {
                                search: 'applied',
                                order: 'applied',
                            },
                            columns: ":not(.notExport)",
                            format: {
                                body: function ( data, row, column, node ) {
                                    var _data = data;
                                    
                                    (_data === "You") ? _data = _data.replace("You", USER.fullName) : null; // change "You" to user's full name
                                    (_data.indexOf("<") > -1) ? _data = $(_data).text() : null; // return text inside html tags

                                    return _data;
                                }
                            }
                        }
                    },
                    {
                        extend: 'csv',
                        text: 'CSV',
                        title: null,
                        exportOptions: {
                            modifier: {
                                search: 'applied',
                                order: 'applied',
                            },
                            columns: ":not(.notExport)",
                            format: {
                                body: function ( data, row, column, node ) {
                                    var _data = data;
                                    
                                    (_data === "You") ? _data = _data.replace("You", USER.fullName) : null; // change "You" to user's full name
                                    (_data.indexOf("<") > -1) ? _data = $(_data).text() : null; // return text inside html tags

                                    return _data;
                                }
                            }
                        }
                    },
                    {
                        extend: 'excel',
                        text: 'Excel',
                        title: null,
                        exportOptions: {
                            modifier: {
                                search: 'applied',
                                order: 'applied',
                            },
                            columns: ":not(.notExport)",
                            format: {
                                body: function ( data, row, column, node ) {
                                    var _data = data;
                                    
                                    (_data === "You") ? _data = _data.replace("You", USER.fullName) : null; // change "You" to user's full name
                                    (_data.indexOf("<") > -1) ? _data = $(_data).text() : null; // return text inside html tags

                                    return _data;
                                }
                            }
                        }
                    }
            ]
        }).container().appendTo($('#export-container'));
    },
    FINISH_LOADING: {
        CHECK: null,
        START_CHECK: function(){
            if (typeof TABLE.FINISH_LOADING.CHECK === 'function') { TABLE.FINISH_LOADING.CHECK(); }
        },
        UPDATE: function(){
            $(`.create-btn:not(.dispatcherCondition),.import-btn:not(.dispatcherCondition),.create-admin-btn:not(.dispatcherCondition),.data_maintenance-btn`).removeClass("disabled");
            $(`.create-btn i,.create-admin-btn i`).removeClass("la-spin la-spinner").addClass("la-plus");
            $(`.import-btn i`).removeClass("la-spin la-spinner").addClass("la-file-upload");
            $(`.table a[edit]:not(.dispatcherCondition),.table a[edit-admin]:not(.dispatcherCondition),.table a[view],.table a[comment]`).removeClass("readonly");
            $(`.table a[edit] i,.table a[edit-admin] i`).removeClass("la-spin la-spinner").addClass("la-pencil");
            $(`.table a[view] i`).removeClass("la-spin la-spinner").addClass("la-search-plus");
            $(`.table a[comment] i`).removeClass("la-spin la-spinner").addClass("la-comment");
            $(`.data_maintenance-btn i`).removeClass("la-spin la-spinner").addClass("la-tasks");
        }
    }
};
/************** END FUNCTIONS **************/

function getGeofence(value="",key="_id",type="find"){
    return (LIST["geofences"]||[])[type](x => x[key].toString() == value.toString());
}
function getVehicle(value="",key="_id",type="find"){
    return (LIST["vehicles"]||[])[type](x => x[key].toString() == value.toString());
}
function getVehicleHistory(value="",key="_id",type="find"){
    return (LIST["vehicles_history"]||[])[type](x => x[key].toString() == value.toString());
}
function getVehiclesSection(value="",key="_id",type="find"){
    return (LIST["vehicles_section"]||[])[type](x => x[key].toString() == value.toString());
}
function getVehiclesCompany(value="",key="_id",type="find"){
    return (LIST["vehicles_company"]||[])[type](x => x[key].toString() == value.toString());
}
function getVehiclePersonnel(value="",key="_id",type="find"){
    return (LIST["vehicle_personnel"]||[])[type](x => x[key].toString() == value.toString());
}
function getVehiclePersonnelSection(value="",key="_id",type="find"){
    return (LIST["vehicle_personnel_section"]||[])[type](x => x[key].toString() == value.toString());
}
function getVehiclePersonnelCompany(value="",key="_id",type="find"){
    return (LIST["vehicle_personnel_company"]||[])[type](x => x[key].toString() == value.toString());
}
function getTrailer(value="",key="_id",type="find"){
    return (LIST["trailers"]||[])[type](x => x[key].toString() == value.toString());
}
function getRoute(value="",key="_id",type="find"){ // STILL HAVE
    return (LIST["routes"]||[])[type](x => x[key].toString() == value.toString());
}
function getRegion(value="",key="_id",type="find"){
    return (LIST["regions"]||[])[type](x => x[key].toString() == value.toString());
}
function getCluster(value="",key="_id",type="find"){
    return (LIST["clusters"]||[])[type](x => x[key].toString() == value.toString());
}
function getUser(value="",key="_id",type="find"){
    return (LIST["users"]||[])[type](x => x[key].toString() == value.toString());
}
function getShiftSchedule(value="",key="_id",type="find"){
    return (LIST["shift_schedule"]||[])[type](x => x[key].toString() == value.toString());
}

/************** VIEWS **************/
const views = new function(){
    return {
        profile: function(dl_btn=""){
            if(CLIENT.allowDownloadFromOtherDB) 
                dl_btn = `<div class="text-right mt-2"><button id="dl-odb-btn" class="btn btn-default" style="width: 241px;white-space:normal;"><i class="la la-user"></i>Download Profile From WRU Dispatch - ${CLIENT.allowDownloadFromOtherDB}</a></div>`;
            
            return `<div class="page-box">
                        <div id="profile-page" class="col-md-6 mt-4">
                            <h6 class="mt-0">Details</h6>
                            <table class="table">
                                <tr>
                                    <td>Username</td>
                                    <td class="text-dark">${USER.username}</td>
                                </tr>
                                <tr>
                                    <td>Full Name</td>
                                    <td id="fullname" class="text-dark">${USER.fullName}</td>
                                </tr>
                                <tr>
                                    <td>Email</td>
                                    <td id="email" class="text-dark">${USER.email}</td>
                                </tr>
                                <tr>
                                    <td>Phone Number</td>
                                    <td id="phoneNumber" class="text-dark">${USER.phoneNumber}</td>
                                </tr>
                            </table>
                            <h6>Role</h6>
                            <table class="table">
                                <tr>
                                    <td id="role" class="text-dark">${USER.role.capitalize()}</td>
                                </tr>
                            </table>
                            <h6>Location Assigned <i class="text-muted">(for dispatchers only)</i></h6>
                            <table class="table">
                                <tr>
                                    <td class="text-dark" granted_dc><small class="font-italic text-muted">loading...</small></td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-12">
                            <h6 style="border-bottom: 1px solid #eee;" class="mb-0 pb-3">Locations In-Charge</h6>
                            <table class="table" style="table-layout: fixed;">
                                <tbody>
                                    <tr>
                                        <td style="border-color: #fff !important;" class="p-0 pt-2 pb-2"><small>Region</small></td>
                                        <td style="border-color: #fff !important;" class="p-0 pt-2 pb-2"><small>Cluster</small></td>
                                        <td style="border-color: #fff !important;" class="p-0 pt-2 pb-2"><small>Site</small></td>
                                    </tr>
                                    <tr>
                                        <td class="p-0 pt-2" regions><small class="font-italic text-muted">loading...</small></td>
                                        <td class="p-0 pt-2" clusters><small class="font-italic text-muted">loading...</small></td>
                                        <td class="p-0 pt-2" geofences><small class="font-italic text-muted">loading...</small></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="text-right"><button id="dl-btn" class="btn btn-default" style="width: 241px;"><i class="la la-user"></i>Download Profile From WRU Main</a></div>
                        ${dl_btn}
                        <div class="text-right"><button id="edit-btn" class="btn btn-default mt-2" style="width: 241px;"><i class="la la-pencil"></i>Edit Details</a></div>
                    </div>`;
        },
        settings: function(){
            var versionHTML = `<div class="col-md-12 mt-4">
                                        <h5>Current Version</h5>
                                        <span class="text-muted">${VERSION}</span>
                                    </div>`;

                return `<div class="page-box">
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="col-md-12">
                                        <h5>Push Notifications</h5>
                                    </div>
                                    <div class="col-md-12 mt-1">
                                        <div class="fancy-radio">
                                            <label class="m-0">
                                                <input name="push_notification" value="toast" type="radio">
                                                <span><i></i>Toast Notification<a id="toast-test" href="javascript:void(0);" class="ml-2" style="font-size: 10px;color: #00a548c7;font-style: italic;">Test Me!</a></span>
                                            </label>
                                        </div>
                                        <div class="text-muted mb-2 ml-4">A Toast Notification will only appear on the browser while using this website. It will not appear when the user is on a different website/tabs or uses a different application.</div>
                                        <div class="fancy-radio">
                                            <label class="m-0">
                                                <input name="push_notification" value="desktop" type="radio">
                                                <span><i></i>Desktop Notification<a id="desktop-test" href="javascript:void(0);" class="ml-2" style="font-size: 10px;color: #00a548c7;font-style: italic;">Test Me!</a></span>
                                            </label>
                                        </div>
                                        <div class="text-muted mb-2 ml-4">
                                            A Desktop Notification allows the user to be notified even when the user uses a different application, is on a different website/tab, or when the browser is minimized.
                                            <div style="font-style: italic;">Note: Please <b>allow</b> the browser to send you notifications from this website.</div>
                                        </div>
                                        <div class="fancy-radio">
                                            <label class="m-0">
                                                <input name="push_notification" value="none" type="radio">
                                                <span><i></i>None</span>
                                            </label>
                                        </div>
                                        <div class="text-muted mb-2 ml-4">The user will not receive any type of push notifications from this website.</div>
                                    </div>
                                    <div class="col-md-12" style="padding-top: 15px;border-top: 1px solid #eee;margin-top: 15px;">
                                        <h5>Log-in Sessions</h5>
                                        <span class="text-muted">If you notice any unfamiliar devices or locations, click 'Logout' to end the session.</span>
                                    </div>
                                    <div class="col-md-12 mt-1">
                                        <div class="table-wrapper">
                                            <table id="tbl-sessions" class="table table-hover table-bordered">
                                                <thead></thead>
                                                <tbody></tbody>
                                            </table>
                                        </div>
                                    </div>
                                    ${((ISMOBILE === true) ? versionHTML : "")}
                                </div>
                            </div>
                        </div>`;
        },
        dashboard: function(){
            var summaryStatusHTML = "";

            (clientCustom.visibleStatus||[]).forEach(val => {
                switch (val) {
                    case "in_transit":
                        summaryStatusHTML += `<div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.5%;">
                                                <div class="summary-container" style="height: 92px;">
                                                    <b in_transit><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></b>
                                                    <div class="summary-red font-11 font-normal">In Transit</div>
                                                </div>
                                            </div>`;
                        break;
                    case "total_shipment":
                        summaryStatusHTML += `<div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                                <div class="summary-container" style="height: 92px;">
                                                    <b total_shipment><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></b>
                                                    <div class="summary-red font-11 font-normal">Total Shipment</div>
                                                </div>
                                            </div>`;
                        break;
                    case "incomplete":
                        summaryStatusHTML += `<div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                                <div class="summary-container" style="height: 92px;">
                                                    <b incomplete><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></b>
                                                    <div class="summary-red font-11 font-normal">Incomplete</div>
                                                </div>
                                            </div>`;
                        break; 
                    case "scheduled":
                        summaryStatusHTML += `<div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                                <div class="summary-container" style="height: 92px;">
                                                    <b scheduled><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></b>
                                                    <div class="summary-red font-11 font-normal">Scheduled</div>
                                                </div>
                                            </div>`;
                        break;
                    case "assigned":
                        summaryStatusHTML += `<div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                                <div class="summary-container" style="height: 92px;">
                                                    <b assigned><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></b>
                                                    <div class="summary-red font-11 font-normal">Assigned</div>
                                                </div>
                                            </div>`;
                        break;
                    case "queueingAtOrigin":
                        summaryStatusHTML += `<div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                                <div class="summary-container" style="height: 92px;">
                                                    <b queueingAtOrigin><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></b>
                                                    <div class="summary-red font-11 font-normal">Queueing (Origin)</div>
                                                </div>
                                            </div>`;
                        break;
                    case "processingAtOrigin":
                        summaryStatusHTML += `<div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                                <div class="summary-container" style="height: 92px;">
                                                    <b processingAtOrigin><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></b>
                                                    <div class="summary-red font-11 font-normal">Processing (Origin)</div>
                                                </div>
                                            </div>`;
                        break;
                    case "onSite":
                        summaryStatusHTML += ` <div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                                    <div class="summary-container" style="height: 92px;">
                                                        <b onSite><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></b>
                                                        <div class="summary-red font-11 font-normal">On-Site</div>
                                                    </div>
                                                </div>`;
                        break;
                    case "returning":
                        summaryStatusHTML += `<div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                                <div class="summary-container" style="height: 92px;">
                                                    <b returning><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></b>
                                                    <div class="summary-red font-11 font-normal">Returning</div>
                                                </div>
                                            </div>`;
                        break;
                    case "complete":
                        summaryStatusHTML += `<div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                                <div class="summary-container" style="height: 92px;">
                                                    <b complete><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></b>
                                                    <div class="summary-red font-11 font-normal">Complete</div>
                                                </div>
                                            </div>`;
                        break;
                    default:
                        break;
                }
            });

            return `<div id="dashboard-page" class="page-box row">
                        <div class="col-sm-12" style="height: 66px;">
                            <span style="font-size: 30px;font-family: Montserrat;" class="font-lighter mt-2 d-inline-block">
                                <span class="text-success" style="font-weight: 500;">Deployment</span> Dashboard
                            </span>
                        </div>
                        <div class="col-sm-12 mb-2"><a id="reset-btn" href="javascript:void(0);" style="display:none;color: gray;text-decoration: underline;pointer-events:none;">Reset filters</a></div>
                        <div class="col-sm-12" style="height: 28px;">
                            <div class="d-inline-block" style="width: 160px;">
                                <div class="switch-toggle switch-3 switch-candy">
                                    <input id="on" name="view-d" type="radio" checked="checked" value="destination">
                                    <label for="on">Destination</label>
                                    <input id="off" name="view-d" type="radio" value="origin">
                                    <label for="off">Origin</label>
                                    <a></a>
                                </div>
                            </div>
                            <span class="float-right" style="max-width:200px;display:inline-block;">
                                <span>
                                    <div class="input-group">
                                        <span class="input-group-addon"><i id="icon-date" class="la la-calendar"></i></span>
                                        <input id="_date" class="form-control" type="text" readonly>
                                    </div>
                                </span>
                            </span>
                        </div>
                        <div class="summary-parent-container col-sm-12 mt-2">
                            ${summaryStatusHTML}
                        </div>
                        <div class="col-sm-12 mt-3">
                            <ul id="_regions" class="nav nav-tabs" role="tablist" style="pointer-events: none;width: 84%;"></ul>
                            <div style="position: absolute;top: -9px;right: 15px;z-index: 0;">
                                <select id="_site" style="width:160px !important;display:none;"></select>
                            </div>
                            <div class="table-wrapper">
                                <table id="tbl-dashboard" class="table table-hover table-bordered" style="margin-top:0px !important;">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        de_dashboard: function(){
            return `<div id="dashboard-page" class="page-box row">
                        <div class="col-sm-12" style="height: 66px;">
                            <span style="font-size: 30px;font-family: Montserrat;" class="font-lighter mt-2 d-inline-block">
                                <span class="text-success" style="font-weight: 500;">Delay Escalation</span> Dashboard
                            </span>
                            <span class="float-right" style="max-width:200px;display:inline-block;">
                                <h2 _TIME_ class="m-0 font-italic font-bold">00:00</h2>
                                <span _DATE_ style="color: gray;font-size: 16px;">-/-/-</span>
                            </span>
                        </div>
                        <div id="filter-container" class="col-sm-12" style="pointer-events: none;">
                            <ul id="_regions" class="nav nav-tabs" role="tablist" style="width: 70%;"></ul>
                            <div style="position: absolute;top: -9px;right: 15px;z-index: 0;">
                                <select id="_baseplant" style="width:160px !important;;display:none;"></select>
                            </div>
                            <div style="position: absolute;top: -9px;right: 180px;z-index: 0;">
                                <select id="_site" class="select-multiple-basic" multiple="multiple" style="min-width:160px !important;display:none;"></select>
                            </div>
                        </div>
                        <!-- LONG QUEUEING -->
                        <div class="col-sm-4 p-0">
                            <div class="d-flex col-sm-12">
                                <div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.5%;">
                                    <div class="summary-container summary-red" style="height: 92px;background: #f2f2f2;">
                                        <span lq_esc_1 class="font-lighter" style="font-size: 37px;"><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></span>
                                        <div class="summary-red font-11 font-normal" style="color: #939393;">Escalation 1</div>
                                    </div>
                                </div>
                                <div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                    <div class="summary-container summary-red" style="height: 92px;background: #f2f2f2;">
                                        <span lq_esc_2 class="font-lighter" style="font-size: 37px;"><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></span>
                                        <div class="summary-red font-11 font-normal" style="color: #939393;">Escalation 2</div>
                                    </div>
                                </div>
                                <div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                    <div class="summary-container summary-red" style="height: 92px;background: #f2f2f2;">
                                        <span lq_esc_3 class="font-lighter" style="font-size: 37px;"><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></span>
                                        <div class="summary-red font-11 font-normal" style="color: #939393;">Escalation 3</div>
                                    </div>
                                </div>
                            </div>
                            <h5 class="col-sm-12 summary-red text-center font-bold">LONG QUEUEING</h5>
                            <div class="table-wrapper p-3">
                                <table id="tbl-lq" class="table table-hover table-bordered" style="margin-top:0px !important;">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                        <!-- END LONG QUEUEING -->
                        <!-- OVER CICO -->
                        <div class="col-sm-4 p-0">
                            <div class="d-flex col-sm-12">
                                <div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.5%;">
                                    <div class="summary-container summary-red" style="height: 92px;background: #f2f2f2;">
                                        <span oc_esc_1 class="font-lighter" style="font-size: 37px;"><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></span>
                                        <div class="summary-red font-11 font-normal" style="color: #939393;">Escalation 1</div>
                                    </div>
                                </div>
                                <div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                    <div class="summary-container summary-red" style="height: 92px;background: #f2f2f2;">
                                        <span oc_esc_2 class="font-lighter" style="font-size: 37px;"><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></span>
                                        <div class="summary-red font-11 font-normal" style="color: #939393;">Escalation 2</div>
                                    </div>
                                </div>
                                <div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                    <div class="summary-container summary-red" style="height: 92px;background: #f2f2f2;">
                                        <span oc_esc_3 class="font-lighter" style="font-size: 37px;"><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></span>
                                        <div class="font-11 font-normal" style="color: #939393;">Escalation 3</div>
                                    </div>
                                </div>
                            </div>
                            <h5 class="col-sm-12 summary-red text-center font-bold">OVER CICO</h5>
                            <div class="table-wrapper p-3">
                                <table id="tbl-oc" class="table table-hover table-bordered" style="margin-top:0px !important;">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                        <!-- END OVER CICO -->
                        <!-- OVER TRANSIT -->
                        <div class="col-sm-4 p-0">
                            <div class="d-flex col-sm-12">
                                <div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.5%;">
                                    <div class="summary-container summary-red" style="height: 92px;background: #f2f2f2;">
                                        <span ot_esc_1 class="font-lighter" style="font-size: 37px;"><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></span>
                                        <div class="summary-red font-11 font-normal" style="color: #939393;">Escalation 1</div>
                                    </div>
                                </div>
                                <div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                    <div class="summary-container summary-red" style="height: 92px;background: #f2f2f2;">
                                        <span ot_esc_2 class="font-lighter" style="font-size: 37px;"><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></span>
                                        <div class="summary-red font-11 font-normal" style="color: #939393;">Escalation 2</div>
                                    </div>
                                </div>
                                <div class="col-sm-1 p-0 mt-1 summary-parent" style="min-width: 9.4%;">
                                    <div class="summary-container summary-red" style="height: 92px;background: #f2f2f2;">
                                        <span ot_esc_3 class="font-lighter" style="font-size: 37px;"><i class="la la-spin la-spinner" style="opacity: 0.3;"></i></span>
                                        <div class="summary-red font-11 font-normal" style="color: #939393;">Escalation 3</div>
                                    </div>
                                </div>
                            </div>
                            <h5 class="col-sm-12 summary-red text-center font-bold">OVER TRANSIT</h5>
                            <div class="table-wrapper p-3">
                                <table id="tbl-ot" class="table table-hover table-bordered" style="margin-top:0px !important;">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                        <!-- END OVER TRANSIT -->
                    </div>`;
        },
        dispatch: function(){
            var scheduledDateHTML = "";            
            var roundtripHTML = "";
            
            if(clientCustom.roundtrip === true){
                roundtripHTML = `<option value="onSite">On-Site</option>
                                <option value="returning">Returning</option>`;
            }
            if(clientCustom.scheduled === true){
                scheduledDateHTML = `<div>
                                        <div style="font-size: 10px;">Scheduled Date:</div>
                                        <input type="text" id="_scheduled_date" class="clearable form-control" style="padding-left: 10px;" noval=true readonly>
                                    </div>`;
            }

            var sliderClone = "";
            if(ENVIRONMENT == "development"){
                sliderClone = SLIDER.CLONE(`<div>
                                                <div style="font-size: 10px;">Posting Date:</div>
                                                <input type="text" id="clone_posting_date" class="clearable form-control" style="padding-left: 10px;" value="${DEFAULT_DATE}" default=true readonly>
                                            </div>
                                            <div class="mt-2 font-10">Note: Existing shipment numbers will not be cloned.</div>`);
            }

            return `<div class="page-box row">
                        ${SLIDER.FILTER(`<div>
                                            <div style="font-size: 10px;">Departure Date:</div>
                                            <input type="text" id="_departure_date" class="clearable form-control" style="padding-left: 10px;" noval=true readonly>
                                        </div>
                                        <div>
                                            <div style="font-size: 10px;">Posting Date:</div>
                                            <input type="text" id="_posting_date" class="clearable form-control" style="padding-left: 10px;" value="${DEFAULT_DATE}" default=true readonly>
                                        </div>
                                        ${scheduledDateHTML}
                                        <div class="mt-2">
                                            <div style="font-size: 10px;">Status:</div>
                                            <select id="_status" class="form-control">
                                                <option value="all">All</option>
                                                <option value="plan">Plan</option>
                                                <option value="scheduled">Scheduled</option>
                                                <option value="assigned">Assigned</option>
                                                <option value="queueingAtOrigin">Queueing (Origin)</option>
                                                <option value="processingAtOrigin">Processing (Origin)</option>
                                                <option value="idlingAtOrigin">Idling (Origin)</option>
                                                <option value="in_transit">In Transit</option>
                                                ${roundtripHTML}
                                                <option value="complete">Complete</option>
                                                <option value="incomplete">Incomplete</option>
                                            </select>
                                        </div>
                                        <div class="mt-2">
                                            <div style="font-size: 10px;">Region:</div>
                                            <select id="_region" class="form-control"></select>
                                        </div>
                                        <div class="mt-2">
                                            <div style="font-size: 10px;">Cluster:</div>
                                            <select id="_cluster" class="form-control"></select>
                                        </div>`)}
                        ${sliderClone}
                        <div id="alert"></div>
                        <div class="col-sm-12 mt-2">
                            <div class="table-wrapper">
                                <table id="tbl-dispatch" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                        <div id="search-alert" class="col-sm-12 p-0" style="display:none;"></div>
                    </div>`;
        },
        shift_schedule: function(){
            return `<div class="page-box row">
                        <div class="col-sm-12 mt-2">
                            <div class="table-wrapper">
                                <table id="tbl-shift_schedule" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        dispatch_deleted: function(){
            return `<div class="page-box row">
                        ${SLIDER.FILTER(`<div>
                                            <div style="font-size: 10px;">Deleted Date:</div>
                                            <input type="text" id="_timestamp" class="clearable form-control" style="padding-left: 10px;" value="${DEFAULT_DATE}" default=true readonly>
                                        </div>
                                        <div>
                                            <div style="font-size: 10px;">Posting Date:</div>
                                            <input type="text" id="_posting_date" class="clearable form-control" style="padding-left: 10px;" noval=true readonly>
                                        </div>`)}
                        <div id="alert"></div>
                        <div class="col-sm-12 mt-2">
                            <div class="table-wrapper">
                                <table id="tbl-dispatch_deleted" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                        <div id="search-alert" class="col-sm-12 p-0" style="display:none;"></div>
                    </div>`;
        },
        reports: function(){
            /*
                Deployment Visibility Report - dvr 
                CICO Report - cicor
                Over Transit Report - otr
                Per Base Plant Activity - pbpa
                Haulage Window Time Report - hwtr
                Attendance Report - ar
                Trippage Report - tr
                Vehicle CICO Report - vcr
                User Login Activity Report - ular
                DE Summary Report - desr
                Scheduled Entries Report - ser
            */
            var ularHTML = "";
            var DESummaryReport = "";
            if(((clientCustom.reports.ular||{}).roles||[]).includes(USER.role)){
                ularHTML = `<div ular class="custom-btn-01 col-sm-12 pt-2 pb-2 pr-3 pl-3 disabled">
                                <span>User Login Activity Report</span>
                                <span class="float-right pt-1 pl-3 "><i class="la la-spin la-spinner"></i></span>
                            </div>`;
            }
            if(clientCustom.reports.desr){
                DESummaryReport += ` <div desr class="custom-btn-01 col-sm-12 mt-1 pt-2 pb-2 pr-3 pl-3 disabled">
                                        <span>Dispatch Entries Summary Report</span>
                                        <span class="float-right pt-1 pl-3 "><i class="la la-spin la-spinner"></i></span>
                                    </div>`;
            }
            if(clientCustom.reports.ser){
                DESummaryReport += ` <div ser class="custom-btn-01 col-sm-12 mt-1 pt-2 pb-2 pr-3 pl-3 disabled">
                                        <span>Scheduled Entries Report</span>
                                        <span class="float-right pt-1 pl-3 "><i class="la la-spin la-spinner"></i></span>
                                    </div>`;
            }
            if(clientCustom.reports.mtur){
                DESummaryReport += ` <div mtur class="custom-btn-01 col-sm-12 mt-1 pt-2 pb-2 pr-3 pl-3 disabled">
                                        <span>Manpower and Truck Utilization Report</span>
                                        <span class="float-right pt-1 pl-3 "><i class="la la-spin la-spinner"></i></span>
                                    </div>`;
            }
            return `<div class="page-box row">
                        <div class="col-sm-4 mt-3">
                            <div class="custom-btn-01 col-sm-12 pt-2 pb-2 pr-3 pl-3 disabled" no_function>
                                <span>Deployment Visibility Report</span>
                                <span class="float-right pt-1 pl-3 "><i class="la la-spin la-spinner"></i></span>
                            </div>
                            <div cicor class="custom-btn-01 col-sm-12 mt-1 pt-2 pb-2 pr-3 pl-3 disabled">
                                <span>CICO Report</span>
                                <span class="float-right pt-1 pl-3 "><i class="la la-spin la-spinner"></i></span>
                            </div>
                            <div otr class="custom-btn-01 col-sm-12 mt-1 pt-2 pb-2 pr-3 pl-3 disabled">
                                <span>Over Transit Report</span>
                                <span class="float-right pt-1 pl-3 "><i class="la la-spin la-spinner"></i></span>
                            </div>
                            <div pbpa class="custom-btn-01 col-sm-12 mt-1 pt-2 pb-2 pr-3 pl-3 disabled">
                                <span>Per Base Plant Activity</span>
                                <span class="float-right pt-1 pl-3 "><i class="la la-spin la-spinner"></i></span>
                            </div>
                            <div hwtr class="custom-btn-01 col-sm-12 mt-1 pt-2 pb-2 pr-3 pl-3 disabled">
                                <span>Haulage Window Time Report</span>
                                <span class="float-right pt-1 pl-3 "><i class="la la-spin la-spinner"></i></span>
                            </div>
                            <div class="custom-btn-01 col-sm-12 mt-1 pt-2 pb-2 pr-3 pl-3 disabled" no_function>
                                <span>Attendance Report</span>
                                <span class="float-right pt-1 pl-3 "><i class="la la-spin la-spinner"></i></span>
                            </div>
                            <div tr class="custom-btn-01 col-sm-12 mt-1 pt-2 pb-2 pr-3 pl-3 disabled">
                                <span>Trippage Report</span>
                                <span class="float-right pt-1 pl-3 "><i class="la la-spin la-spinner"></i></span>
                            </div>
                            <div vcr class="custom-btn-01 col-sm-12 mt-1 pt-2 pb-2 pr-3 pl-3 disabled">
                                <span>Vehicle CICO Report</span>
                                <span class="float-right pt-1 pl-3 "><i class="la la-spin la-spinner"></i></span>
                            </div>
                        </div>
                        <div class="col-sm-4 mt-3 ml-3">
                            ${ularHTML}
                            ${DESummaryReport}
                        </div>
                        <div style="font-size: 9px;font-weight: 100;" class="col-sm-12 text-muted mt-5">
                            Please click 'Yes' when a pop-up appears saying "The file format and extension of 'FILENAME.xls' don't match. The file could be corrupted or unsafe. Unless you trust its source, don't open it. Do you want to open it anyway?".
                        </div>
                    </div>`;
        },
        notifications: function(){
            return `<div class="page-box row">
                        ${SLIDER.FILTER(`<div>
                                                <div style="font-size: 10px;">Date & Time:</div>
                                                <input type="text" id="_timestamp" class="clearable form-control" style="padding-left: 10px;" value="${DEFAULT_DATE}" readonly>
                                            </div>
                                            <div class="mt-2">
                                                <div style="font-size: 10px;">Delay Type:</div>
                                                <select id="_delay_type" class="form-control">
                                                    <option value="all">All</option>
                                                    <option value="Over CICO">Over CICO</option>
                                                    <option value="Long Queueing">Long Queueing</option>
                                                    <option value="Over Transit">Over Transit</option>
                                                </select>
                                            </div>
                                            <div class="mt-2">
                                                <div style="font-size: 10px;">Escalation:</div>
                                                <select id="_escalation" class="form-control">
                                                    <option value="all">All</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                </select>
                                            </div>`)}
                        <div class="col-sm-12 mt-2">
                            <div class="table-wrapper">
                                <table id="tbl-notifications" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        event_viewer: function(){
            return `<div class="page-box row">
                        ${SLIDER.FILTER(`<div>
                                                <div style="font-size: 10px;">Date:</div>
                                                <input type="text" id="_date" class="clearable form-control" style="padding-left: 10px;" value="${DEFAULT_DATE}" readonly>
                                            </div>`)}
                        ${SLIDER.REPORT()}
                        <div class="col-sm-12 mt-2">
                            <div class="table-wrapper">
                                <table id="tbl-events" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        all_events: function(){
            return `<div class="page-box row">
                        ${SLIDER.FILTER(`<div>
                                                <div style="font-size: 10px;">Date:</div>
                                                <input type="text" id="_date" class="clearable form-control" style="padding-left: 10px;" value="${DEFAULT_DATE}" readonly>
                                            </div>`)}
                        <div class="col-sm-12 mt-2">
                            ${ALERT.HTML.INFO("This page displays all events sent by vehicles to WRU Dispatch. These events are saved regardless of conditions unlike in Event Viewer Page.","ml-0 mr-0 mt-2 mb-3",true)}
                            <div class="table-wrapper">
                                <table id="tbl-all-events" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        users: function(){
            return `<div class="page-box row">
                        <div class="col-sm-12 mt-2">
                            <div class="table-wrapper">
                                <table id="tbl-users" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        regions: function(){
            return `<div class="page-box row">
                        <div class="col-sm-12 mt-2">
                            <div class="table-wrapper">
                                <table id="tbl-regions" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        clusters: function(){
            return `<div class="page-box row">
                        <div class="col-sm-12 mt-2">
                            <div class="table-wrapper">
                                <table id="tbl-clusters" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        geofences: function(){
            return `<div class="page-box row">
                        <div class="col-sm-12 mt-2">
                            <small class="text-muted mb-2 d-block font-italic">Note: Changes made in <u data-toggle="tooltip" title="${CLIENT.ggsURL}">WRU Main</u> will reflect here after 2-4 minutes.</small>
                            <div class="table-wrapper">
                                <table id="tbl-geofences" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        routes: function(){
            return `<div class="page-box row">
                        <div class="col-sm-12 mt-2">
                            <div class="table-wrapper">
                                <table id="tbl-routes" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        vehicles: function(){
            return `<div class="page-box row">
                        ${SLIDER.FILTER(`<div class="mt-2">
                                            <div style="font-size: 10px;">Site:</div>
                                            <select id="_site" class="form-control">
                                                <option value="All">All</option>
                                            </select>
                                        </div>`)}
                        <div class="col-sm-12 mt-2">
                            <div class="table-wrapper">
                                <small class="text-muted mb-2 d-block font-italic">Note: Changes made in <u data-toggle="tooltip" title="${CLIENT.ggsURL}">WRU Main</u> will reflect here after 2-4 minutes.</small>
                                <table id="tbl-vehicles" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        vehicle_personnel: function(){
            return `<div class="page-box row">
                        <div class="col-sm-12 mt-2">
                            <div class="table-wrapper">
                                <table id="tbl-vehicle_personnel" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        trailers: function(){
            return `<div class="page-box row">
                        ${SLIDER.FILTER(`<div class="mt-2">
                                            <div style="font-size: 10px;">Site:</div>
                                            <select id="_site" class="form-control">
                                                <option value="All">All</option>
                                            </select>
                                        </div>`)}
                        <div class="col-sm-12 mt-2">
                            <div class="table-wrapper">
                                <table id="tbl-trailers" class="table table-hover table-bordered">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
        },
        changelogs: function(){
            return `<div class="page-box row">
                        <div>
                            <span class="ml-3 font-16">Current version: <b id="version"></b></span>
                            <i id="guide-btn" class="la la-info-circle float-right pl-3 pr-3 pb-3 font-18" data-toggle="tooltip" title="Changelog Guide" style="cursor:pointer;"></i>
                        </div>
                    </div>`;
        },
        new_version: function(){
            return `<div style="height: 100%;width: 100%;position: absolute;top: 0px;left: 0px;z-index: 99999999999;background-color: #0000002b;">
                        <div style="display: table; height: 100%;  overflow: hidden;margin: auto;text-align: center;">
                            <div style="#position: absolute; #top: 50%;display: table-cell; vertical-align: middle;">
                                <div style="  background-color: white;padding: 75px 100px;color: #404040;font-size: 14px;border-radius: 4px;">
                                    <h3>A new version of WD is available.</h3>
                                    <div style="margin-top: 12px;"><a href="javascript:window.location.reload(true)">Click this to refresh.</a></div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        }
    };
};
const modalViews = new function(){
    return {
        vehicles: {
            location_history: function(x){
                x.location = x.location || [];
                var modalBody = "",  
                    locationTbl = function(id,short_name,tr,_class){
                        _class = _class || "";
                        modalBody += `<div class="col-sm-12 ${_class}">
                                        <span class="font-14 font-normal">${short_name}</span>
                                        <table id="${id}" class="table " style="width:100%;">
                                            <thead></thead>
                                            <tbody>
                                                ${tr}
                                            </tbody>
                                        </table>
                                    </div>`;
                    };
                for(var i = x.location.length-1; i >= 0; i--){
                    var trs = "";
                    x.location[i].events.forEach(val => {
                        trs += `<tr>
                                    <td style="border:none;">${DATETIME.FORMAT(new Date(val.timestamp),"MMM D, YYYY, h:mm:ss A")}</td>
                                    <td>${val.RULE_NAME} (<span class="${((val.stage=="start")?"text-success":"text-danger")}">${val.stage}</span>)</td>
                                </tr>`
                    });
                    locationTbl(`vehicleLocation${i}`,`${x.location[i].short_name} (${i+1})`,trs);
                }
                return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                            <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                                <div role="document" class="modal-dialog">
                                    <div class="modal-content" style="height: 100%;">
                                        <div class="modal-header pb-2">
                                            <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                            <h4 class="modal-title" id="myModalLabel2">${x.title}</h4>
                                        </div>
                                        <div class="modal-body row pt-2" style="height: calc(100% - 70px);">${modalBody}</div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
            },
            data_maintenance: function(){
                return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                            <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                                <div role="document" class="modal-dialog modal-md">
                                    <div class="modal-content">
                                        <div class="modal-header pb-2">
                                            <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                            <h4 class="modal-title" id="myModalLabel2">Data Maintenance</h4>
                                        </div>
                                        <div class="modal-body row pt-2">
                                            <div id="modal-error"></div>
                                            <div class="col-sm-12">
                                                <ul class="nav nav-tabs" role="tablist">
                                                    <li class="active"><a href="#vehicles_section" role="tab" data-toggle="tab">Section</a></li>
                                                    <li class=""><a href="#vehicles_company" role="tab" data-toggle="tab">Company</a></li>
                                                </ul>
                                                <div class="tab-content">
                                                    <div class="tab-pane fade in active" id="vehicles_section">
                                                        <div class="pb-2" style="border-bottom: 1px solid #eee;">
                                                            <input id="section" class="form-control" type="text" placeholder="Enter item" style="width: 80%;display: inline-block;">
                                                            <div style="width: 19%;" class="d-inline-block pl-2">
                                                                <button id="section-btn" class="form-control">Submit</button>
                                                            </div>
                                                        </div>
                                                        <div id="section-list" style="max-height: 300px;overflow-y: auto;">
                                                            <i class="la la-spin la-spinner" style="font-size: 18px;margin-top: 10px;color: #cecece;"></i>
                                                        </div>
                                                    </div>
                                                    <div class="tab-pane fade" id="vehicles_company">
                                                        <div class="pb-2" style="border-bottom: 1px solid #eee;">
                                                            <input id="company" class="form-control" type="text" placeholder="Enter item" style="width: 80%;display: inline-block;">
                                                            <div style="width: 19%;" class="d-inline-block pl-2">
                                                                <button id="company-btn" class="form-control">Submit</button>
                                                            </div>
                                                        </div>
                                                        <div id="company-list" style="max-height: 300px;overflow-y: auto;">
                                                            <i class="la la-spin la-spinner" style="font-size: 18px;margin-top: 10px;color: #cecece;"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
            }
        },
        vehicle_personnel: {
            rest_days: function(_id){
                var calendarOptions = "";
                Object.keys(vehiclePersonnelCalendarOptions).forEach(key => {
                    var val = vehiclePersonnelCalendarOptions[key];
                    calendarOptions += `<option value="_${key}">${val.optionTitle}</option>`;
                });
                var obj = getVehiclePersonnel(_id);
                return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                            <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                                <div role="document" class="modal-dialog modal-sm">
                                    <div class="modal-content">
                                        <div class="modal-header pb-2">
                                            <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                            <h4 class="modal-title" id="myModalLabel2">
                                                ${obj.name || "-"}
                                                <div class="text-muted font-10">Rest Days/On-Leave Dates</div>
                                            </h4>
                                        </div>
                                        <div class="modal-body row pt-2">
                                            <div class="col-sm-12 p-0" style="border-right: 1px solid #eee;">
                                                <div id="modal-error"></div>
                                                <div class="col-sm-12">
                                                    <small>Please choose:</small>
                                                    <select id="calendar_type" class="form-control">${calendarOptions}</select>
                                                </div>
                                                <div class="col-sm-12 mt-3" style="height: 310px;">
                                                    <input type="text" id="inline-calendar" style="opacity:0;">
                                                    <div class="fancy-checkbox custom-bgcolor-green" style="display:none;margin-top:265px;">
                                                        <label>
                                                            <input id="recurring" type="checkbox">
                                                            <span class="toggle-vis">Recurring (for the next 30 weeks)</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-sm-12"> 
                                                    <button id="submit" type="button" class="btn btn-primary col-sm-12 mt-4">Submit</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
            },
            data_maintenance: function(){
                return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                            <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                                <div role="document" class="modal-dialog modal-md">
                                    <div class="modal-content">
                                        <div class="modal-header pb-2">
                                            <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                            <h4 class="modal-title" id="myModalLabel2">Data Maintenance</h4>
                                        </div>
                                        <div class="modal-body row pt-2">
                                            <div id="modal-error"></div>
                                            <div class="col-sm-12">
                                                <ul class="nav nav-tabs" role="tablist">
                                                    <li class="active"><a href="#vehicle_personnel_section" role="tab" data-toggle="tab">Section</a></li>
                                                    <li class=""><a href="#vehicle_personnel_company" role="tab" data-toggle="tab">Company</a></li>
                                                </ul>
                                                <div class="tab-content">
                                                    <div class="tab-pane fade in active" id="vehicle_personnel_section">
                                                        <div class="pb-2" style="border-bottom: 1px solid #eee;">
                                                            <input id="section" class="form-control" type="text" placeholder="Enter item" style="width: 80%;display: inline-block;">
                                                            <div style="width: 19%;" class="d-inline-block pl-2">
                                                                <button id="section-btn" class="form-control">Submit</button>
                                                            </div>
                                                        </div>
                                                        <div id="section-list" style="max-height: 300px;overflow-y: auto;">
                                                            <i class="la la-spin la-spinner" style="font-size: 18px;margin-top: 10px;color: #cecece;"></i>
                                                        </div>
                                                    </div>
                                                    <div class="tab-pane fade" id="vehicle_personnel_company">
                                                        <div class="pb-2" style="border-bottom: 1px solid #eee;">
                                                            <input id="company" class="form-control" type="text" placeholder="Enter item" style="width: 80%;display: inline-block;">
                                                            <div style="width: 19%;" class="d-inline-block pl-2">
                                                                <button id="company-btn" class="form-control">Submit</button>
                                                            </div>
                                                        </div>
                                                        <div id="company-list" style="max-height: 300px;overflow-y: auto;">
                                                            <i class="la la-spin la-spinner" style="font-size: 18px;margin-top: 10px;color: #cecece;"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
            }
        },
        events: {
            details: function(id,shipment_number=[]){
                var li = "",
                        sns = "";
                    shipment_number.forEach(val => {
                        li += `<li>${val}</li>`
                    });
                    if(!CLIENT.allowDownloadFromOtherDB) {
                        sns = `<div class="col-sm-12">
                                    <b>SHIPMENT NUMBERS:</b>
                                    <ol class="pl-4">${li}</ol>
                                </div>
                                <div class="col-sm-12"><hr class="mt-2"></div>`;
                    } 
                    return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                                <div id="small-modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                                    <div class="modal-dialog modal-lg" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                                <h4 class="modal-title" id="myModalLabel2">${id}</h4>
                                            </div>
                                            <div class="modal-body row">
                                                ${sns}
                                                <div class="col-sm-12 mt-2">
                                                    <div class="table-wrapper">
                                                        <table id="tbl-notification" class="table table-hover table-bordered">
                                                            <thead>
                                                                <tr>
                                                                    <th class="col-md-3">Key</th>
                                                                    <th class="col-md-9">Value</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody></tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
            },
        },
        dispatch: {
            form: function(){
                var snVisibility = "";
                var trailerHTML = "";
                var previousCheckIns = "";
                if(clientCustom.editableTrailer === true){
                    trailerHTML = `<div class="col-sm-12 p-0">
                                        <div class="col-sm-3">
                                            <small>Truck:</small>
                                            <select id="vehicle" class="select-multiple-basic" style="width:100%;"></select>
                                        </div>
                                        <div class="col-sm-3">
                                            <small>Trailer:</small>
                                            <select id="trailer" class="select-multiple-basic" style="width:100%;"></select>
                                        </div>
                                        <div class="col-sm-6" style="word-break: break-word;">
                                            <table class="table mb-0">
                                                <tbody>
                                                    <tr>
                                                        <td class="pt-0" style="border-color: #fff !important;"><small>Conduction #</small></td>
                                                        <td class="pt-0" style="border-color: #fff !important;"><small>Cluster</small></td>
                                                        <td class="pt-0" style="border-color: #fff !important;"><small>Base</small></td>
                                                        <td class="pt-0" style="border-color: #fff !important;"><small>Region</small></td>
                                                        <td class="pt-0" style="border-color: #fff !important;"><small>Pallet Type</small></td>
                                                    </tr>
                                                <tr>
                                                    <td class="text-muted" conduction_number>-</td>
                                                    <td class="text-muted" cluster>-</td>
                                                    <td class="text-muted" base>-</td>
                                                    <td class="text-muted" region>-</td>
                                                    <td class="text-muted" pallet_type>-</td>
                                                </tr>
                                                </tbody>
                                            </table>      
                                        </div>
                                    </div>`;
                    
                } else {
                    trailerHTML = `<div class="col-sm-12 p-0">
                                        <div class="col-sm-4">
                                            <small>Truck:</small>
                                            <select id="vehicle" class="select-multiple-basic" style="width:100%;"></select>
                                        </div>
                                        <div class="col-sm-8" style="word-break: break-word;">
                                            <table class="table mb-0">
                                                <tbody>
                                                    <tr>
                                                        <td class="pt-0" style="border-color: #fff !important;"><small>Trailer</small></td>
                                                        <td class="pt-0" style="border-color: #fff !important;"><small>Cluster</small></td>
                                                        <td class="pt-0" style="border-color: #fff !important;"><small>Base</small></td>
                                                        <td class="pt-0" style="border-color: #fff !important;"><small>Region</small></td>
                                                        <td class="pt-0" style="border-color: #fff !important;"><small>Pallet Type</small></td>
                                                    </tr>
                                                <tr>
                                                    <td class="text-muted" trailer>-</td>
                                                    <td class="text-muted" cluster>-</td>
                                                    <td class="text-muted" base>-</td>
                                                    <td class="text-muted" region>-</td>
                                                    <td class="text-muted" pallet_type>-</td>
                                                </tr>
                                                </tbody>
                                            </table>      
                                        </div>
                                    </div>`;
                }
                if(clientCustom.autoGeneratedId === true){
                    snVisibility = `display:none;`;
                }
                if((clientCustom.previousCheckIns.roles||[]).includes(USER.role)){
                    previousCheckIns = `<div id="previous-checkins-container" style="word-break: break-word;" class="col-sm-7 mb-2">
                                            <div>Truck's Previous Check-Ins (Based on Origin)</div>
                                            <div>
                                                <table id="previous-checkins" class="table mb-0 mt-2">
                                                    <thead>
                                                        <tr>
                                                            <td class="pt-0" style="border-color: #fff !important;">&nbsp;</td>
                                                            <td class="pt-0" style="border-color: #fff !important;"><small>Check-In Time</small></td>
                                                            <td class="pt-0" style="border-color: #fff !important;"><small>Check-Out Time</small></td>
                                                            <td class="pt-0" style="border-color: #fff !important;"><small>Origin</small></td>
                                                            <td class="pt-0" style="border-color: #fff !important;"><small>Destination</small></td>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                </table>
                                            </div>
                                        </div>`;
                }
                return `<div class="page-box row">
                            <div id="error" class="ml-3 mr-3" style="display:none;"></div>
                            <div id="alert" class="col-sm-12"></div>
                            <div id="loading-text" style="display:none;" class="col-sm-12 pb-3">
                                <small class="text-danger"><i class="la la-circle-o-notch la-spin mr-2"></i>Loading data...</small>
                            </div>
                            <div class="col-sm-12 p-0">
                                <div class="col-sm-4" style="${snVisibility}">
                                    <small>Shipment Number:</small>
                                    <input id="shipment_number" type="text" class="form-control" placeholder="Shipment Number" autocomplete="off">
                                    <small class="text-muted" style="font-style: italic;">Once saved, shipment number cannot be edited.</small>
                                </div>
                                <div class="col-sm-4">
                                    <small>Ticket Number:</small>
                                    <input id="ticket_number" class="form-control" type="text" placeholder="Ticket Number" autocomplete="off">
                                    <!--<div class="input-group">
                                        <input id="ticket_number" class="form-control" type="text" placeholder="Ticket Number" autocomplete="off">
                                        <span class="input-group-btn">
                                            <button id="search-ticket-number" class="btn btn-primary" type="button" style="height: 34px;padding: 0px 12px;"><i class="la la-search mr-0" style="font-size: 13px;"></i></button>
                                        </span>
                                    </div>-->
                                </div>
                                <div class="col-sm-4">
                                    <small>Scheduled Date:</small>
                                    <input id="scheduled_date" class="form-control" type="text" onkeydown="event.preventDefault()">
                                </div>
                                <div class="col-sm-4">
                                    <small>Shift Schedule:</small>
                                    <select id="shift_schedule" class="select-multiple-basic" style="width:100%;"></select>
                                </div>
                            </div>
                            <div class="col-sm-12 mt-3 p-0">
                                <div class="col-sm-4">
                                    <small>Origin:</small>
                                    <input id="origin" type="text" class="form-control" autocomplete="off" readonly>
                                </div>
                                <div class="col-sm-5">
                                    <small>Route:</small>
                                    <select id="route" class="select-multiple-basic" style="width:100%;"></select>
                                    <small class="text-muted">Separate origin and destination by comma (,). e.g., Calasiao,BALANGA</small>
                                    <!--<input id="route" type="text" class="form-control ui-autocomplete-input" placeholder="Route" autocomplete="off" readonly>-->
                                </div>
                            </div>
                            <div class="col-sm-12 mt-2">
                                <div class="table-wrapper" style="overflow: auto;">
                                    <div class="table-title">
                                        <small style="line-height: 28px;">Destination:</small>
                                        <!--<button type="button" id="new-destination" class="btn btn-default float-right" style="padding: 4px 10px;top: 0px;position: relative;"><i class="la la-plus"></i> Add Destination</button>-->
                                    </div>
                                    <table id="tbl-destination" class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th class="col-md-6">Location</th>
                                                <th class="col-md-3">Transit Time (HH:MM)</th>
                                                <th class="col-md-3">CICO (HH:MM)</th>
                                                <!--<th>Action</th>-->
                                            </tr>
                                        </thead>
                                        <tbody> </tbody>
                                    </table>
                                </div>
                            </div>
                            ${trailerHTML}
                            ${previousCheckIns}
                            <div class="col-sm-12 p-0 mb-3">
                                <div class="col-sm-4">
                                    <small>Driver:</small>
                                    <select id="driver_id" class="select-multiple-basic" style="width:100%;"></select>
                                </div>
                                <div class="col-sm-4">
                                    <small>Checker:</small>
                                    <select id="checker_id" class="select-multiple-basic" style="width:100%;"></select>
                                </div>
                                <div class="col-sm-4">
                                    <small>Helper:</small>
                                    <select id="helper_id" class="select-multiple-basic" style="width:100%;"></select>
                                </div>
                            </div>
                            <div class="col-sm-12 p-0">
                                <div class="col-sm-7">
                                    <small>Comments:</small>
                                    <textarea id="comments" class="form-control" rows="2"></textarea>
                                </div>
                            </div>
                            <div class="col-sm-7 mt-3">
                                <div class="table-wrapper">
                                    <div class="table-title">
                                        <small style="line-height: 28px;">Attachment:</small>
                                        <input id="new-file" type="file" class="hide">
                                        <button id="new-attachment" type="button" class="btn btn-default float-right" style="padding: 4px 10px;top: -3px;position: relative;"><i class="la la-plus"></i> Add Attachment</button>
                                    </div>
                                    <table id="tbl-attachment" class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th style="width: 35px;">#</th>
                                                <th>Filename</th>
                                                <th style="width: 50px;">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="col-sm-12"><hr></div>
                            <div class="col-sm-12"><button id="submit" type="button" class="btn btn-primary">Update</button></div>
                        </div>`;
            },
            statusUpdate: function(_id){
                var roundtripHTML = "";
                if(clientCustom.roundtrip === true){
                    roundtripHTML = `<span status="onSite" class="col-sm-12 label label-blue label-transparent font-12 cursor-pointer active pb-2 pt-2 mt-1 d-block">ON-SITE</span>
                                    <span status="returning" class="col-sm-12 label label-pink label-transparent font-12 cursor-pointer active pb-2 pt-2 mt-1 d-block">RETURNING</span>`;
                }
                return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                            <div id="small-modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                                <div role="document" class="modal-dialog modal-sm">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                            <h4 class="modal-title" id="myModalLabel2">Update Status</h4>
                                            <small class="text-muted">Shipment Number: <b>${_id}</b></small>
                                            <small id="incomplete-data" class="text-danger d-block"></small>
                                        </div>
                                        <div class="modal-body row">
                                            <div class="col-sm-12 mb-3">
                                                <span status="plan" class="col-sm-12 label label-info label-transparent font-12 inactive cursor-pointer pb-2 pt-2 d-block">PLAN</span>
                                                <span status="assigned" class="col-sm-12 label label-brown label-transparent font-12 inactive cursor-pointer pb-2 pt-2 mt-1 d-block">ASSIGNED</span>
                                                <span status="queueingAtOrigin" class="col-sm-12 label label-warning label-transparent font-12 cursor-pointer active pb-2 pt-2 mt-1 d-block">QUEUEING (ORIGIN)</span>
                                                <span status="processingAtOrigin" class="col-sm-12 label label-lime label-transparent font-12 cursor-pointer active pb-2 pt-2 mt-1 d-block">PROCESSING (ORIGIN)</span>
                                                <span status="idlingAtOrigin" class="col-sm-12 label label-purple label-transparent font-12 cursor-pointer active pb-2 pt-2 mt-1 d-block">IDLING (ORIGIN)</span>
                                                <span status="in_transit" class="col-sm-12 label label-orange label-transparent font-12 cursor-pointer active pb-2 pt-2 mt-1 d-block">IN TRANSIT</span>
                                                ${roundtripHTML}
                                                <span status="complete" class="col-sm-12 label label-success label-transparent font-12 inactive cursor-pointer pb-2 pt-2 mt-1 d-block">COMPLETE</span>
                                                <span status="incomplete" class="col-sm-12 label label-danger label-transparent font-12 inactive cursor-pointer pb-2 pt-2 mt-1 d-block">INCOMPLETE</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
            },
            import: function(){
                return `<div class="page-box row">
                            <div class="col-md-12">
                                <span class="text-muted">Click <a id="download-template-btn" href="javascript:void(0);"class="font-normal">here</a> to download the excel template.</span>
                                <small class="text-info d-block font-italic">Excel Template Updated On: <u>04/21/2021</u></small>
                            </div>
                            <div class="col-md-12"><hr></div>
                            <div class="col-md-6">
                                <input type="file" class="dropify">
                                <button id="import-btn" class="btn btn-primary mt-3">Import</button>
                            </div>
                            <div class="col-md-6">
                                <div>
                                    <h5>Report Import:<small class="float-right"><a id="reportDL" href="#" style="display:none;" target="_blank" download="WRU Dispatch Report.txt">Download report</a></small></h5>
                                    <div>Successful imports: <b class="text-success" success_count>0</b> rows</div>
                                    <div>Warnings:</div>
                                    <ul warning_list></ul>
                                    <div>Unsuccessful imports: <b class="text-danger" error_count>0</b> rows</div>
                                    <div>Errors:</div>
                                    <ul error_list></ul>
                                </div>
                            </div>
                        </div>`;
            },
            fullView: function(_id){
                LIST["dispatch"] = LIST["dispatch"] || [];
                var id_index = LIST["dispatch"].findIndex(x => x._id == _id);
                var obj = LIST["dispatch"][id_index];

                if(id_index > -1){
                    displayModal();
                } else {
                    GET.AJAX({
                        url: `/api/dispatch/${CLIENT.id}/${USER.username}/${_id}`,
                        method: "GET",
                        headers: {
                            "Authorization": SESSION_TOKEN
                        },
                    }, function(docs){
                        obj = docs[0];
                        displayModal();
                    });
                }

                function displayModal() {
                    console.log("view obj",obj);
                    if(obj){
                        var de = new Dispatch(obj);
                        $(`body`).append(de.fullView());
                        $(`.history-details`).css("max-height",$(`.main-details`).outerHeight() + "px");
                    }
                }
            }
        },
        user: {
            create: function(title,obj,user,subtitle){
                var subtitleHTML = (subtitle) ? `<small class="text-muted">${subtitle}</small>` : "";
                var readonly = (obj||user) ? "readonly" : "";
                var finalObj = obj || user || {};
                return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                            <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                                <div role="document" class="modal-dialog modal-md" style="width:700px;">
                                    <div class="modal-content">
                                        <div class="modal-header pb-2">
                                            <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                            <h4 class="modal-title" id="myModalLabel2">${title}</h4>
                                            ${subtitleHTML}
                                        </div>
                                        <div class="modal-body row pt-2">
                                            <div class="col-sm-5 p-0" style="border-right: 1px solid #eee;">
                                                <div id="modal-error"></div>
                                                <div class="col-sm-12">
                                                    <small><span class="text-danger">*</span>Name:</small>
                                                    <input id="name" type="text" class="form-control" value="${(finalObj.name||finalObj.fullName||"")}" placeholder="Name" autocomplete="off" required>
                                                </div>
                                                <div class="col-sm-12">
                                                    <small><span class="text-danger">*</span>Username:</small>
                                                    <input id="username" type="text" class="form-control" value="${finalObj._id||finalObj.username||""}" placeholder="Username" autocomplete="off" ${readonly} required>
                                                </div>
                                                <div class="col-sm-12">
                                                    <small><span class="text-danger">*</span>Email:</small>
                                                    <input id="email" type="email" class="form-control" value="${(finalObj.email||"")}" placeholder="Email" autocomplete="off" required>
                                                </div>
                                                <div class="col-sm-12">
                                                    <small>Phone Number:</small>
                                                    <input id="phoneNumber" type="text" class="form-control" value="${(finalObj.phoneNumber||"")}" autocomplete="off">
                                                </div>
                                                <div class="col-sm-12">
                                                    <small>Role:</small>
                                                    <select id="role" class="form-control" required></select>
                                                </div>
                                                <div class="col-sm-12">
                                                    <small>Auto-logout on Window/Tab Closure:</small>
                                                    <select id="exemptAutoLogout" class="form-control">
                                                        <option value="false">No</option>
                                                        <option value="true">Yes</option>
                                                    </select>
                                                </div>
                                                <div class="col-sm-12"> 
                                                    <button id="submit" type="button" class="btn btn-primary col-sm-12 mt-4">Submit</button>
                                                </div>
                                            </div>
                                            <div clas="col-sm-7">
                                                <div id="priv-title" class="col-sm-7 font-normal mb-2 pb-2" style="border-bottom: 1px solid #eee;">Privileges of User</div>
                                                <div class="col-sm-7" style="max-height: 270px;overflow: auto;">
                                                    <table id="tbl-permission" class="table">
                                                        <thead>
                                                            <tr>
                                                                <th style="width: 60%;">Page</th>
                                                                <th>Read</th>
                                                                <th>Create</th>
                                                                <th>Update</th>
                                                                <th>Delete</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
            }
        },
        changelogs: {
            guide: function(){
                // https://ivanjov.com/short-guide-to-awesome-changelogs/
                var logDescription = {
                    chore: "Changes to the build process or auxiliary tools and libraries such as documentation generation.",
                    feature: "A new feature.",
                    fix: "A bug fix.",
                    improved: "Significant improvements on UI/UX but neither fixes a bug or adds a feature.",
                    other: "Changes in the system that does not fall under the other changelog types.",
                    refactor: "A code change that neither fixes a bug, adds a feature, or provides significant changes/improvements.",
                    release: "A new version release.",
                    style: "Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).",
                },
                othersDescription = {
                    "[PAGE_NAME]": {
                        desc: "Refers to the page/s where changes have been made.",
                        color: "#334fe5"
                    },
                    "(SITE_VERSION)": {
                        desc: "The version of the website. Either a Mobile version or Web version.",
                        color: "#adadad"
                    },
                },
                tbody = "";

                Object.keys(logDescription).forEach(key => {
                    var desc = logDescription[key];
                    tbody += ` <tr>
                                    <td style="font-family: courier;">${key.capitalize()}</td>
                                    <td>${desc}</td>
                                </tr>`;
                });
                tbody += ` <tr>
                                <td style="font-family: courier;">&nbsp;</td>
                                <td>&nbsp;</td>
                            </tr>`;
                Object.keys(othersDescription).forEach(key => {
                    var val = othersDescription[key];
                    tbody += ` <tr>
                                    <td style="font-family: courier;color: ${val.color};">${key}</td>
                                    <td>${val.desc}</td>
                                </tr>`;
                });
                return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                            <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                                <div role="document" class="modal-dialog modal-sm" style="width:500px;">
                                    <div class="modal-content">
                                        <div class="modal-header pb-2">
                                            <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                            <h4 class="modal-title" id="myModalLabel2">Changelog Guide</h4>
                                        </div>
                                        <div class="modal-body row pt-2 pl-4 pr-4">
                                            <table class="table">
                                                <thead>
                                                    <tr>
                                                        <th style="width: 22%;">Title</th>
                                                        <th>Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>${tbody}</tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
            }
        },
        notice: {
            emptyProfile: function(){
                var li = "";
                if(CLIENT.allowDownloadFromOtherDB) {
                    li = `<li>Download Profile From WRU Dispatch - ${CLIENT.allowDownloadFromOtherDB}</li>`;
                }
                return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                                <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                                    <div role="document" class="modal-dialog modal-sm">
                                        <div class="modal-content">
                                            <div class="modal-header pb-2">
                                                <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                                <h5 class="modal-title" id="myModalLabel2">Set up your profile</h5>
                                            </div>
                                            <div class="modal-body row pt-2">
                                                <div class="col-sm-12" style="text-align: justify;">
                                                    Your <b class="text-primary">name</b> and/or <b class="text-primary">email</b> is empty. You can set up your profile by clicking the 'Go to Profile' button below.
                                                    <br><br>
                                                    You will be given the following options in setting up your profile:
                                                    <ul style="padding-left: 20px;">
                                                        <li>Download Profile From WRU Main</li>${li}
                                                        <li>Manually edit your profile details</li>
                                                    </ul>
                                                    <div id="empty_profile" type="button" class="btn btn-primary col-sm-12 mt-3" style="width:100%;">Go to Profile</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
            },
            browserNotSupported: function(){
                return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                        <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                            <div role="document" class="modal-dialog modal-sm">
                                <div class="modal-content">
                                    <div class="modal-header p-0" style="background: #00a548">                                         
                                        <img src="https://www.pngkit.com/png/full/150-1507719_png-file-frown.png" style="width: 100px;padding: 25px;margin: auto;display: block;filter: invert();image-rendering: -webkit-optimize-contrast;">
                                    </div>
                                    <div class="modal-body row pt-2">
                                        <div class="col-sm-12" style="text-align: center;">
                                            <h5>Browser version is not supported</h5>
                                            We're very sorry but the version of this browser is not supported. We recommend updating your browser, or try using other browsers such as Google Chrome, Firefox, or Microsoft Edge.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
            },
            sessionTimeout: function(){
                return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;">
                                <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                                    <div role="document" class="modal-dialog modal-sm">
                                        <div class="modal-content">
                                            <div class="modal-header pb-2">
                                                <h5 class="modal-title" id="myModalLabel2">You have been idle</h5>
                                            </div>
                                            <div class="modal-body row pt-2">
                                                <div class="col-sm-12">This page is being timed out due to inactivity for over 30 minutes. Please refresh the page.</div>
                                                <div class="col-sm-12"> 
                                                    <button type="button" class="btn btn-primary col-sm-12 mt-2" onClick="window.location.reload();">Refresh</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
            }
        }
    };
}
const mobileOptions = new function(){
    return {
        notifications: {
            filter: function(){
                return `<div style="height: 30px;border-bottom: 1px solid #eee;box-shadow: 1px 1px 8px -6px black;position: fixed;width: 100%;z-index: 9;background: white;top: 40px;" class="dt-buttons pl-3">
                            <button id="refresh-toggle" tabindex="0" aria-controls="tbl-notifications" type="button" data-toggle="tooltip" data-original-title="Refresh Table" style="float: left;color: green;border: none;background: none;font-size: 16px;padding: 0px 10px 0px 0px !important;font-weight: bold;" class="dt-button m-0">
                                <span><i title="Refresh Table" class="la la-refresh"></i></span>
                            </button>
                            <button id="filter-toggle" class="dt-button" tabindex="0" aria-controls="tbl-notifications" type="button" data-toggle="tooltip" data-original-title="Filter" style="float: left;color: green;border: none;border-top-width: medium;border-right-width: medium;border-bottom-width: medium;border-left-width: medium;background: none;font-size: 16px;padding: 0px 10px 0px 8px !important;font-weight: bold;">
                                <span><i class="la la-filter" title="Filter"></i></span>
                            </button>
                        </div>`;
            }
        }
    };
};
/************** END VIEWS **************/

if(s == "m"){
    (ENVIRONMENT == "development") ? null : LOGGER.disableLogger();
    WEBSOCKET.connect().then(() => {
        SESSION_FROM_DB(function(){
            PAGE.MAIN.FUNCTION.init();
        },function(){
            LOGOUT();
        });
    });
}