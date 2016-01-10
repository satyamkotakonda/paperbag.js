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