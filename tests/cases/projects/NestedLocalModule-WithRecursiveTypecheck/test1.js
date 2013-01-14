define(["require", "exports", "test2"], function(require, exports, __foo__) {
    var myModule;
    (function (myModule) {
        var foo = __foo__;

        console.log(foo.$);
        var z = foo.Yo.y();
    })(myModule || (myModule = {}));
    exports.x = 0;
})
