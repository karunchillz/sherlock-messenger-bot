var request = require('request');
var querystring = require('querystring');

var WCToken = '';
var orderId = '';

module.exports.orderId = orderId;
// Login User
module.exports.loginUser = function loginUser(catentryId) {
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
	      addToCart(catentryId);
	    } else {
	      console.log('Error sending message: ', error);
	    }
	  });
  }else{
  	console.log('Else ');
  	addToCart(catentryId);
  }


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