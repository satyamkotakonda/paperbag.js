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