//// [arrayAssignmentTest3.js]
// The following gives no error
// Michal saw no error if he used number instead of B,
// but I do...
var B = (function () {
    function B() {
    }
    return B;
})();

var a = (function () {
    function a(x, y, z) {
        this.x = x;
        this.y = y;
    }
    return a;
})();

var xx = new a(null, 7, new B());
