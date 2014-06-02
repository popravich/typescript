//// [parserMemberFunctionDeclarationAmbiguities1.js]
var C = (function () {
    function C() {
    }
    C.prototype.public = function () {
    };
    C.prototype.static = function () {
    };

    C.prototype.public = function () {
    };
    C.prototype.static = function () {
    };

    C.public = function () {
    };
    C.static = function () {
    };

    C.public = function () {
    };
    C.static = function () {
    };
    return C;
})();
