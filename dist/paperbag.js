!function (angular) {
    'use strict';

    //paperbag service
    //Tax information about city, county and state: http://www.sale-tax.com/
    angular.module('paperbag', [
            'paperbag.badge',
            'paperbag.cart',
            'paperbag.processor'
        ])
        .provider('paperbag', paperbagProvider);

    paperbagProvider.$inject = [];

    function paperbagProvider() {

        var config = {};

        this.setConfiguration = setConfiguration;

        this.$get = paperbag;

        paperbag.$inject = ['$log', '$rootScope', '$window', 'pbCart', 'pbProcessor'];

        //private members

        function paperbag($log, $rootScope, $window, pbCart, pbProcessor) {

            var self = this;

            var forEach = angular.forEach;
            var toJson = angular.toJson;
            var fromJson = angular.fromJson;

            return new Paperbag($rootScope);

            //private members

            function Paperbag($rootScope) {

                var self = this;

                var processorConfig = config.processors[config.processor];

                self.cart = getCart();
                self.processor = getProcessor();

                //events

                $rootScope.$on('pbEvent.item.update', function (event) {

                    if (self.cart)
                        saveCartToStorage(self.cart);

                });

                $rootScope.$on('pbEvent.item.remove', function (event) {

                    if (self.cart && self.cart.item.list.count() > 0) {

                        saveCartToStorage(self.cart);

                    } else {

                        removeCartFromStorage();

                        self.cart = createNewEmptyCart(config.cart);

                    }

                });

                $rootScope.$on('pbEvent.cart.destroy', function (event) {

                    removeCartFromStorage();

                    self.cart = createNewEmptyCart(config.cart);

                });

                //private members

                function getCart() {

                    return getSavedCartFromStorage() || createNewEmptyCart(config.cart);

                }

                function getProcessor() {

                    var processor = pbProcessor({
                        name: config.processor,
                        config: processorConfig[config.environment]
                    });

                    return processor;
                }

                function createNewEmptyCart(config) {

                    var cart = new pbCart({
                        id: createCartSerialNumber(),
                        created: new Date(),
                        modified: new Date(),
                        configuration: config
                    });

                    return cart;

                }

                function createCartSerialNumber() {

                    var chars = "01234ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz56789";
                    var serialLen = 21;
                    var serialStr = 'pb';

                    for (var i = 0; i < serialLen; i++) {

                        var char = Math.floor(Math.random() * chars.length);

                        serialStr += chars.substring(char, char + 1);

                    }

                    return serialStr + new Date().toString().replace(/\s/g, '').replace(/:/g, '').replace(/-/g, '');

                }

                function prepareCartForStorage(cart) {

                    var cartToStore = {};
                    var itemToSave = {};

                    if (cart) {

                        cartToStore = {
                            id: cart.id(),
                            created: cart.created(),
                            modified: cart.modified(),
                            configuration: cart.configuration(),
                            discount: cart.discount(),
                            items: []
                        };

                        forEach(cart.item.list.get(), function (item, idx) {

                            itemToSave = {
                                id: item.id(),
                                icon: item.icon(),
                                name: item.name(),
                                description: item.description(),
                                price: item.price(),
                                tax: item.tax(),
                                taxable: item.taxable(),
                                currency: item.currency(),
                                quantity: item.quantity(),
                                weight: item.weight(),
                                discount: item.discount()
                            };

                            cartToStore.items.push(itemToSave);

                        });

                    } else {

                        $log.error('paperbag.prepareCartForStorage cart is undefined!');

                    }

                    return cartToStore;

                }

                function createCartFromStorage(cartFromStorage) {

                    var cart;

                    if (cartFromStorage) {

                        cart = new pbCart({
                            id: cartFromStorage.id,
                            created: cartFromStorage.created,
                            modified: cartFromStorage.modified,
                            configuration: cartFromStorage.configuration,
                            discount: cartFromStorage.discount
                        });

                        forEach(cartFromStorage.items, function (item, key) {
                            cart.item.add(item, item.quantity);
                        });

                    } else {

                        $log.error('createCartFromStorage error, cartFromStorage undefined!');

                    }

                    return cart;

                }

                function getSavedCartFromStorage() {

                    var cart, savedCart;

                    if ($window.localStorage) {

                        if ($window.localStorage['paperbag']) {

                            savedCart = fromJson($window.localStorage.getItem('paperbag'));

                            cart = createCartFromStorage(savedCart);

                        } else {

                            $log.warn('paperbag.getSavedCartsFromStorage window.localStorage.paperbag do not exists!');

                        }

                    } else {

                        $log.warn('paperbag.getSavedCartsFromStorage window.localStorage!');

                    }

                    return cart;

                }

                function saveCartToStorage(cart) {

                    var tempCart;

                    if (cart) {

                        tempCart = prepareCartForStorage(cart);

                        if ($window.localStorage) {

                            if ($window.localStorage.paperbag) {

                                $window.localStorage.paperbag = toJson(tempCart);

                            } else {

                                $window.localStorage.setItem('paperbag', toJson(tempCart));

                            }

                        } else {

                            $log.error('paperbag.saveCartToStorage window.localStorage not available!');

                        }

                    } else {

                        $log.error('paperbag.saveCartToStorage cart is undefined!');

                    }

                }

                function removeCartFromStorage() {

                    if ($window.localStorage && $window.localStorage.paperbag) {

                        $window.localStorage.removeItem('paperbag');

                    } else {

                        $log.error(' removeCartFromStorage window.localStorage or ' +
                            'window.localStorage.paperbag not available!');

                    }

                }

            }

        }

        function setConfiguration(configuration) {

            config = configuration;

        }

    }

}(angular);
!function (angular) {
    'use strict';

    //This directive needs paperbag-cart to work.
    angular.module('paperbag.badge', [])
        .directive('pbBadge', pbBadge);

    pbBadge.$inject = ['paperbag'];

    function pbBadge(paperbag) {

        var directive = {
            restrict: 'AE',
            scope: {},
            link: linkFn
        };

        return directive;

        function linkFn($scope, $element, $attributes) {

            updateCartQuantity();

            //events

            $scope.$on('pbEvent.item.update', function (event) {
                updateCartQuantity();
            });

            $scope.$on('pbEvent.item.remove', function (event) {
                updateCartQuantity();
            });

            $scope.$on('pbEvent.cart.destroy', function (event) {
                updateCartQuantity();
            });

            //private members

            function updateCartQuantity() {

                $element.html(paperbag.cart.item.list.quantity());

            }

        }

    }

}(angular);
!function (angular) {
    'use strict';

    //pbCart service
    angular.module('paperbag.cart', [
            'paperbag.item'
        ])
        .factory('pbCart', pbCart);

    pbCart.$inject = ['$log', '$rootScope', '$filter', 'pbItem'];

    function pbCart($log, $rootScope, $filter, pbItem) {

        var self = this;

        var filter = $filter('filter');
        var forEach = angular.forEach;
        var isObject = angular.isObject;

        return Cart;

        //private members

        function Cart(data) {

            //private variables

            var id = '';
            var created = '';
            var modified = '';
            var configuration = {};
            var discount = {amount: '', type: 1};
            var items = [];
            var self = this;

            //cart constants

            self.constants = {
                discount: {
                    dollar: 1,
                    percent: 2
                }
            };

            //cart api

            self.id = getSetId;
            self.created = getSetCreated;
            self.modified = getSetModified;
            self.configuration = getSetConfiguration;
            self.discount = getSetDiscount;
            self.subtotal = getSubtotal;
            self.shipping = getShipping;
            self.tax = getStateTax;
            self.otherTax = getOtherTax;
            self.total = getTotal;
            self.destroy = destroyCart;
            self.item = {
                get: getItem,
                equals: itemEquals,
                add: addItem,
                remove: removeItem,
                list: {
                    set: setItemList,
                    get: getItemList,
                    count: getItemListCount,
                    quantity: getItemListQuantity
                }
            };

            //constructor

            if (arguments.length > 0 && isObject(data)) {

                if (data && data.configuration) {


                    id = data.id;
                    created = data.created;
                    modified = data.modified;
                    configuration = data.configuration;
                    discount = data.discount;

                } else {

                    $log.error('cart.constructor no cart configuration found!');

                }

            } else {

                $log.error('cart.constructor parameters do not exist or are not correct type!');

            }

            //private function members

            function getSetId(pid) {

                if (arguments.length === 1)
                    id = pid;
                else
                    return id;

            }

            function getSetCreated(pcreated) {

                if (arguments.length === 1)
                    created = pcreated;
                else
                    return created;

            }

            function getSetModified(pmodified) {

                if (arguments.length === 1)
                    modified = pmodified;
                else
                    return modified;

            }

            function getSetConfiguration(pconfiguration) {

                if (arguments.length === 1)
                    configuration = pconfiguration;
                else
                    return configuration;
            }

            function getSetDiscount(pdiscount) {

                if (arguments.length === 1) {

                    discount = pdiscount;

                    $rootScope.$broadcast('pbEvent.item.update');

                } else {

                    return discount;

                }
            }

            function calculateDiscount(amount) {

                var total = 0;

                if (discount.type === self.constants.discount.dollar) {

                    total = amount - parseFloat(discount.amount);

                } else if (discount.type === self.constants.discount.percent) {

                    total = (amount - (amount * parseFloat(discount.amount)))

                }

                return total;

            }

            function getSubtotal() {

                var subtotal = 0;

                forEach(items, function (item, index) {

                    subtotal += item.subtotal();

                });

                if (discount && discount.amount && discount.type) {

                    subtotal = calculateDiscount(subtotal);

                }

                return subtotal;

            }

            function getShipping() {
                var shipping = 0;

                if (configuration &&
                    configuration.shipping &&
                    configuration.shipping.rate) {

                    //shipping logic here
                }

                return shipping;
            }

            function getStateTax() {
                var taxes = 0;
                var taxableItemTotal = 0;

                if (configuration &&
                    configuration.taxes &&
                    configuration.taxes.length > 0) {

                    forEach(items, function (item, index) {

                        if (item.taxable() === undefined || item.taxable()) {

                            taxableItemTotal += item.subtotal();

                        }

                    });

                    taxableItemTotal = calculateDiscount(taxableItemTotal);

                    forEach(configuration.taxes, function (tax, index) {

                        taxes += ( taxableItemTotal * (parseFloat(tax.rate) * .01))

                    });

                } else {

                    $log.error('cart.getTaxes could not find tax rates from configuration!');

                }

                return taxes;
            }

            function getOtherTax() {

                var taxes = 0;

                forEach(items, function (item, index) {

                    if (item.tax) {

                        taxes += item.tax();

                    }

                });

                return taxes;

            }

            function getTotal() {

                var total = 0;

                total += getSubtotal();

                total += getShipping();

                total += getStateTax();

                total += getOtherTax();

                return total;
            }

            function destroyCart() {
                id = '';
                created = '';
                modified = '';
                configuration = {};
                items = [];

                $rootScope.$broadcast('pbEvent.cart.destroy');
            }

            function getItem(pid) {
                var found;

                if (pid !== undefined) {

                    found = filter(items, function (item, index, array) {

                        if (item.id() === pid) {

                            return item;

                        }

                    }, true);

                } else {

                    $log.error('cart.get id not found!');

                }

                return found;
            }

            function itemEquals(pitem) {
                var found;

                if (id !== undefined) {

                    found = filter(items, function (item, index, array) {

                        if (
                            item.id() === pitem.id() &&
                            item.name() === pitem.name() &&
                            item.description() === pitem.description() &&
                            item.price() === pitem.price() &&
                            item.tax() === pitem.tax() &&
                            item.taxable() === pitem.taxable() &&
                            item.currency() === pitem.currency() &&
                            item.quantity() === pitem.quantity() &&
                            item.weight() === pitem.weight()
                        ) {

                            return item;

                        }

                    }, true);

                } else {

                    $log.error('cart.get id not found!');

                }

                return found;
            }

            function addItem(pitem, pquantity) {

                var found;

                if (pitem && pquantity) {

                    found = self.item.get(pitem.id)[0];

                    if (found !== undefined) {

                        found.increaseQty(pquantity);

                    } else {

                        if (!pquantity || pquantity <= 0) {

                            pquantity = 1;

                        }

                        if (configuration && configuration.currency) {

                            var item = new pbItem({
                                id: pitem.id,
                                icon: pitem.icon,
                                name: pitem.name,
                                description: pitem.description,
                                taxable: pitem.taxable,
                                price: pitem.price,
                                tax: pitem.tax,
                                currency: configuration.currency,
                                quantity: pquantity,
                                weight: pitem.weight,
                                discount: pitem.discount
                            });

                            items.push(item);

                        } else {

                            $log.error('cart.item.add could not find currency from configuration!');

                        }

                    }

                    $rootScope.$broadcast('pbEvent.item.update');

                } else {

                    $log.error('cart.item.add item or quantity is undefined!');

                }
            }

            function removeItem(pid) {

                var found;
                var idx = -1;

                if (pid !== undefined) {

                    found = self.item.get(pid)[0];

                    if (found) {

                        idx = items.indexOf(found);

                        items.splice(idx, 1);

                        $rootScope.$broadcast('pbEvent.item.remove');

                    }

                } else {

                    $log.warn('cart.item.remove id is undefined!');

                }

            }

            function setItemList(pitems) {

                pitems.forEach(function (item, index) {

                    addItem(item, 1);

                });

            }

            function getItemList() {

                return items;

            }

            function getItemListCount() {

                return items.length;

            }

            function getItemListQuantity() {

                var quantity = 0;

                forEach(items, function (item, idx) {

                    quantity += item.quantity();

                });

                return quantity;

            }

        }

    }

}(angular);
!function (angular) {
    'use strict';

    //pbItem service
    angular.module('paperbag.item', [])
        .factory('pbItem', pbItem);

    pbItem.$inject = ['$log', '$rootScope'];

    function pbItem($log, $rootScope) {

        var isObject = angular.isObject;
        var forEach = angular.forEach;

        return Item;

        //private members

        function Item(data) {

            //private variables

            var id = '';
            var icon = '';
            var name = '';
            var description = '';
            var price = '';
            var taxes = [];
            var taxable = true;
            var currency = '';
            var quantity = 0;
            var weight = 0;
            var discount = {amount: '', type: 1};
            var self = this;

            //item constants

            self.constants = {
                discount: {
                    dollar: 1,
                    percent: 2
                }
            };

            //item api

            self.id = getSetId;
            self.icon = getSetIcon;
            self.name = getSetName;
            self.description = getSetDescription;
            self.price = getSetPrice;
            self.taxes = getSetTaxes;
            self.taxable = getSetTaxable;
            self.currency = getSetCurrency;
            self.quantity = getSetQuantity;
            self.weight = getSetWeight;
            self.discount = getSetDiscount;
            self.subtotal = getSubtotal;
            self.tax = getTax;
            self.total = getTotal;
            self.increaseQty = setIncreaseQuantity;
            self.decreaseQty = setDecreaseQuantity;

            //constructor

            if (arguments.length > 0 && isObject(data)) {

                id = data.id;
                icon = data.icon;
                name = data.name;
                description = data.description;
                price = data.price;
                taxes = data.taxes;
                taxable = data.taxable;
                currency = data.currency;
                quantity = data.quantity;
                weight = data.weight;
                discount = data.discount;

            } else {

                $log.error('item.constructor parameter do not exist or are not correct type!');

            }

            //private function members

            function getSetId(pid) {

                if (arguments.length === 1)
                    id = pid;
                else
                    return id;

            }

            function getSetIcon(picon) {

                if (arguments.length === 1)
                    icon = picon;
                else
                    return icon;

            }

            function getSetName(pname) {

                if (arguments.length === 1)
                    name = pname;
                else
                    return name;

            }

            function getSetDescription(pdescription) {

                if (arguments.length === 1)
                    description = pdescription;
                else
                    return description;

            }

            function getSetPrice(pprice) {

                if (arguments.length === 1)
                    price = pprice;
                else
                    return price;

            }

            function getSetTaxes(ptaxes) {

                if (arguments.length === 1)
                    taxes = ptaxes;
                else
                    return taxes;

            }

            function getSetTaxable(ptaxable) {

                if (arguments.length === 1)
                    taxable = ptaxable;

                else
                    return taxable;

            }

            function getSetCurrency(pcurrency) {

                if (arguments.length === 1)
                    currency = pcurrency;
                else
                    return currency;

            }

            function getSetQuantity(pquantity) {

                if (arguments.length === 1 && pquantity > 0) {

                    quantity = pquantity;

                    $rootScope.$broadcast('pbEvent.item.update');

                } else {

                    return quantity;

                }

            }

            function getSetWeight(pweight) {

                if (arguments.length === 1)
                    weight = pweight;
                else
                    return weight;

            }

            function getSetDiscount(pdiscount) {

                if (arguments.length === 1) {

                    discount = pdiscount;

                    $rootScope.$broadcast('pbEvent.item.update');

                } else {

                    return discount;
                }

            }

            function getSubtotal() {

                var subtotal = 0;

                if (price && quantity) {

                    subtotal = parseFloat(price) * quantity;

                    if (discount && discount.amount && discount.type) {

                        if (discount.type === self.constants.discount.dollar) {

                            subtotal = (subtotal - parseFloat(discount.amount));

                        } else if (discount.type === self.discount.percent) {

                            subtotal = (subtotal - (subtotal * parseFloat(discount.amount)))

                        }

                    }

                } else {

                    $log.error('item.getSubtotal price or quantity is undefined!');

                }

                return subtotal;

            }

            function getTax() {

                var amount = 0;

                if (taxes && taxes.length > 0) {

                    forEach(taxes, function (tax, index) {

                        amount += getSubtotal() * (parseFloat(tax.rate) * .01);

                    });

                }

                return amount;

            }

            function getTotal() {
                var total = 0;

                total += getSubtotal();

                total += getTax();

                return total;
            }

            function setIncreaseQuantity(pquantity) {

                if (arguments.length === 1 && pquantity > 0)
                    quantity += pquantity;
                else
                    quantity += 1;

                $rootScope.$broadcast('pbEvent.item.update');

            }

            function setDecreaseQuantity(pquantity) {

                if (arguments.length === 1 && pquantity > 0)
                    quantity -= pquantity;
                else
                    quantity -= 1;

                $rootScope.$broadcast('pbEvent.item.update');

            }

        }

    }

}(angular);
!function (angular) {
    'use strict';

    //pbProcessors
    angular.module('paperbag.processor', [
            'paperbag.processor.paypal',
            'paperbag.processor.stripe'
        ])
        .factory('pbProcessor', pbProcessor);

    pbProcessor.$inject = ['pbpPaypal', 'pbpStripe'];

    function pbProcessor(pbpPaypal, pbpStripe) {

        var processors = {
            'paypal': pbpPaypal,
            'stripe': pbpStripe
        };

        return Processor;

        //private members

        function Processor(config) {

            var processor = processors[config.name];

            return new processor(config.config);

        }

    }

}(angular);
!function (angular) {
    'use strict';

    //pbCart service
    angular.module('paperbag.processor.paypal', [])
        .factory('pbpPaypal', pbpPaypal);

    pbpPaypal.$inject = ['$http'];

    function pbpPaypal($http) {

        var self = this;

        var _forEach = angular.forEach;

        return Paypal;

        //private members

        function Paypal(config) {

            var self = this;

            self.config = config;
            self.checkout = checkout;
            self.credit = credit;
            self.execute = execute;

            function checkout(cart) {
                var paypalInfo = {
                    id: cart.id(),
                    subtotal: cart.subtotal().toFixed(2),
                    taxes: (cart.tax() + cart.otherTax()).toFixed(2),
                    shipping: cart.shipping().toFixed(2),
                    total: cart.total().toFixed(2),
                    items: [],
                    urls: self.config.redirects
                };

                _forEach(cart.item.list.get(), function (item, index) {

                    var item = {
                        "quantity": item.quantity(),
                        "name": item.name(),
                        "price": item.price(),
                        "currency": item.currency(),
                        "sku": item.id(),
                        "tax": item.tax().toFixed(2)
                    };

                    paypalInfo.items.push(item)

                });

                return $http.post(self.config.endpoints.checkout, paypalInfo);
            }

            function credit(cart) {
                var paypalInfo = {
                    id: cart.id(),
                    subtotal: cart.subtotal().toFixed(2),
                    taxes: (cart.tax() + cart.otherTax()).toFixed(2),
                    shipping: cart.shipping().toFixed(2),
                    total: cart.total().toFixed(2),
                    items: [],
                    instruments: cart.instruments
                };

                _forEach(cart.item.list.get(), function (item, index) {

                    var item = {
                        "quantity": item.quantity(),
                        "name": item.name(),
                        "price": item.price(),
                        "currency": item.currency(),
                        "sku": item.id(),
                        "tax": item.tax().toFixed(2)
                    };

                    paypalInfo.items.push(item)

                });

                return $http.post(self.config.endpoints.credit, paypalInfo);
            }

            function execute(paymentInfo) {
                return $http.post(self.config.endpoints.execute, paymentInfo);
            }

        }
    }

}(angular);
!function (angular) {
    'use strict';

    //pbCart service
    angular.module('paperbag.processor.stripe', [])
        .factory('pbpStripe', pbpStripe);

    pbpStripe.$inject = ['$http'];

    function pbpStripe($http) {

        var self = this;

        return Stripe;

        //private members

        function Stripe(config) {

            var self = this;

            self.config = config;
            self.checkout = checkout;
            self.execute = execute;

            function checkout(cart) {
                var stripeInfo = {
                    id: cart.id(),
                    subtotal: cart.subtotal().toFixed(2),
                    taxes: (cart.tax() + cart.otherTax()).toFixed(2),
                    shipping: cart.shipping().toFixed(2),
                    total: cart.total().toFixed(2),
                    items: [],
                    urls: self.config.redirects
                };

                return stripeInfo;
            }

            function execute(paymentInfo) {

                return paymentInfo;

            }

        }

    }

}(angular);