//// [parserClass1.js]
var NullLogger = (function () {
    function NullLogger() {
    }
    NullLogger.prototype.information = function () {
        return false;
    };
    NullLogger.prototype.debug = function () {
        return false;
    };
    NullLogger.prototype.warning = function () {
        return false;
    };
    NullLogger.prototype.error = function () {
        return false;
    };
    NullLogger.prototype.fatal = function () {
        return false;
    };
    NullLogger.prototype.log = function (s) {
    };
    return NullLogger;
})();
exports.NullLogger = NullLogger;
