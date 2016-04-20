var restify = require('restify');
var request = require('request');
var server = restify.createServer();

var token = 'CAAO6UiNCn1MBACFaHgqZCnYMNhfkrBL5uFm16rZBBxtcNlw1j5kZA15yWab5TStnqoLnNNGkqsUrhv7FmPeoCUTA0l8dhZCc0oE4pRU2iKBdG0d3qcxUVeX1biRbhxLbtEi9Hh2DQ40wh2eBGQ4VcSZAmvhRLiMNkBkwusrNcqa6XeYzGAdPxMkWp4BWY9CIZD';

server.use(restify.bodyParser());

server.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'ck_test_bot_verfiy_token_123') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

server.post('/webhook/', function (req, res) {
  console.log('Inside POST /webhook/');
  messaging_events = req.body.entry[0].messaging;
  console.log('event '+messaging_events.length);
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    console.log('event ');
    sender = event.sender.id;
    if (event.message && event.message.text) {
      console.log('text ');
      text = event.message.text;
      sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
      // Handle a text message from this sender
    }  
  }
  res.sendStatus(200);
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




