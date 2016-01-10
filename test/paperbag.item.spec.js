'use strict';

describe('paperbag.item', function () {

    var item, itemOptions, pbItem;

    beforeEach(module('paperbag.item'));

    beforeEach(inject(function (_pbItem_) {
        var catalogItem = {
            "id": "23454",
            "name": "Test Item",
            "description": "Toy",
            "category": "12345",
            "price": "1.00",
            "image": "images/toy.png",
            "icon": "images/toy_icon.png",
            "weight": "1.5",
            "taxable": true,
            "taxes": [],
            "discount": {}
        };

        pbItem = _pbItem_;

        item = new pbItem(catalogItem);

        item.quantity(3);

    }));

    it('should return the correct item id', function () {

        expect(item.id()).toEqual('23454');

    });

    it('should return the correct item quantity', function () {

        expect(item.quantity()).toEqual(3);

    });

    it('should return the correct item subtotal', function () {

        expect(item.subtotal()).toEqual(3);

    });

    it('should return the correct item total', function () {

        expect(item.total().toFixed(2)).toEqual('3.00');

    });

    it('should return the correct item taxes', function () {

        item.taxes([{description: "chocolate", rate: "10"}]);

        expect(item.tax().toFixed(2)).toEqual('0.30');

    });

    it('should return the correct item total with taxes', function () {

        item.taxes([{description: "chocolate", rate: "10"}]);

        expect(item.total().toFixed(2)).toEqual('3.30');

    });

    it('should return the correct item subtotal with discount', function () {

        item.discount({amount: '0.50', type: item.constants.discount.dollar});

        expect(item.subtotal().toFixed(2)).toEqual('2.50');

    });

});