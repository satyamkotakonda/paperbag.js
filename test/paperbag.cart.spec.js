'use strict';

describe('paperbag.cart', function () {

    var catalogItems, cartConfig, cart, items, pbCart, pbItem;

    beforeEach(module('paperbag.cart'));

    beforeEach(inject(function (_pbCart_, _pbItem_) {
        cartConfig = {
            "id": "testCart12345",
            "created ": "",
            "modified": "",
            "configuration": {
                "currency": "USD",
                "shipping": {
                    "units": "lbs"
                },
                "taxes": [
                    {
                        "description": "state",
                        "rate": "8.25"
                    }
                ]
            },
            "discount": {
                "amount": "",
                "type": 1
            }
        };
        pbCart = _pbCart_;
        pbItem = _pbItem_;
        catalogItems = [{
            "id": "12345",
            "name": "Allstar Crackers",
            "description": "Saltine Crackers",
            "category": "11111",
            "price": "1.00",
            "image": "images/allstar_crackers.png",
            "icon": "images/allstar_crackers.png",
            "weight": "2",
            "taxable": false,
            "taxes": [],
            "discount": {}
        }, {
            "id": "23454",
            "name": "Springer Water",
            "description": "Drinking Water",
            "category": "22222",
            "price": "0.99",
            "image": "images/springer_water.png",
            "icon": "images/springer_water.png",
            "weight": "1.5",
            "taxable": true,
            "taxes": [],
            "discount": {}
        }, {
            "id": "34567",
            "name": "Morning Coffee",
            "description": "Coffee",
            "category": "44444",
            "price": "10.00",
            "image": "images/morning_coffee.png",
            "icon": "images/morning_coffee.png",
            "weight": "3.5",
            "taxable": true,
            "taxes": [],
            "discount": {}
        }];

        cart = new pbCart(cartConfig);

        cart.item.list.set(catalogItems);

    }));

    it('should return the correct cart item count', function () {

        expect(cart.item.list.count()).toEqual(3);

    });

    it('should return the correct cart subtotal', function () {

        expect(cart.subtotal().toFixed(2)).toEqual('11.99');

    });

    it('should return the correct cart tax', function () {

        expect(cart.tax().toFixed(2)).toEqual('0.91');

    });

    it('should return the correct cart total', function () {

        expect(cart.total().toFixed(2)).toEqual('12.90');

    });

    it('should return the correct cart item quantity', function () {

        var catalogItem = {
            "id": "12345",
            "name": "Allstar Crackers",
            "description": "Saltine Crackers",
            "category": "11111",
            "price": "1.00",
            "image": "images/allstar_crackers.png",
            "icon": "images/allstar_crackers.png",
            "weight": "2",
            "taxable": true,
            "taxes": [],
            "discount": {}
        };

        cart.item.add(catalogItem, 1);

        expect(cart.item.list.quantity()).toEqual(4);

    });

});