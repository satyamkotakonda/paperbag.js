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