//// [invalidVoidValues.js]
var x;
x = 1;
x = '';
x = true;

var E;
(function (E) {
    E[E["A"] = 0] = "A";
})(E || (E = {}));
x = E;
x = 0 /* A */;

var C = (function () {
    function C() {
    }
    return C;
})();
var a;
x = a;

var b;
x = b;

x = { f: function () {
    } };

var M;
(function (M) {
    M.x = 1;
})(M || (M = {}));
x = M;

function f(a) {
    x = a;
}
x = f;
