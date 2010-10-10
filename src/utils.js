var utils = {};

// when release an app, copy this file and set debuging to false.
utils.debuging = false;

utils.isDefined = function (symbol) {
    return (typeof symbol !== 'undefined');
};

utils.inList = function (e, list) {
    var l = list.length;
    for (var i = 0; i < l; ++i) {
	if (e === list[i]) {
	    return true;
	}
    }
    return false;
};

utils.isArray = function (o) {
    return Object.prototype.toString.call(o) === '[object Array]';
};

utils.assertTrue = function (value, msg) {
    if (! utils.debuging) {
	return;
    }
    if (value !== true) {
	alert(msg);
    }
};

utils.assert = utils.assertTrue;

utils.assertEqual = function (expectValue, realValue, msg) {
    if (! utils.debuging) {
	return;
    }
    if (utils.isArray(expectValue)) {
	var len = expectValue.length;
	if (utils.isArray(realValue) &&
	    (realValue.length === len)) {
	    for (var i = 0; i < expectValue; ++i) {
		if (expectValue[i] !== realValue[i]) {
		    alert(msg + '\nexpect: ' + expectValue + '\nfound: ' + realValue);
		}
	    }
	} else {
	    alert(msg + '\nexpect: ' + expectValue + '\nfound: ' + realValue);
	}
    } else {
	if (expectValue !== realValue) {
	    alert(msg + '\nexpect: ' + expectValue + '\nfound: ' + realValue);
	}
    }
};

utils.assertDefined = function (symbol, msg) {
    if (! utils.debuging) {
	return;
    }
    if (! utils.isDefined(symbol)) {
	alert(msg);
    }
};

