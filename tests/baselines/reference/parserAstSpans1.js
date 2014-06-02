//// [parserAstSpans1.js]
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var c1 = (function () {
    function c1() {
    }
    c1.prototype.i1_f1 = function () {
    };

    c1.prototype.i1_nc_f1 = function () {
    };

    /** c1_f1*/
    c1.prototype.f1 = function () {
    };

    /** c1_nc_f1*/
    c1.prototype.nc_f1 = function () {
    };
    return c1;
})();
var i1_i;
i1_i.i1_f1();
i1_i.i1_nc_f1();
i1_i.f1();
i1_i.nc_f1();
i1_i.i1_l1();
i1_i.i1_nc_l1();
i1_i.l1();
i1_i.nc_l1();
var c1_i = new c1();
c1_i.i1_f1();
c1_i.i1_nc_f1();
c1_i.f1();
c1_i.nc_f1();
c1_i.i1_l1();
c1_i.i1_nc_l1();
c1_i.l1();
c1_i.nc_l1();

// assign to interface
i1_i = c1_i;
i1_i.i1_f1();
i1_i.i1_nc_f1();
i1_i.f1();
i1_i.nc_f1();
i1_i.i1_l1();
i1_i.i1_nc_l1();
i1_i.l1();
i1_i.nc_l1();

var c2 = (function () {
    /** c2 constructor*/
    function c2(a) {
        this.c2_p1 = a;
    }
    /** c2 c2_f1*/
    c2.prototype.c2_f1 = function () {
    };

    Object.defineProperty(c2.prototype, "c2_prop", {
        /** c2 c2_prop*/
        get: function () {
            return 10;
        },
        enumerable: true,
        configurable: true
    });

    c2.prototype.c2_nc_f1 = function () {
    };
    Object.defineProperty(c2.prototype, "c2_nc_prop", {
        get: function () {
            return 10;
        },
        enumerable: true,
        configurable: true
    });

    /** c2 f1*/
    c2.prototype.f1 = function () {
    };

    Object.defineProperty(c2.prototype, "prop", {
        /** c2 prop*/
        get: function () {
            return 10;
        },
        enumerable: true,
        configurable: true
    });

    c2.prototype.nc_f1 = function () {
    };
    Object.defineProperty(c2.prototype, "nc_prop", {
        get: function () {
            return 10;
        },
        enumerable: true,
        configurable: true
    });
    return c2;
})();
var c3 = (function (_super) {
    __extends(c3, _super);
    function c3() {
        _super.call(this, 10);
        this.p1 = _super.prototype.c2_p1;
    }
    /** c3 f1*/
    c3.prototype.f1 = function () {
    };

    Object.defineProperty(c3.prototype, "prop", {
        /** c3 prop*/
        get: function () {
            return 10;
        },
        enumerable: true,
        configurable: true
    });

    c3.prototype.nc_f1 = function () {
    };
    Object.defineProperty(c3.prototype, "nc_prop", {
        get: function () {
            return 10;
        },
        enumerable: true,
        configurable: true
    });
    return c3;
})(c2);
var c2_i = new c2(10);
var c3_i = new c3();
c2_i.c2_f1();
c2_i.c2_nc_f1();
c2_i.f1();
c2_i.nc_f1();
c3_i.c2_f1();
c3_i.c2_nc_f1();
c3_i.f1();
c3_i.nc_f1();

// assign
c2_i = c3_i;
c2_i.c2_f1();
c2_i.c2_nc_f1();
c2_i.f1();
c2_i.nc_f1();
var c4 = (function (_super) {
    __extends(c4, _super);
    function c4() {
        _super.apply(this, arguments);
    }
    return c4;
})(c2);
var c4_i = new c4(10);

var i2_i;
var i3_i;
i2_i.i2_f1();
i2_i.i2_nc_f1();
i2_i.f1();
i2_i.nc_f1();
i2_i.i2_l1();
i2_i.i2_nc_l1();
i2_i.l1();
i2_i.nc_l1();
i3_i.i2_f1();
i3_i.i2_nc_f1();
i3_i.f1();
i3_i.nc_f1();
i3_i.i2_l1();
i3_i.i2_nc_l1();
i3_i.l1();
i3_i.nc_l1();

// assign to interface
i2_i = i3_i;
i2_i.i2_f1();
i2_i.i2_nc_f1();
i2_i.f1();
i2_i.nc_f1();
i2_i.i2_l1();
i2_i.i2_nc_l1();
i2_i.l1();
i2_i.nc_l1();

/**c5 class*/
var c5 = (function () {
    function c5() {
    }
    return c5;
})();
var c6 = (function (_super) {
    __extends(c6, _super);
    function c6() {
        _super.call(this);
        this.d = _super.prototype.b;
    }
    return c6;
})(c5);
