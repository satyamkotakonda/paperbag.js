#paperbag-js#
A simple, configurable and adaptable angular front-end shopping cart

##Prerequisites##
1. Open command line
2. Install dependencies, type **npm install** in command line
    + if you are on a mac you might need to type: **sudo npm install**
3. **AngularJs** >= v1.3.x 

##Development##
1. Please make sure you have done the prerequisites above
2. Open command line
3. Run gulp build by typing **gulp default** (This will keeo a watch for any js changes)
4. Make changes and release the **dist** directory to your application

##Usage##
+ Add **paperbag.js** or **paperbag.min.js** to your project (index.html)

```html
  <script type="application/javascript" src="libs/paperbag-js/dist/paperbag.js"></script>
```

+ Add **paperbag** to your angular application's dependencies...

```javascript
angular.module('app', ['paperbag'])
```
 
+ Load configuration file for **paperbag**, see example below...

```javascript
   angular.element(document).ready(function () {
        var _paperbagConfig;

        angular.element.get('config/config.json').then(function (response) {

            _paperbagConfig = angular.fromJson(response);

        }).then(function (data) {

            angular.module('app').config(function (paperbagProvider) {

                paperbagProvider.setConfiguration(_paperbagConfig.paperbag);

            });

            angular.bootstrap(document, ['app']);

        });
    });
```

+ **paperbag** configuration file example...

```json
{
  "paperbag": {
    "environment": "prod",
    "processor": "paypal",
    "cart": {
      "currency": "USD",
      "shipping": {
        "units": "lbs"
      },
      "tax": {
        "rate": "9.5"
      }
    },
    "processors": {
      "paypal": {
        "dev": {
          "url": "http://localhost:8080",
          "endpoints": {
            "credit": "http://localhost:8080/api/credit",
            "checkout": "http://localhost:8080/api/checkout",
            "execute": "http://localhost:8080/api/execute"
          },
          "redirects": {
            "returnUrl": "http://localhost:8080/index.html#/confirmation",
            "cancelUrl": "http://localhost:8080/index.html#/confirmation"
          }
        },
        "prod": {
          "url": "http://mysite.com:8080",
          "endpoints": {
            "credit": "http://mysite.com:8080/api/credit",
            "checkout": "http://mysite.com:8080/api/checkout",
            "execute": "http://mysite.com:8080/api/execute"
          },
          "redirects": {
            "returnUrl": "http://mysite.com:8080/index.html#/confirmation",
            "cancelUrl": "http://mysite.com:8080/index.html#/confirmation"
          }
        }
      },
      "stripe": {
        "dev": {
          "url": "http://localhost:8080",
          "endpoints": {}
        },
        "prod": {
          "url": "http://mysite.com:8080",
          "endpoints": {}
        }
      }
    }
  }
}
```

##Paperbag API##

```javascript
//paperbag, returns a cart and payment processor object. 
//It also takes care to save the state of the cart until the cart is destroyed.

paperbag.cart //returns a cart object
paperbag.processor //returns a payment processor object
```

##Paperbag Cart API#

```javascript
cart.id() //returns the id of the cart
cart.created() //returns the date the cart was created
cart.modified() //returns the date the cart was modified
cart.configuration() //sets or returns the cart's configuration
cart.discount() //sets or returns the cart's discount (object: amount, type)
cart.subtotal() //returns the cart's subtotal (subtracts discount)
cart.shipping() //returns the cart item's shipping
cart.tax() //returns the cart's state tax
cart.otherTax() //returns the cart item's other tax
cart.total() //returns the cart's total
cart.destroy() //destroys the cart
cart.item.get() //returns an item with the id supplied
cart.item.equals() //returns an item that is equal to the item supplied
cart.item.add() //adds an item to the cart
cart.item.remove() //removes an item with the id supplied
cart.item.list.set() //sets the cart's item list with the item list supplied
cart.item.list.get() //returns the cart item list
cart.item.list.count() //returns the cart item list count
cart.item.list.quantity() //return the cart item list quantity
```

##Paperbag Item API##

```javascript
item.id() //returns the item id/sku
item.icon() //returns the item's icon path
item.name() //returns the item's name
item.description() //returns the item's description
item.price() //returns the item's price
item.taxes() //returns the item's tax (array of objects: description, rate)
item.taxable() //returns true or false if the item is taxable
item.currency() //returns the item's currency code
item.quantity() //sets or returns the item's quantity
item.weight() //returns the item's weight
item.discount() //sets or returns the cart's discount (object: amount, type)
item.subtotal() //returns the item's subtotal (subtracts discount)
item.tax() //returns the item's tax
item.total() //returns the item's total
item.increaseQty() //increases the item's quantity by one
item.decreaseQty() //decreases the item's quantity by one

```

##Paperbag Processor API##

```javascript
//PAYPAL API
payment.checkout() //makes a call to paypal payment
payment.execute() //makes a call to execute the paypal payment
payment.credit() //makes a call to the paypal payment credit

//STRIP API
payment.checkout() //not available yet
payment.execute() //not available yet
payment.credit() //not available yet
```

##Notes##
+ Version **1.0**