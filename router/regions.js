const express = require('express');
const router = express.Router();
const Joi = require('joi');

const schema = require("../utils/schema");
const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "regions";

// get all
router.get('/:dbName/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const filter = JSON.parse(req.params.filter);
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const query = db.getCollection(dbName,collection).find(filter).skip(skip).limit(limit);

    query.toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            if(docs.length < auth.LIMIT){
                console.log(`CLOSE {${collection}} @`,docs.length);
                query.close();
            }
            res.json(docs);
        }
    });
});

// get count
router.get('/:dbName/:username/all/:filter/count', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const filter = JSON.parse(req.params.filter) || {};

    db.getCollection(dbName,collection).find(filter).count({}, function(err, numOfDocs){
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        
        res.json(numOfDocs);
    });
});

// post
router.post('/:dbName/:username', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const userInput = req.body;

    Joi.validate(userInput,schema[collection](),(err,result)=>{
        if(err){
            next(_ERROR_.UNPROCESSABLE_ENTITY(err));
        } else {
            userInput.created_by = username;
            userInput.created_on = new Date().toISOString();
            db.getCollection(dbName,collection).insertOne(userInput,(err,result)=>{
                if(err) next(_ERROR_.INTERNAL_SERVER(err));
                else res.json({ok:1});
            });
        }
    });
});

// put
router.put('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const username = req.params.username;
    const userInput = req.body;

    db.getCollection(dbName,collection).findOneAndUpdate({_id: db.getPrimaryKey(_id)},{$set: userInput},{returnOriginal: false,upsert: true},(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json({ok:1});
    });
});

// delete
router.delete('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const username = req.params.username; // not included yet in filter
    const filter = {_id: db.getPrimaryKey(_id)}; // NEVER LEAVE EMPTY! Will affect all

    db.getCollection(dbName,collection).findOneAndDelete(filter,(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            var childPromise = [];
            childPromise.push(db.getCollection(dbName,"clusters").deleteMany({region_id: db.getPrimaryKey(_id)}));
            childPromise.push(db.getCollection(dbName,"geofences").deleteMany({region_id: db.getPrimaryKey(_id)}));

            Promise.all(childPromise).then(result => { 
                db.getCollectionOtherDB(`${dbName}-logging`,"user_action").insertOne({
                    action:"delete",
                    timestamp: new Date().toISOString(),
                    unique_filter: `_id: ${_id}`,
                    remarks: `Deleted clusters: ${result[0].deletedCount}  |  Deleted geofences: ${result[1].deletedCount}`,
                    data: JSON.stringify(docs.value),
                    collection,
                    username
                }).then(() => {
                    res.json({ok:1});
                }).catch(err => { next(_ERROR_.INTERNAL_SERVER(err)); });
            }).catch(error => { 
                next(_ERROR_.INTERNAL_SERVER(error)); 
            });
        }
    });
});

module.exports = router;