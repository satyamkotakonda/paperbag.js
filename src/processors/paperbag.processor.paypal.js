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