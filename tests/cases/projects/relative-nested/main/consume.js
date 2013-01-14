define(["require", "exports", "../decl"], function(require, exports, __decl__) {
    var decl = __decl__;

        function call() {
        var str = decl.call();
        if(str !== "success") {
            fail();
        }
    }
    exports.call = call;
})
