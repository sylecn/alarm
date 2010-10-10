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
    alarm.hours = +$('#hours').val();
    alarm.minutes = +$('#minutes').val();
    // TODO check hours and minutes, they should be a number
    alarm.hour = +$('#hour').val();
    alarm.minute = +$('#minute').val();
    // TODO check hour and minute, they should be 0-23 and 0-59
    alarm.showMessage = $('#show_message').attr('checked');
    alarm.playSound = $('#play_sound').attr('checked');
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
    alarm.alarmId = null;

    var now = new Date();
    var msg = 'alarm triggered at ' + alarm.formatTime(now) + '.';
    alarm.log(msg);
    $('#state').text(msg);
    $('#remove_alarm').hide();

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
	$('#remove_alarm').hide();
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
	    alarm.log('alarm after ' + alarm.hours + ' hours, '
		      + alarm.minutes + ' minutes.');
	    ms = alarm.minutesToMS(alarm.hours * 60 + alarm.minutes);
	    alarm.log('that\'s ' + ms + ' milliseconds.');
	    alarmDate = new Date();
	    alarmDate.setTime(alarmDate.getTime() + ms);
	    alarm.log('at ' + alarmDate.toLocaleString());
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
	    alarm.log('alarm at '
		      + alarm.pad(alarm.hour) + ':' + alarm.pad(alarm.minute));
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
	}

	// now ms has the milliseconds for setTimeout
	// alarmDate is a Date object representing when the alarm will run.

	if (alarm.alarmId !== null) {
	    // remove old alarm
	    window.clearTimeout(alarm.alarmId);
	    alarm.log('old alarm removed.');
	}
	alarm.alarmId = window.setTimeout(alarm.runAlarm, ms);

	$('#state').text('alarm at ' + alarm.formatTime(alarmDate) + '.');
	$('#remove_alarm').show();

	return false;
    });
});
