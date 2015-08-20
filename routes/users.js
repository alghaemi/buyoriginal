var express = require('express');
var router = express.Router();

/*
 * Business Users
 */
 router.get('/business/userlist', function(req, res) {
    var db = req.db;
    db.collection('business_users').find().toArray(function (err, items) {
        res.json(items);
    });
});

router.get('/business/validateemail/:email', function(req, res) {
    var db = req.db;
    var email = req.params.email;
    db.collection('business_users').find({buEmail:email.toString()}).toArray(function (err, items) {
        if (items.length==0){
        	res.send(JSON.stringify({ "duplicate": "false"}));
        }
        else {
        	res.send(JSON.stringify({ "duplicate": "true"}));
        }
    });
});


router.post('/business/login', function(req, res) {
    var db = req.db;
    var email = req.body.email;
    var password = req.body.password;
    
    //res.send('succesful');
    
    db.collection('business_users').find({buEmail:email.toString()}).toArray(function (err, doc) {
        if (doc.length==0){
        	var array = [{ "err": "err_invalid_email"}];
            res.json(array);       
        }
        else {
            console.log('doc.buPassword='+doc[0].buPassword+' password='+password);
        	if (doc[0].buPassword==password){	   
        		
            	db.collection('stores').findOne({sId:doc.sId.toString()}, function (sErr, sDoc) {
            		if (sErr!=null){
            			var array = [{ "err": "err_store_unavailable"}];
    					res.json(array);
            		}
            		else {
            		    var profile = {
        							  'buId': doc.buId,
        							  'buEmail':doc.buEmail,
        							  'buPassword':doc.buPassword,
        							  'buCityName':doc.buCityName,
        							  'buCityNameFa':doc.buCityNameFa,
        						      'buBrandId':doc.buBrandId,
        							  'buBrandName':doc.buBrandName,
        							  'buBrandCategory':doc.buBrandCategory,
        							  'buStoreName':doc.buStoreName,
        							  'buStoreAddress':doc.buStoreAddress,
        							  'buStoreHours':doc.buStoreHours,
        							  'buDistributor':doc.buDistributor,
        							  'buStoreLat':doc.buStoreLat,
        							  'buStoreLon':doc.buStoreLon,
        							  'buAreaCode':doc.buAreaCode,
        							  'buTel':doc.buTel,
        							  'buStoreId':doc.sId,
        							  'buBrandLogoName':doc.buBrandLogoName,
        							  'dStartDate': sDoc.dStartDate,
        							  'dEndDate': sDoc.dEndDate,
        							  'dStartDateFa': sDoc.dStartDateFa,
        							  'dEndDateFa': sDoc.dEndDateFa,
        							  'dPrecentage': sDoc.dPrecentage,
        							  'dNote': sDoc.dNote
        							  }
            		
            			res.json(profile);	
            			
            		}
            	}       
        	}
        	else {
        		var array = [{ "err": "err_invalid_password"}];
    			res.json(array);       
        	}
        }
    });
});



 
router.post('/business/adduser', function(req, res) {
    console.log('/business/adduser');
    var db = req.db;
    var buId = 0;
    var sId = 0;
    var error=null;
    
    // 1) Find Stats
    db.collection('stats').findOne({},function (err,doc) {
        
        if (err!=null)
        	error = err;
        	 
        if (doc){
            sId=(parseInt(doc.numStores)+1).toString();
            buId=(parseInt(doc.numBusinessUsers)+1).toString();
            
        	console.log('add user: sId'+sId + ' business user id'+buId);
        	
        	// 2) Add new user	
        	var newUser = {
        		'buId': buId,
        		'buEmail':req.body.buEmail,
        		'buPassword':req.body.buPassword,
        		'buCityName':req.body.buCityName,
        		'buCityNameFa':req.body.buCityNameFa,
        		'buBrandId':req.body.buBrandId,
        		'buBrandName':req.body.buBrandName,
        		'buBrandCategory':req.body.buBrandCategory,
        		'buStoreName':req.body.buStoreName,
        		'buStoreAddress':req.body.buStoreAddress,
        		'buStoreHours':req.body.buStoreHours,
        		'buDistributor':req.body.buDistributor,
        		'buStoreLat':req.body.buStoreLat,
        		'buStoreLon':req.body.buStoreLon,
        		'buAreaCode':req.body.buAreaCode,
        		'buTel':req.body.buTel,
        		'buStoreId':sId,
        		'buBrandLogoName':req.body.buBrandLogoName
    		}
    
    		db.collection('business_users').insert(newUser, function(err, result){
        		if (err === null) {
        			console.log('new user doc added');
        		   
        		    // 3) Add store
        			var newStore = {
        				'bId': req.body.buBrandId,
        				'sId':sId,
        				'sName':req.body.buStoreName,
        				'bName':req.body.buBrandName,
        			    'bCategory':req.body.buBrandCategory,
        			    'bDistributor':req.body.buDistributor,
        			    'sCity':req.body.buCity,
        			    'sAddress':req.body.buStoreAddress,
        			    'sHours':req.body.buStoreHours,
        			    'sAreaCode':req.body.buAreaCode,
        			    'sTel1':req.body.buTel,
        			    'sTel2':'',
        			    'sLat':req.body.buStoreLat,
        			    'sLong':req.body.buStoreLon,
        			    'sVerified':'No',
        			    'bLogo':req.body.buBrandLogoName
    				}
        	
        			db.collection('stores').insert(newStore, function(err, result){
        			if (err === null) {
        				console.log('new store doc added');
        				
        				// 4) Update Stats
        				doc.numBusinessUsers=buId;
        				doc.numStores=sId;
        				db.collection('stats').update({},doc, function (err,result){
        					if (err === null) {
        						console.log('stats updated');
        					}
        					else {
        						error = err;
        					}
        				});
        			}
        			else {
        				error=err;
        			}
        		
    			});	
        	}
        	else {
        		error = err;
        	}
        });
      }
    });	
    
    if (error != null){
    	var array = [{ "result": "failed"}];
    	res.json(array);
    }
    else {
    	var array = [{ "result": "success"}];
        res.json(array); 
    }
});




/*
 * GET userlist.
 */
router.get('/userlist', function(req, res) {
    var db = req.db;
    db.collection('userlist').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    db.collection('userlist').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('userlist').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;
