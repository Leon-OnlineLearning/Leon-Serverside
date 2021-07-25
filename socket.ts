// https://stackoverflow.com/questions/51448297/share-server-from-socket-io-between-files

let io: any;
module.exports = {
    init: function (server: any) {
        // start socket.io server and cache io value
        io = require("socket.io").listen(server);
        io.origins("*:*");
        return io;
    },
    getIO: function () {
        // return previously cached value
        if (!io) {
            throw new Error(
                "must call .init(server) before you can call .getIO()"
            );
        }
        return io;
    },
};
