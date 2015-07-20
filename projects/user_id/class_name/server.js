try {

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

                    case 'log_in': {
                        if (msg.type == 'CLASSROOM') {
                            classroom [msg.id] = ({
                                students: []
                            });

                            id = msg.id;
                        } else {
                            classroom [msg.c_id].students.push ({
                                id: msg.id,
                                request: connection
                            });

                            id = msg.id;
                            c_id = msg.c_id;

                            if (classroom [c_id])
                                connection.send(
                                    JSON.stringify({
                                        endPoint: 'change',
                                        data: classroom [c_id].data
                                    })
                                , function (err) {} );
                            
                        }
                    } break;

                    case 'change': {
                        classroom [id].data = msg.data;

                        for (var i = 0; i < classroom [id].students.length; i++) {

                            classroom [id].students [i] .request.send(
                                JSON.stringify({
                                    endPoint: 'change',
                                    data: msg.data
                                })
                            , function (err) {} );

                        }

                    }

                }

            }
        });

        connection.on('close', function (con) {
            classroom [c_id].students.splice (getStudentIndex (id), 1);

            var d = new Date();
            fs.writeFile('logfile.log', d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + ' Connection Closed' + '\n', {flag: 'a'}, function (err) {
                var d = new Date();
                if (err)
                    fs.writeFile('error.log', d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + ' 90 ' + err + '\n', {flag: 'a'}, function (err) {
                        if (err) throw err;
                    });
            });
        });

        function getStudentIndex (id) {

            for (var i = 0; i < classroom [c_id].students.length; i++) {
                if (classroom [c_id].students [i].id == id) return i;
            }

        } 

    });

    

} catch (err) {
    var d = new Date();
    fs.writeFile('error.log', d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + ' 157 ' + err + '\n', {flag: 'a'}, function (err) {
        if (err) throw err;
    });
}