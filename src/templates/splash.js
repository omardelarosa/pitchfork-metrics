var jade = require('jade');
function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<div class=\"splash\"><h1 class=\"splash-head\">{{scoreAverage}}</h1><p class=\"splash-subhead\">Today's Average</p><p><a href=\"http://purecss.io\" class=\"pure-button pure-button-primary\">Get Started</a></p></div>");;return buf.join("");
}

/**
 * Export module
 */

module.exports = template;