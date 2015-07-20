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

var CONSTANTS = new function () {

    var contants = [
        [
            'Error opening file. Try again.'
        ]
    ];

    this.get = function (l_id, c_id) {
        return contants [l_id][c_id];
    }

}

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

var CLASSROOM = function (data, con) {

    var cmanager = new CONNECTION_MANAGER (con);
    var id = data.id;
    var n_active = null;

    var events = [];
    var dispatchEvent = function (evt, param) {
        for (var i = 0; i < events.length; i++) if (events [i].evt = evt) events [i].fn (param);
    }

    var datachangeDispatcher = function (e) {
        dispatchEvent ('datachange', {data: e.data});
    }

    var tree_view = [];
    var readdir = function (dir) {
        fs.readdir(dir, function(err, items) {
            for (var i=0; i < items.length; i++) {
         
                if (fs.statSync(dir + '/' + items[i]).isDirectory ())
                    tree_view.push ({folder: true, name: items[i]});
                else {
                    tree_view.push ({folder: false, name: items[i]});

                    if (!n_active) {
                        n_active = items[i];

                        fs.readFile(__dirname + '/projects/user_id/class_name/' + n_active, "utf8", function(err, data) {
                            if (err) {
                                cmanager.send ({endPoint: 'err', data: CONSTANTS.get (0,0) });
                                return;
                            }

                            cmanager.send ({endPoint: 'current_file_data', data: data});
                        });
                    }
                }

            }

            cmanager.send ({endPoint: 'treeview', data: tree_view});
        });
    }

    readdir (__dirname + '/projects/user_id/class_name');

    cmanager.addEventListener ('change', datachangeDispatcher);

    this.addEventListener = function (evt, fn) {
        var uid = Math.floor(Math.random () * 10000) + 1;
        events.push ({evt: evt, fn: fn, uid: uid});
        return uid;
    }

    this.removeEventListener = function (uid) {
        for (var i = 0; i < events.length; i++) if (events [i].uid = uid) events.splice (i, 1);
    }

    this.getClasroomId = function () {
        return id;
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