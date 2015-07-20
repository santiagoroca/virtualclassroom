var CONNECTION_MANAGER = function (con) {

    var events = [];
    var dispatchEvent = function (evt, param) {
        for (var i = 0; i < events.length; i++) if (events [i].evt = evt) events [i].fn (param);
    }

    con.on('message', function (message) {
        if (message.type === 'utf8') {
            var msg = JSON.parse(message.utf8Data);
            dispatchEvent (msg.endPoint, msg);
        }
    });

    this.addEventListener = function (evt, fn) {
        var uid = Math.floor(Math.random () * 10000) + 1;
        events.push ({evt: evt, fn: fn, uid: uid});
        return uid;
    }

    this.removeEventListener = function (uid) {
        for (var i = 0; i < events.length; i++) if (events [i].uid = uid) events.splice (i, 1);
    }

    this.send = function (d) {
        con.send(JSON.stringify(d), function (err) {} );
    }

}