WebSocketServer = require('websocket').server;
http = require('http');
fs = require('graceful-fs');
async = require('async');
express = require('express');
bodyParser = require('body-parser');
mkdirp = require('mkdirp');

var app = express();
var server = app.listen(8888, function () {});

wsServer = new WebSocketServer({
    httpServer: server
});

var classroom = [];
var students = [];

wsServer.on('request', function(request) {
    var id;
    var c_id;

    var d = new Date();
    fs.writeFile('logfile.log', d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + ' Connection Opened' + '\n', {flag: 'a'}, function (err) {
        var d = new Date();
        if (err)
            fs.writeFile('error.log', d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + ' 29 ' + err + '\n', {flag: 'a'}, function (err) {
                if (err) throw err;
            });
    });

    var connection = request.accept(null, request.origin);

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            var msg = JSON.parse(message.utf8Data);

            switch (msg.endPoint) {

                case 'register': {
                    if (msg.type == 'CLASSROOM') {
                        classroom.push (new CLASSROOM (msg, connection));
                    } else {
                        for (var i = 0; i < classroom.length; i++) {
                            if (classroom [i].getClasroomId () == msg.c_id) {
                                students.push(new STUDENT(msg, connection, classroom [i]));
                                break;
                            }
                        }
                            
                    }
                } break;

            }

        }
    });

});

var CLASSROOM = function (data, con) {

    var id = data.id;
    var n_active = data.n_active;

    fs.readFile(n_active, "utf8", function(err, data) {
        if (err) {
            send ({endPoint: 'err', data: 'Error opening file. Try again.'});
            return;
        }

        send ({endPoint: 'current_file_data', data: data});
    });

    var events = [];
    var dispatchEvent = function (evt, param) {
        for (var i = 0; i < events.length; i++) if (events [i].evt = evt) events [i].fn (param);
    }

    this.addEventListener = function (evt, fn) {
        var uid = Math.floor(Math.random () * 10000) + 1;
        events.push ({evt: evt, fn: fn, uid: uid});
        return uid;
    }

    this.removeEventListener = function (l) {
        for (var i = 0; i < events.length; i++) if (events [i].uid = uid) events.splice (i, 1);
    }

    this.getClasroomId = function () {
        return id;
    }

    con.on('message', function (message) {
        if (message.type === 'utf8') {
            var msg = JSON.parse(message.utf8Data);

            switch (msg.endPoint) {

                case 'change': {
                    dispatchEvent ('datachange', {data: msg.data});
                } break;

            }

        }
    });

    var send = function (d) {
        con.send(JSON.stringify(d), function (err) {} );
    }

}

var STUDENT = function (data, con, c_room) {

    var id = data.id;
    var c_id = data.c_id;

    var active_listeners = [];

    active_listeners.push(c_room.addEventListener ('datachange', function (e) {
        send ({endPoint: 'change', data: e.data});
    }));

    con.on ('close', function (con) {
       removeListeners ();
    });

    var send = function (d) {
        con.send(JSON.stringify(d), function (err) {} );
    }

    var removeListeners = function () {
        for (var i = 0; i < active_listeners.length; i++)
           c_room.removeEventListener (active_listeners [i]); 
    }

}