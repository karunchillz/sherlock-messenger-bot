var restify = require('restify');
var request = require('request');
var server = restify.createServer();

var token = 'CAAO6UiNCn1MBACFaHgqZCnYMNhfkrBL5uFm16rZBBxtcNlw1j5kZA15yWab5TStnqoLnNNGkqsUrhv7FmPeoCUTA0l8dhZCc0oE4pRU2iKBdG0d3qcxUVeX1biRbhxLbtEi9Hh2DQ40wh2eBGQ4VcSZAmvhRLiMNkBkwusrNcqa6XeYzGAdPxMkWp4BWY9CIZD';
//var token = "CAAInkXlV7uwBAEkeVh9pY6JrMXipvTXVOrP2GO7tdi0SLO8VaXvfgnyBuKSOoVzTd93HacICtwJZCbFD8x6WRQUsvOdf0m3ZC5j5o2wk9dMtoy8WRK6ZBzrajspAsyq3fFku1FH324R4SIwqL3fH5iZCGqjDAZCvHbsdxU4qrPfLnIwMnQUp3BfO0rR8c85S8obaUdtNVPgZDZD";

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
        wit.runActions(sessionId, text, sessions[sessionId].context, (error, context) => {
          if (error) console.log(error);
        });
      }
    }
    if (event.postback) {
    	text = JSON.stringify(event.postback);
    	sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
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

function sendGenericMessage(sender) {
   console.log('Send Generice Text Message');
  /*messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };*/

  messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
          {
            "title":"Modern Half Sleeve T-Shirt (Amazon)",
            "image_url":"http://ecx.images-amazon.com/images/I/41g-GBNzRZL._SL511_SX393_CR0,0,393,511_FMwebp_QL65_.jpg",
            "subtitle":"Tinted Men's Solid Henley Half Sleeve T-Shirt",
            "buttons":[
              {
                "type":"web_url",
                "url":"http://www.amazon.in/Tinted-Button-Cotton-T-Shirt-TJ106RH-ANTHERA-M_Grey_Medium/dp/B00ZUSO0EO/ref=sr_1_1?s=apparel&ie=UTF8&qid=1461120859&sr=1-1&keywords=tshirts",
                "title":"Change Specs"
              },
              {
                "type":"postback",
                "title":"Buy Now",
                "payload":"Buy now"
              },
              {
                "type":"postback",
                "title":"View Details",
                "payload":"USER_DEFINED_PAYLOAD_FOR_ITEM100"
              }              
            ]
          },
          {
            "title":"Classic Grey Full Sleeve T-Shirt (Amazon)",
            "image_url":"http://ecx.images-amazon.com/images/I/4121Hb7NP7L._SL500_SX385_CR0,0,385,500_FMwebp_QL65_.jpg",
            "subtitle":"IZINC Men's Raglan Neck Full Sleeve Cotton T-Shirt",
            "buttons":[
              {
                "type":"web_url",
                "url":"http://www.amazon.in/IZINC-Raglan-T-Shirt-IZINC-CREW-REGLAN-FULL-DARKGREY-S_Dark-Grey_Small/dp/B014IQNJ1I/ref=sr_1_2?s=apparel&ie=UTF8&qid=1461120859&sr=1-2&keywords=tshirts",
                "title":"Change Specs"
              },
              {
                "type":"postback",
                "title":"Buy Now",
                "payload":"Buy Now"
              },
              {
                "type":"postback",
                "title":"Bookmark Item",
                "payload":"USER_DEFINED_PAYLOAD_FOR_ITEM101"
              }              
            ]
          }
        ]
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

//const WIT_TOKEN = "KMG23FM4RVSUDOUJ2FB3V4GYZJADLIRJ";
const WIT_TOKEN = "S7YRFBMNSY6JEJJTKO2EJKZ4SFJBQ4VT";
const Wit = require('node-wit').Wit;
const uuid = require('node-uuid');

const HERE = {
  id:"xqatBOxmf61Jv8AzLoS9",
  code: "EopBF0eLNTAcVNzo297DDA",
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
    const elocation = firstEntityValue(entities, 'location');
    const emode = firstEntityValue(entities, 'mode');
    if (elocation) context.location = elocation;
    if (emode) context.mode = emode;
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
    const sender = sessions[sessionId].fbid;
    sendGenericMessage(sender);
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




