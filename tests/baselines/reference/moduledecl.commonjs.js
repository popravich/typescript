var a;
(function (a) {
})(a || (a = {}));
var b;
(function (b) {
    (function (a) {
    })(b.a || (b.a = {}));
    var a = b.a;
})(b || (b = {}));
var c;
(function (c) {
    (function (a) {
        (function (b) {
            var ma = a;
        })(a.b || (a.b = {}));
        var b = a.b;
    })(c.a || (c.a = {}));
    var a = c.a;
})(c || (c = {}));
var mImport;
(function (mImport) {
    var d = a;
    var e = b.a;
    var d1 = a;
    var e1 = b.a;
})(mImport || (mImport = {}));
var m0;
(function (m0) {
    function f1() {
    }
            function f2(ns) {
    }
    var c1 = (function () {
        function c1() { }
        return c1;
    })();    
    var m2 = a;
    var m3 = b;
    var m4 = b.a;
    var m5 = c;
    var m6 = c.a;
    var m7 = c.a.b;
    var m8 = c.a.b.ma;
})(m0 || (m0 = {}));
var m1;
(function (m1) {
    function f1() {
    }
    m1.f1 = f1;
            function f2(ns) {
    }
    m1.f2 = f2;
    var c1 = (function () {
        function c1(n, n2, n3, n4) {
            this.n = n;
            this.n2 = n2;
            this.n3 = n3;
            this.n4 = n4;
            this.f = c.a.b.ma;
        }
        c1.prototype.d = function () {
            return "Hello";
        };
        return c1;
    })();
    m1.c1 = c1;    
    var m2 = a;
    var m3 = b;
    var m4 = b.a;
    var m5 = c;
    var m6 = c.a;
    var m7 = c.a.b;
    var m8 = c.a.b.ma;
})(m1 || (m1 = {}));
var m;
(function (m) {
    (function (m2) {
        var a = 10;
        m2.b;
    })(m.m2 || (m.m2 = {}));
    var m2 = m.m2;
    (function (m3) {
        m3.c;
    })(m.m3 || (m.m3 = {}));
    var m3 = m.m3;
})(m || (m = {}));
var m;
(function (m) {
    (function (m25) {
        (function (m5) {
            m5.c;
        })(m25.m5 || (m25.m5 = {}));
        var m5 = m25.m5;
    })(m.m25 || (m.m25 = {}));
    var m25 = m.m25;
})(m || (m = {}));
var m13;
(function (m13) {
    (function (m4) {
        (function (m2) {
            (function (m3) {
                m3.c;
            })(m2.m3 || (m2.m3 = {}));
            var m3 = m2.m3;
        })(m4.m2 || (m4.m2 = {}));
        var m2 = m4.m2;
        function f() {
            return 20;
        }
        m4.f = f;
    })(m13.m4 || (m13.m4 = {}));
    var m4 = m13.m4;
})(m13 || (m13 = {}));
var exportTests;
(function (exportTests) {
    var C1_public = (function () {
        function C1_public() { }
        C1_public.prototype.f2 = function () {
            return 30;
        };
        C1_public.prototype.f3 = function () {
            return "string";
        };
        return C1_public;
    })();
    exportTests.C1_public = C1_public;    
    var C2_private = (function () {
        function C2_private() { }
        C2_private.prototype.f2 = function () {
            return 30;
        };
        C2_private.prototype.f3 = function () {
            return "string";
        };
        return C2_private;
    })();    
    var C3_public = (function () {
        function C3_public() { }
        C3_public.prototype.getC2_private = function () {
            return new C2_private();
        };
        C3_public.prototype.setC2_private = function (arg) {
        };
        Object.defineProperty(C3_public.prototype, "c2", {
            get: function () {
                return new C2_private();
            },
            enumerable: true,
            configurable: true
        });
        C3_public.prototype.getC1_public = function () {
            return new C1_public();
        };
        C3_public.prototype.setC1_public = function (arg) {
        };
        Object.defineProperty(C3_public.prototype, "c1", {
            get: function () {
                return new C1_public();
            },
            enumerable: true,
            configurable: true
        });
        return C3_public;
    })();
    exportTests.C3_public = C3_public;    
})(exportTests || (exportTests = {}));
function foo() {
    return mAmbient.foo();
}
var cVar = new mAmbient.C();
var aVar = mAmbient.aVar;
var bB;
var eVar;
function m3foo() {
    return mAmbient.m3.foo();
}
var m3cVar = new mAmbient.m3.C();
var m3aVar = mAmbient.m3.aVar;
var m3bB;
var m3eVar;