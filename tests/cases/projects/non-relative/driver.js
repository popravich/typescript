var requirejs = require('../r.js');

requirejs.config({
    nodeRequire: require
});

requirejs(['consume'],
function (consume) {
});