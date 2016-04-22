var request = require('request');

var WCToken = '';
var orderId = '';

// Login User
module.exports.loginUser = function loginUser() {
  console.log('loginUser');
  request({
    url: 'http://182.71.233.89/wcs/resources/store/10851/loginidentity',
	headers: {
      'Content-Type': 'application/json'
    },    
    method: 'POST',
    body: {
    	"logonId": "testing10@a.com",
		"logonPassword": "testing10"
    }
  }, function(error, response, body) {
    if (!error) {
      console.log('Success sending message: ', response);
      WCToken = response.WCToken;
    } else {
      console.log('Error sending message: ', error);
    }
  });
};

// Add to Cart
module.exports.addToCart = function addToCart(catentryId) {
  console.log('addToCart ',catentryId);
  request({
    url: 'http://182.71.233.89/wcs/resources/store/10851/cart?responseFormat=json',
	headers: {
      'Content-Type': 'application/json',
      'WCToken': WCToken
    },    
    method: 'POST',
    body: {
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
    } else {
      console.log('Error sending message: ', error);
    }
  });
};

// Apply Checkout Profile
module.exports.applyCheckoutProfile = applyCheckoutProfile() {
  console.log('applyCheckoutProfile ',orderId);
  request({
    url: 'http://182.71.233.89/wcs/resources/store/10851/cart/@self/applyCheckoutProfile',
	headers: {
      'Content-Type': 'application/json',
      'WCToken': WCToken
    },    
    method: 'PUT',
    body: {
		"orderId": orderId
    }
  }, function(error, response, body) {
    if (!error) {
      console.log('Success sending message: ', response);
    } else {
      console.log('Error sending message: ', error);
    }
  });
};

// Pre Checkout
module.exports.preCheckout = function preCheckout() {
  console.log('preCheckout ',orderId);
  request({
    url: 'http://182.71.233.89/wcs/resources/store/10851/cart/@self/precheckout',
	headers: {
      'Content-Type': 'application/json',
      'WCToken': WCToken
    },    
    method: 'PUT',
    body: {
		"orderId": orderId
    }
  }, function(error, response, body) {
    if (!error) {
      console.log('Success sending message: ', response);
    } else {
      console.log('Error sending message: ', error);
    }
  });
};

// Checkout
module.exports.checkout = function checkout() {
  console.log('checkout ',orderId);
  request({
    url: 'http://182.71.233.89/wcs/resources/store/10851/cart/@self/checkout?responseFormat=json',
	headers: {
      'Content-Type': 'application/json',
      'WCToken': WCToken
    },    
    method: 'POST',
    body: {
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
};