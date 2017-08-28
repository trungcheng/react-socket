const io = require('./index').io;

module.exports = (socket) => {
    console.log("Socket Id:" + socket.id);
}