var jade = require('jade');
function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<div class=\"home-menu pure-menu pure-menu-open pure-menu-horizontal pure-menu-fixed\"><a href=\"#\" class=\"pure-menu-heading\">Day For Music</a><ul><li class=\"pure-menu-selected\"><a href=\"#\">Home</a></li><li><a href=\"#\">Years</a></li><li><a href=\"#\">Subscribe</a></li></ul></div><div class=\"splash\"><h1 class=\"splash-subhead\">{{date}}</h1><h1 class=\"splash-head\">{{scoreAverage}}</h1><p class=\"splash-subhead covers\"></p><p></p></div><div class=\"content-wrapper\"><h2 class=\"content-head is-center\">Daily Music Score Average</h2><div class=\"pure-g\"><div class=\"l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-4\"><h3 class=\"content-subhead\"><i class=\"fa fa-rocket\"></i>Get Started Quickly</h3><p>Phasellus eget enim eu lectus faucibus vestibulum. Suspendisse sodales pellentesque elementum.</p></div><div class=\"l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-4\"><h3 class=\"content-subhead\"><i class=\"fa fa-mobile\"></i>Responsive Layouts</h3><p>Phasellus eget enim eu lectus faucibus vestibulum. Suspendisse sodales pellentesque elementum.</p></div><div class=\"l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-4\"><h3 class=\"content-subhead\"><i class=\"fa fa-th-large\"></i>Modular</h3><p>Phasellus eget enim eu lectus faucibus vestibulum. Suspendisse sodales pellentesque elementum.</p></div><div class=\"l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-4\"><h3 class=\"content-subhead\"><i class=\"fa fa-check-square-o\"></i>Plays Nice</h3><p>Phasellus eget enim eu lectus faucibus vestibulum. Suspendisse sodales pellentesque elementum.</p></div></div><div class=\"l-box-lrg is-center pure-u-1 pure-u-md-1-2 pure-u-lg-2-5\"><img alt=\"File Icons\" width=\"300\" src=\"img/common/file-icons.png\" class=\"pure-img-responsive\"/></div><div class=\"pure-u-1 pure-u-md-1-2 pure-u-lg-3-5\"><h2 class=\"content-head is-center\">Sign Up</h2><div class=\"l-box-lrg pure-u-1 pure-u-md-2-5\"><form action=\"#\" class=\"pure-form pure-form-stacked\"><fieldset><label for=\"first_name\">Your First Name</label><input id=\"first_name\" type=\"text\" placeholder=\"Your First Name\"/><label for=\"last_name\">Your Last Name</label><input id=\"last_name\" type=\"text\" placeholder=\"Your Last Name\"/><label for=\"email\">Your Email</label><input id=\"email\" type=\"email\" placeholder=\"Your Email\"/><label for=\"score_threshold\">Your Minimum Score Threshold</label><input id=\"password\" type=\"text\" placeholder=\"0.0 to 10.0 -- this is the lowest scoring review you wish to be notified about\"/><button type=\"submit\" class=\"pure-button\">Subscribe</button></fieldset></form></div></div></div>View the source of this layout to learn more. Made with love by the YUI Team.");;return buf.join("");
}

/**
 * Export module
 */

module.exports = template;