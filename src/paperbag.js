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