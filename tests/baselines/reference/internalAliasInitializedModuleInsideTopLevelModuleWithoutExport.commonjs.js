(function (a) {
    (function (b) {
        var c = (function () {
            function c() {
            }
            return c;
        })();
        b.c = c;
    })(a.b || (a.b = {}));
    var b = a.b;
})(exports.a || (exports.a = {}));
var a = exports.a;

var b = a.b;
exports.x = new b.c();


////[0.d.ts]
export declare module a.b {
    class c {
    }
}
export declare var x: a.b.c;
