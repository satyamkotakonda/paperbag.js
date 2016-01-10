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