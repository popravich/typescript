//// [scannerClass2.js]
var LoggerAdapter = (function () {
    function LoggerAdapter(logger) {
        this.logger = logger;
        this._information = this.logger.information();
    }
    return LoggerAdapter;
})();
exports.LoggerAdapter = LoggerAdapter;
