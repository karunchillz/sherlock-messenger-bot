var request = require('request');
var querystring = require('querystring');

var WCToken = '';
var orderId = '';

// Login User
module.exports.loginUser = function loginUser() {
  console.log('loginUser');

  var body = {
	"logonId": "testing10@a.com",
	"logonPassword": "testing10"
  };

  request({
    url: 'http://182.71.233.89/wcs/resources/store/10851/loginidentity',
	headers: {
      'Content-Type': 'application/json'
    },    
    method: 'POST',
    json: body
  }, function(error, response, body) {
    if (!error) {
      console.log('Success sending message: ', response);
      WCToken = response.WCToken;
      addToCart(catentryId);
    } else {
      console.log('Error sending message: ', error);
    }
  });
};

function addToCart(catentryId) {
  console.log('addToCart '+WCToken,catentryId);
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
      console.log('Success sending message: ', response);
      orderId = response.orderId;
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
      console.log('Success sending message: ', response);
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
      console.log('Success sending message: ', response);
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
      console.log('Success sending message: ', response);
    } else {
      console.log('Error sending message: ', error);
    }
  });
}