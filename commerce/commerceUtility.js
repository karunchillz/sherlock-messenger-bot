var request = require('request');
var querystring = require('querystring');
var token = 'CAAO6UiNCn1MBACFaHgqZCnYMNhfkrBL5uFm16rZBBxtcNlw1j5kZA15yWab5TStnqoLnNNGkqsUrhv7FmPeoCUTA0l8dhZCc0oE4pRU2iKBdG0d3qcxUVeX1biRbhxLbtEi9Hh2DQ40wh2eBGQ4VcSZAmvhRLiMNkBkwusrNcqa6XeYzGAdPxMkWp4BWY9CIZD';


var WCToken = '';
var orderId = '';
var productId = '';
var productsMap = [];

module.exports.orderId = orderId;

module.exports.productId = productId;

module.exports.productsMap = productsMap;

// Login User
module.exports.loginUser = function loginUser(catentryId,categoryId,sender) {
  console.log('loginUser ',catentryId);

  var body = {
	"logonId": "testing10@a.com",
	"logonPassword": "testing10"
  };

  if(WCToken == ''){
	  request({
	    url: 'http://182.71.233.89/wcs/resources/store/10851/loginidentity',
		headers: {
	      'Content-Type': 'application/json'
	    },    
	    method: 'POST',
	    json: body
	  }, function(error, response, body) {
	    if (!error) {
	      console.log('Success loginUser ');
	      WCToken = body.WCToken;
	      console.log('WCToken ',WCToken);
	      if(catentryId == ''){
    		getProducts(categoryId, sender);
	      }else{
	      	productId = catentryId;
	      	addToCart(catentryId);
	      }
	    } else {
	      console.log('Error sending message: ', error);
	    }
	  });
  }else{
  	console.log('Else ');
    if(catentryId == ''){
    	getProducts(categoryId, sender);
    }else{
      productId = catentryId;
  	  addToCart(catentryId);
    }
  }

};

//Get Category
function getProducts(categoryId, sender){

  console.log('getCategory '+categoryId);
  console.log('sender id '+sender);

  request({
    url: 'http://182.71.233.89/wcs/resources/store/10851/productview/byCategory/'+categoryId,
	headers: {
      'Content-Type': 'application/json',
      'WCToken': WCToken
    },
    method: 'GET'
  }, function(error, response, body) {
    if (!error) {
      console.log('Success getProducts');
		var catentryArray = JSON.parse(body).CatalogEntryView;
    console.log('recordSetTotal',catentryArray);
		for (var i = 0; i < 5; i++) {
      console.log('catentryArray[i].name'+catentryArray[i].name);
      console.log('catentryArray[i].shortDescription'+catentryArray[i].shortDescription);
      console.log('catentryArray[i].Price[0].priceValue'+catentryArray[i].Price[0].priceValue);
      console.log('http://182.71.233.89'+catentryArray[i].thumbnail);
      console.log('catentryArray[i].uniqueID'+catentryArray[i].uniqueID);
			productsMap.push({
				title : catentryArray[i].name,
				subtitle : catentryArray[i].shortDescription,
				price : catentryArray[i].Price[0].priceValue,
				image : 'http://182.71.233.89'+catentryArray[i].thumbnail,
				id : catentryArray[i].uniqueID
			});
		}
		console.log('productsMap '+productsMap);
    sendGenericMessage(sender);
    } else {
      console.log('Error sending message: ', error);
    }
  });	
	
};

function addToCart(catentryId) {
  console.log('addToCart ',catentryId);
  request({
    url: 'http://182.71.233.89/wcs/resources/store/10851/cart?responseFormat=json',
	headers: {
      'Content-Type': 'application/json',
      'WCToken': WCToken
    },    
    method: 'POST',
    json: {
		"orderId": ".",
		"orderItem": [
			{
				"productId": catentryId,
				"quantity": "1"
			}
		],
		"x_calculateOrder": "0",
		"x_inventoryValidation": "true"
    }
  }, function(error, response, body) {
    if (!error) {
      console.log('Success addToCart',body);
      orderId = body.orderId;
      console.log('orderId ',orderId);
      applyCheckoutProfile();
    } else {
      console.log('Error sending message: ', error);
    }
  });
}

function applyCheckoutProfile() {
  console.log('applyCheckoutProfile ',orderId);
  request({
    url: 'http://182.71.233.89/wcs/resources/store/10851/cart/@self/applyCheckoutProfile',
	headers: {
      'Content-Type': 'application/json',
      'WCToken': WCToken
    },    
    method: 'PUT',
    json: {
		"orderId": orderId
    }
  }, function(error, response, body) {
    if (!error) {
      console.log('Success applyCheckoutProfile');
      preCheckout();
    } else {
      console.log('Error sending message: ', error);
    }
  });
}

function preCheckout() {
  console.log('preCheckout ',orderId);
  request({
    url: 'http://182.71.233.89/wcs/resources/store/10851/cart/@self/precheckout',
	headers: {
      'Content-Type': 'application/json',
      'WCToken': WCToken
    },    
    method: 'PUT',
    json: {
		"orderId": orderId
    }
  }, function(error, response, body) {
    if (!error) {
      console.log('Success preCheckout'); 
      checkout();
    } else {
      console.log('Error sending message: ', error);
    }
  });
}

function checkout() {
  console.log('checkout ',orderId);
  request({
    url: 'http://182.71.233.89/wcs/resources/store/10851/cart/@self/checkout?responseFormat=json',
	headers: {
      'Content-Type': 'application/json',
      'WCToken': WCToken
    },    
    method: 'POST',
    json: {
		"catalogId": "10052",
		"langId": "-1",
		"notifyMerchant": "1",
		"notifyOrderSubmitted": "1",
		"notifyShopper": "1",
		"notify_EMailSender_recipient": "testing10@mailinator.com",
		"orderId": orderId,
		"purchaseorder_id": "",
		"storeId": "10851"
	}
  }, function(error, response, body) {
    if (!error) {
      console.log('Success checkout');
    } else {
      console.log('Error sending message: ', error);
    }
  });
}

function sendGenericMessage(sender) {
  
  console.log('Send Generice Text Message');
  
  console.log("products = %o",productsMap);
  
  var messageData = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements":[]
        }
      }
  };

  for(var i=0; i<5; i++){
    var item = {
      "title": productsMap[i].title,
      "subtitle": productsMap[i].subtitle + "\n Price : $" + productsMap[i].price ,
      "image_url": "",
      "buttons":[
          {
            "type":"postback",
            "title":"Change Specs",
            "payload":""+productsMap[i].id
          },
          {
            "type":"postback",
            "title":"Buy Now",
            "payload":"Buy now "+productsMap[i].id
          },
          {
            "type":"postback",
            "title":"View Details",
            "payload":""+productsMap[i].id
          }              
      ]
    }
    messageData.attachment.payload.elements.push(item);
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