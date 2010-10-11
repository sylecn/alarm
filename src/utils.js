var utils = {};

// ======================
//  Debuging and Testing
// ======================

// when release an app, copy this file and set debuging to false.
utils.debuging = true;

utils.isDefined = function (symbol) {
    return (typeof symbol !== 'undefined');
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

// =======================
//  String/Regexp helpers
// =======================

/**
 * return true if given string is a positive integer
 */
utils.isPositiveInteger = function (str) {
    if (str.trim().match(/^\d+$/)) {
	return true;
    }
    return false;
}

// ==============
//  Array Helper
// ==============

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

// ============
//  DOM Events
// ============

/**
 * ask for confirmation when user try to close window. given message will
 * shown to the user by browser.
 *
 * this function add a handler to window.onbeforeunload event.
 */
utils.setCloseConfirm = function (msg) {
    utils.assert(typeof msg === 'string', 'confirm message should be string.');
    window.onbeforeunload =  function (e) {
	var e = e || window.event;

	// For IE and Firefox
	if (e) {
	    e.returnValue = msg;
	}

	// For Safari
	return msg;
    };
};

/**
 * don't show confirmation window when user close window.
 */
utils.removeCloseConfirm = function () {
    window.onbeforeunload = undefined;
};
