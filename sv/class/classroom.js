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
    var readdir = function (dir, store) {
        console.log (dir);

        fs.readdir(dir, function(err, items) {
            for (var i=0; i < items.length; i++) {
         
                if (fs.statSync(dir + '/' + items[i]).isDirectory ())
                    readdir(dir + '/' + items[i], store [items[i]]);
                else {
                    store.push ({folder: false, name: items[i]});

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

    readdir (__dirname + '/projects/user_id/class_name', tree_view);

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