'use strict';

describe('paperbag', function () {

    var $rootScope, pbCart, pbProcessor, paperbag;

    beforeEach(function () {
        module('paperbag');
    });

    beforeEach(function () {

        module(function (paperbagProvider) {
            paperbagProvider.setConfiguration({
                "environment": "dev",
                "processor": "paypal",
                "cart": {
                    "currency": "USD",
                    "shipping": {
                        "units": "lbs"
                    },
                    "taxes": [
                        {"description": "state", "rate": "8.25"}
                    ]
                },
                "processors": {
                    "paypal": {
                        "dev": {
                            "url": "http://localhost:8080",
                            "endpoints": {
                                "credit": "http://localhost:8080/api/credit",
                                "checkout": "http://localhost:8080/api/checkout",
                                "execute": "http://localhost:8080/api/execute"
                            },
                            "redirects": {
                                "returnUrl": "http://localhost:8080/index.html#/confirmation",
                                "cancelUrl": "http://localhost:8080/index.html#/confirmation"
                            }
                        },
                        "prod": {
                            "url": "http://btinoco.com:8080",
                            "endpoints": {
                                "credit": "http://btinoco.com:8080/api/credit",
                                "checkout": "http://btinoco.com:8080/api/checkout",
                                "execute": "http://btinoco.com:8080/api/execute"
                            },
                            "redirects": {
                                "returnUrl": "http://btinoco.com:8080/index.html#/confirmation",
                                "cancelUrl": "http://btinoco.com:8080/index.html#/confirmation"
                            }
                        }
                    },
                    "stripe": {
                        "dev": {
                            "url": "http://localhost:8080",
                            "endpoints": {}
                        },
                        "prod": {
                            "url": "http://btinoco.com:8080",
                            "endpoints": {}
                        }
                    }
                }
            });
        });

        inject(function (_$rootScope_, _paperbag_, _pbCart_, _pbProcessor_) {
            $rootScope = _$rootScope_;
            pbCart = _pbCart_;
            pbProcessor = _pbProcessor_;
            paperbag = _paperbag_;
        });

    });

    it('should return the cart count', function () {

        expect(paperbag.cart.item.list.count()).toBe(0);

    });

    it('should add a new item to the cart and return the correct count', function () {
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

        paperbag.cart.item.add(catalogItem, 1);

        expect(paperbag.cart.item.list.count()).toBe(1);

        paperbag.cart.destroy();

    });

});