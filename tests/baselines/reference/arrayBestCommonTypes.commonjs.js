var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var base = (function () {
    function base() {
    }
    return base;
})();
var base2 = (function () {
    function base2() {
    }
    return base2;
})();
var derived = (function (_super) {
    __extends(derived, _super);
    function derived() {
        _super.apply(this, arguments);
    }
    return derived;
})(base);

var f = (function () {
    function f() {
    }
    f.prototype.voidIfAny = function (x, y) {
        if (typeof y === "undefined") { y = false; }
        return null;
    };

    f.prototype.x = function () {
        (this.voidIfAny([4, 2][0]));
        (this.voidIfAny([4, 2, undefined][0]));
        (this.voidIfAny([undefined, 2, 4][0]));
        (this.voidIfAny([null, 2, 4][0]));
        (this.voidIfAny([2, 4, null][0]));
        (this.voidIfAny([undefined, 4, null][0]));

        (this.voidIfAny(['', "q"][0]));
        (this.voidIfAny(['', "q", undefined][0]));
        (this.voidIfAny([undefined, "q", ''][0]));
        (this.voidIfAny([null, "q", ''][0]));
        (this.voidIfAny(["q", '', null][0]));
        (this.voidIfAny([undefined, '', null][0]));

        (this.voidIfAny([[3, 4], [null]][0][0]));

        var t1 = [{ x: 7, y: new derived() }, { x: 5, y: new base() }];
        var t2 = [{ x: true, y: new derived() }, { x: false, y: new base() }];
        var t3 = [{ x: undefined, y: new base() }, { x: '', y: new derived() }];

        var anyObj = null;

        var a1 = [{ x: 0, y: 'a' }, { x: 'a', y: 'a' }, { x: anyObj, y: 'a' }];
        var a2 = [{ x: anyObj, y: 'a' }, { x: 0, y: 'a' }, { x: 'a', y: 'a' }];
        var a3 = [{ x: 0, y: 'a' }, { x: anyObj, y: 'a' }, { x: 'a', y: 'a' }];

        var ifaceObj = null;
        var baseObj = new base();
        var base2Obj = new base2();

        var b1 = [baseObj, base2Obj, ifaceObj];
        var b2 = [base2Obj, baseObj, ifaceObj];
        var b3 = [baseObj, ifaceObj, base2Obj];
        var b4 = [ifaceObj, baseObj, base2Obj];
    };
    return f;
})();