// namespace
var alarm = {
    alarmId: null
};

alarm.debuging = false;

alarm.log = function (msg) {
    if (alarm.debuging) {
	$('<span/>').text(msg).appendTo('#log');
	$('<br/>').appendTo('#log');
    }
}

alarm.pad = function (n) { return (n<10) ? '0' + n : n; };
alarm.formatTime = function (date) {
    return alarm.pad(date.getHours()) + ':' + alarm.pad(date.getMinutes());
};

/**
 * get values from form inputs
 */
alarm.getValues = function () {
    alarm.alarmType = $('input[name=alarm_type]:checked').val();
    alarm.hours = $('#hours').val();
    alarm.minutes = $('#minutes').val();
    alarm.hour = $('#hour').val();
    alarm.minute = $('#minute').val();
    alarm.showMessage = $('#show_message').attr('checked');
    alarm.playSound = $('#play_sound').attr('checked');
};

alarm.alarmAfterDataIsValid = function () {
    // hours and minutes should be a number
    if (utils.isPositiveInteger(alarm.hours)) {
	alarm.hours = +alarm.hours;
    } else {
	alert('hours should be a number.');
	return false;
    }
    if (utils.isPositiveInteger(alarm.minutes)) {
	alarm.minutes = +alarm.minutes;
    } else {
	alert('minutes should be a number.');
	return false;
    }
    return true;
};

alarm.alarmAtDataIsValid = function () {
    // check hour and minute, they should be 0-23 and 0-59
    var pattern = {
	hour: /^([01]?[0-9]|2[0-3])$/,
	minute: /^[0-5]?[0-9]$/
    };
    if (alarm.debuging) {
	utils.assert(pattern.hour.exec('00') !== null);
	utils.assert(pattern.hour.exec('03') !== null);
	utils.assert(pattern.hour.exec('13') !== null);
	utils.assert(pattern.hour.exec('20') !== null);
	utils.assert(pattern.hour.exec('23') !== null);
	utils.assert(pattern.hour.exec('24') === null);
	utils.assert(pattern.hour.exec('-1') === null);
	utils.assert(pattern.hour.exec('a2') === null);
	utils.assert(pattern.minute.exec('00') !== null);
	utils.assert(pattern.minute.exec('03') !== null);
	utils.assert(pattern.minute.exec('59') !== null);
	utils.assert(pattern.minute.exec('60') === null);
	utils.assert(pattern.minute.exec('abc') === null);
    }
    if (alarm.hour.trim().match(pattern.hour)) {
	alarm.hour = +alarm.hour;
    } else {
	alert('hours should be 00-23.');
	return false;
    }
    if (alarm.minute.trim().match(pattern.minute)) {
	alarm.minute = +alarm.minute;
    } else {
	alert('minutes should be 00-59.');
	return false;
    }
    return true;
};

/**
 * convert minutes to milliseconds
 */
alarm.minutesToMS = function (minutes) {
    return minutes * 60 * 1000;
};

/**
 * run the alarm.
 */
alarm.runAlarm = function () {
    alarm.alarmRemoved();

    var now = new Date();
    var msg = 'alarm triggered at ' + alarm.formatTime(now) + '.';
    alarm.log(msg);
    $('#state').text(msg);

    if (alarm.showMessage) {
	// ignored.
    }
    if (alarm.playSound) {
	alarm.sound.play();
    }
};

$('document').ready(function () {
    /*
     * functions
     */
    /*
     * update DOM
     */
    alarm.sound = $('#audio').get(0);
    var now = new Date();

    $('#hour').val(alarm.pad(now.getHours()));
    $('#minute').val(alarm.pad(now.getMinutes()));

    /*
     * events
     */
    $('#remove_alarm').click(function () {
	utils.assertTrue(alarm.alarmId !== null);
	window.clearTimeout(alarm.alarmId);

	alarm.alarmRemoved();

	$('#state').text('alarm removed.');
    });
    $('#play').click(function () {
	alarm.sound.play();
    });
    $('#stop').click(function () {
	alarm.sound.pause();

	// there is no stop(), so use pause().
	// see also:
	// https://developer.mozilla.org/En/XPCOM_Interface_Reference/NsIDOMHTMLMediaElement#play%28%29

	// var props = [];
	// for (prop in alarm.sound) {
	//     props.push(prop);
	// }
	// alarm.log('audio tag support: ' + props.join(', '));
    });
    $('#set_alarm').click(function () {
	var ms, alarmDate;
	var m1, m2;

	// fetch all values from form input
	alarm.getValues();

	if (alarm.alarmType === 'after') {
	    // alarm after

	    // check form input is valid
	    if (alarm.alarmAfterDataIsValid()) {
		alarm.log('alarm after ' + alarm.hours + ' hours, '
			  + alarm.minutes + ' minutes.');
		ms = alarm.minutesToMS(alarm.hours * 60 + alarm.minutes);
		alarm.log('that\'s ' + ms + ' milliseconds.');
		alarmDate = new Date();
		alarmDate.setTime(alarmDate.getTime() + ms);
		alarm.log('at ' + alarmDate.toLocaleString());
	    } else {
		return false;
	    }
	} else {
	    utils.assertEqual('at', alarm.alarmType, 'unknown alarmType');
	    // alarm at
	    // 23:59   0:15
	    // 1439    15
	    // 1:25    1:20
	    //         2:25
	    //         2:20
	    //         0:20
	    // 85      80
	    //         145
	    //         140
	    //         20
	    if (alarm.alarmAtDataIsValid()) {
		alarm.log('alarm at ' + alarm.pad(alarm.hour) + ':'
			  + alarm.pad(alarm.minute));
		alarmDate = new Date();
		m1 = alarmDate.getHours() * 60 + alarmDate.getMinutes();
		m2 = alarm.hour * 60 + alarm.minute;
		if (m2 < m1) {
		    m2 += 24 * 60;
		}
		ms = alarm.minutesToMS(m2 - m1);
		alarm.log('that\'s ' + ms + ' milliseconds.');
		alarmDate.setTime(alarmDate.getTime() + ms);
		alarm.log('at ' + alarmDate.toLocaleString());
	    } else {
		return false;
	    }
	}

	// now ms has the milliseconds for setTimeout
	// alarmDate is a Date object representing when the alarm will run.
	alarm.setAlarm(ms, alarmDate);

	return false;
    });
});

alarm.setAlarm = function (ms, alarmDate) {
    if (alarm.alarmId !== null) {
	// remove old alarm
	window.clearTimeout(alarm.alarmId);
	alarm.log('old alarm removed.');
    }
    alarm.alarmId = window.setTimeout(alarm.runAlarm, ms);

    $('#state').text('alarm at ' + alarm.formatTime(alarmDate) + '.');
    $('#remove_alarm').show();
    utils.setCloseConfirm('alarm is set on this page');
};

alarm.alarmRemoved = function () {
    alarm.alarmId = null;
    $('#remove_alarm').hide();
    utils.removeCloseConfirm();
};
