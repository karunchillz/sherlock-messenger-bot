var request = require('request');
var querystring = require('querystring');
var token = 'CAAO6UiNCn1MBACFaHgqZCnYMNhfkrBL5uFm16rZBBxtcNlw1j5kZA15yWab5TStnqoLnNNGkqsUrhv7FmPeoCUTA0l8dhZCc0oE4pRU2iKBdG0d3qcxUVeX1biRbhxLbtEi9Hh2DQ40wh2eBGQ4VcSZAmvhRLiMNkBkwusrNcqa6XeYzGAdPxMkWp4BWY9CIZD';


var WCToken = '';
var orderId = '';
var productId = '';
var skuId = '';
var productsMap = [];
var senderId = '';

module.exports.orderId = orderId;

module.exports.productId = productId;

module.exports.productsMap = productsMap;

// Login User
module.exports.loginUser = function loginUser(catentryId,categoryId,sender) {
  console.log('loginUser ',catentryId);
  senderId = sender;
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
          getSkuFromParent(catentryId);
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
  	  getSkuFromParent(catentryId);
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
    productsMap = [];
		for (var i = 0; i < 5; i++) {
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
	
}

function getSkuFromParent(parentCatentryId){

  console.log('getSkuFromParent '+parentCatentryId);

  request({
    url: 'http://182.71.233.89/wcs/resources/store/10851/productview/byId/'+parentCatentryId,
    headers: {
      'Content-Type': 'application/json',
      'WCToken': WCToken
    },
    method: 'GET'
  }, function(error, response, body) {
    if (!error) {
    console.log('Success getSkuFromParent');
    skuId = JSON.parse(body).CatalogEntryView[0].SKUs[0].SKUUniqueID;
    console.log('skuId '+skuId);
    addToCart(skuId);
    } else {
      console.log('Error sending message: ', error);
    }
  }); 

}

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
      sendReceiptTemplate();
    } else {
      console.log('Error sending message: ', error);
    }
  });
}

function sendReceiptTemplate(){
  var product;
  for(i=0;i<5;i++){
    if(productsMap[i].id == productId){
      product = productsMap[i];
      break;
    }
  }
  console.log("product = %o",product);
  var messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "receipt",
        "recipient_name": "Divya",
        "order_number": orderId,
        "currency": "USD",
        "payment_method": "Visa 2345",
        //"order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
        "timestamp": "1428444852",
        "elements": [{
          "title": product.title,
          "subtitle": product.subtitle,
          "quantity": 1,
          "price": product.price,
          "currency": "USD",
          "image_url": product.image
        }],
        "address": {
          "street_1": "1 Infinite Loop",
          "street_2": "",
          "city": "Cupertino",
          "postal_code": "95014",
          "state": "CA",
          "country": "US"
        },
        "summary": {
          "subtotal": product.price,
          "shipping_cost": 4.95,
          "total_tax": 6.19,
          "total_cost": ""+product.price + 11.14
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
      "subtitle": "Price : $" + productsMap[i].price + " | " + productsMap[i].subtitle,
      "image_url": productsMap[i].image,
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