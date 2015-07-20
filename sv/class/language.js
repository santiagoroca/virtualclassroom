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