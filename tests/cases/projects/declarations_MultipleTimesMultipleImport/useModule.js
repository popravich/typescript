define(["require", "exports", "m4", "m5"], function(require, exports, __m4__, __m5__) {
    var m4 = __m4__;

    exports.x4 = m4.x;
    exports.d4 = m4.d;
    exports.f4 = m4.foo();
    (function (m1) {
        m1.x2 = m4.x;
        m1.d2 = m4.d;
        m1.f2 = m4.foo();
        var x3 = m4.x;
        var d3 = m4.d;
        var f3 = m4.foo();
    })(exports.m1 || (exports.m1 = {}));
    var m1 = exports.m1;
    var m5 = __m5__;

    exports.d = m5.foo2();
})
