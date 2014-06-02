//// [parserCastVersusArrowFunction1.js]
var v = function () {
    return 1;
};
var v = a;

var v = function (a) {
    return 1;
};
var v = function (a, b) {
    return 1;
};
var v = function (a, b) {
    if (typeof a === "undefined") { a = 1; }
    if (typeof b === "undefined") { b = 2; }
    return 1;
};

var v = (a);
var v = (a, b);
var v = (a = 1, b = 2);
