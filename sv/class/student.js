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