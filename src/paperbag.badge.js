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