var A;
(function (A) {
    var Point = (function () {
        function Point() {
        }
        return Point;
    })();

    var Line = (function () {
        function Line(start, end) {
            this.start = start;
            this.end = end;
        }
        return Line;
    })();
    A.Line = Line;

    function fromOrigin(p) {
        return new Line({ x: 0, y: 0 }, p);
    }
    A.fromOrigin = fromOrigin;
})(A || (A = {}));
