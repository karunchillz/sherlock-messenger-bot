var restify = require('restify');
var request = require('request');
var server = restify.createServer();
var commerceUtility = require('./commerce/commerceUtility');

var token = '';

server.use(restify.bodyParser());

server.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'ck_test_bot_verfiy_token_123') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
  return next();
});

server.post('/webhook/', function (req, res) {
  console.log('Inside POST /webhook/');
  messaging_events = req.body.entry[0].messaging;
  console.log('req body '+JSON.stringify(req.body));
  for (j = 0; j < messaging_events.length; j++) {
  	event = req.body.entry[0].messaging[j];
    console.log('event '+JSON.stringify(event));
  }
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    console.log('event '+JSON.stringify(event));
    sender = event.sender.id;
    if (event.message && event.message.text) {
      console.log('Inside event message');
      //sendGenericMessage(sender);
      text = event.message.text;
      console.log('text '+text);
      if (text == 'Generic') {
      	console.log('Inside Generic '+text);
    	  sendGenericMessage(sender);
    	  continue;
  	  }else if(text == 'Asdf'){
  	  	console.log('Inside Hi '+text);
        sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200)); 	
        continue;  	
  	  }else if (text === 'Hello1234') {
        sendTextMessage(sender, text.substring(0, 200));
        delete sessions[sessionId];
      }else {
        const sessionId = findOrCreateSession(sender);
        /*client.message(text, (error, data) => {
          if (error) {
            console.log('Oops! Got an error: ' + error);
          } else {
            console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
            
          }
        });*/
        wit.runActions(sessionId, text, sessions[sessionId].context, (error, context) => {
          if (error) console.log(error);
        });
      }
    }
    if (event.postback) {
    	text = JSON.stringify(event.postback.payload).replace('"','').replace('"','');
      console.log("product id that customer wants to buy = "+text);
      var catentryId = text.split(' ')[2];
      commerceUtility.loginUser(catentryId,'');
      const session_id = findOrCreateSession(sender);
      wit.runActions(session_id, text, sessions[session_id].context, (error, context) => {
          if (error) console.log(error);
      });
      //sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
    	continue;
    }  
  }

  res.send(200);
  return next();
});

server.listen((process.env.PORT || 5000), function() {	
  console.log('Node app is running on port',(process.env.PORT || 5000));
});


function sendTextMessage(sender, text) {
  console.log('Send Text Message'+text);
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}





function sendReceiptTemplate(sender){
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "receipt",
        "recipient_name": "Stephane Crozatier",
        "order_number": "1234",
        "currency": "USD",
        "payment_method": "Visa 2345",
        "order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
        "timestamp": "1428444852",
        "elements": [{
          "title": "Classic White T-Shirt",
          "subtitle": "100% Soft and Luxurious Cotton",
          "quantity": 2,
          "price": 50,
          "currency": "USD",
          "image_url": "http://petersapparel.parseapp.com/img/whiteshirt.png"
        }, {
          "title": "Classic Gray T-Shirt",
          "subtitle": "100% Soft and Luxurious Cotton",
          "quantity": 1,
          "price": 25,
          "currency": "USD",
          "image_url": "http://petersapparel.parseapp.com/img/grayshirt.png"
        }],
        "address": {
          "street_1": "1 Hacker Way",
          "street_2": "",
          "city": "Menlo Park",
          "postal_code": "94025",
          "state": "CA",
          "country": "US"
        },
        "summary": {
          "subtotal": 75.00,
          "shipping_cost": 4.95,
          "total_tax": 6.19,
          "total_cost": 56.14
        },
        "adjustments": [{
          "name": "New Customer Discount",
          "amount": 20
        }, {
          "name": "$10 Off Coupon",
          "amount": 10
        }]
      }
    }
  };

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });

}

const WIT_TOKEN = "";
const Wit = require('node-wit').Wit;
const uuid = require('node-uuid');

const HERE = {
  id:"",
  code: "",
}

const currentLocation = { //Fort Mason
  Latitude: 37.80524,
  Longitude: -122.42818
}

const sessions = {};

const actions = {
  say: (sessionId,context, msg, cb) => {
    const recipient = sessions[sessionId].fbid;
    if (recipient) {
      sendTextMessage(recipient, msg); 
        cb();
    } else {
      cb();
    }
  },
  merge: (sessionId, context, entities, message, cb) => {
    console.log("entities merge = %o",entities);
    const elocation = firstEntityValue(entities, 'location');
    const emode = firstEntityValue(entities, 'mode');
    if (elocation) context.location = elocation;
    if (emode) context.mode = emode;
    if(entities.product){
      var category = entities.product[0].value;
      var categoryMap = {
        "tops" : "10007",
        "dresses" : "10006",
        "shoes" : "10011",
        "sweaters" : "10008",
        "handbags" : "10012"
      };
      context.categoryId = categoryMap[category];
    }
    cb(context);
  },
  fetchTraffic: (sessionId, context, cb) => {
    // Here should go the api call, e.g.:
    getTraffic(context.location,context.mode,(time,error) => {
      context.travel_time = time;
      cb(context);
    });
  },
  sendDresses: (sessionId, context, cb) => {
    // Here should go the api call, e.g.:
    console.log("categoryId = %o",context.categoryId);
    const sender = sessions[sessionId].fbid;
    commerceUtility.loginUser('',context.categoryId,sender);
    console.log("sender = %o",sender);
    cb(context);
  }, 
  sendReceipt: (sessionId, context, cb) => {
    // Here should go the api call, e.g.:
    const sender = sessions[sessionId].fbid;
    sendReceiptTemplate(sender);
    cb(context);
  }, 
  error: (sessionId, context, msg) => {
    const recipient = sessions[sessionId].fbid;
    if (recipient) {
      sendTextMessage(recipient, 'Oops, I don\'t know what to do.');
    }
  },
};

const wit = new Wit(WIT_TOKEN, actions);
const client = new Wit(WIT_TOKEN, actions);

const findOrCreateSession = (fbid) => {
  var sessionId;
  for (const key in sessions) {
    if (sessions.hasOwnProperty(key)) {
      if (sessions[key].fbid == fbid) {
        sessionId = key;
        break;
      }
    }
  }
  if (!sessionId) {
    sessionId = uuid.v1();
    sessions[sessionId] = { fbid: fbid, context: {}};
  }
  return sessionId;
};

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const getGeoLoc = (location, callback) => {
  if(location === undefined)
    callback(undefined, "no location captured");
  else {
    request({
        url: 'https://geocoder.cit.api.here.com/6.2/geocode.json',
        qs: {app_id: HERE.id,
           app_code: HERE.code,
           gen:9,
           city: 'San Francisco',
           searchText: location.replace(/ /g, '+')},
           method: 'GET',
           json: true,
    }, function(error, response, body){
        if(error) {
            callback(undefined, error);
        } else {
            callback(body.Response.View[0].Result[0].Location.DisplayPosition);

        }
    });
  }
}

const getTravelTime = (from, to, mode, callback) => {
  var traffic_mode = mode
  if (mode === undefined) {
    traffic_mode = "car";
  }
  request({
      url: 'https://route.cit.api.here.com/routing/7.2/calculateroute.json',
      qs: {app_id: HERE.id,
         app_code: HERE.code,
         mode: "fastest;"+traffic_mode+";traffic:enabled",
         waypoint0: "geo!"+ from.Latitude + ','+ from.Longitude,
         waypoint1: "geo!"+ to.Latitude + ','+ to.Longitude},
         method: 'GET',
         json: true,
  }, function(error, response, body){
      if(error) {
          callback(undefined, error);
      } else {
        if(body.response)
            callback(body.response.route[0].summary.travelTime);
          else
            callback(undefined,JSON.stringify(body));   
      }
  });
}

const getTraffic = (destination, mode, callback) => {
  getGeoLoc(destination,(displayPosition,error)=> {
    if(!error)
      getTravelTime(currentLocation,displayPosition, mode,(travelTime,error) => {
        if(!error) {
          //console.log('It will take ' + Math.ceil(trafficTime/60) + 'min to go to ' + destination)
          callback(Math.ceil(travelTime/60));
        }
        else
          callback(undefined, error);
      });
    else
      callback(undefined, error);
  });
}




