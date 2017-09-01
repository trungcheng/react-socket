const app = require('http').createServer();
const io = module.exports.io = require('socket.io')(app);

const SocketManager = require('./SocketManager');
const port = process.env.PORT || 3200;

io.on('connection', SocketManager);

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});