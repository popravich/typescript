//// [parserMemberAccessorDeclaration3.js]
var C = (function () {
    function C() {
    }
    Object.defineProperty(C.prototype, "0", {
        get: function () {
        },
        enumerable: true,
        configurable: true
    });
    return C;
})();
