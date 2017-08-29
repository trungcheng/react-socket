const io = require('./index').io;
const { 
    VERIFY_USER, 
    USER_CONNECTED, 
    USER_DISCONNECTED, 
    COMMUNITY_CHAT, 
    LOGOUT,
    MESSAGE_RECEIVED,
    MESSAGE_SENT,
    TYPING
} = require('../Events');
const { createUser, createMessage, createChat } = require('../Factories');

let connectedUsers = {};
let communityChat = createChat();

module.exports = (socket) => {
    // clear console
    // console.log('\x1bc');
    console.log("Socket Id:" + socket.id);

    let sendMessageToChatFromUser;
    let sendTypingFromUser;

    // Verify username
    socket.on(VERIFY_USER, (nickname, cb) => {
        if (isUser(connectedUsers, nickname)) {
            cb({ isUser: true, user: null });
        } else {
            cb({ isUser: false, user: createUser({ name: nickname }) });
        }
    })

    // User connect with username
    socket.on(USER_CONNECTED, (user) => {
        connectedUsers = addUser(connectedUsers, user);
        socket.user = user;

        sendMessageToChatFromUser = sendMessageToChat(user.name);
        sendTypingFromUser = sendTypingToChat(user.name)

        io.emit(USER_CONNECTED, connectedUsers);
        console.log(connectedUsers);
    })


    // User disconnect
    socket.on('disconnect', () => {
        if ("user" in socket) {
            connectedUsers = removeUser(connectedUsers, socket.user.name);
            io.emit(USER_DISCONNECTED, connectedUsers);
        }
    })

    // User logout
    socket.on(LOGOUT, () => {
        connectedUsers = removeUser(connectedUsers, socket.user.name);
        io.emit(USER_DISCONNECTED, connectedUsers);
    })

    // Get community chat
    socket.on(COMMUNITY_CHAT, (cb) => {
        cb(communityChat);
    })

    // Sent message
    socket.on(MESSAGE_SENT, ({ chatId, message }) => {
        sendMessageToChatFromUser(chatId, message);
    })

    // Typing
    socket.on(TYPING, ({chatId, isTyping}) => {
		sendTypingFromUser(chatId, isTyping)
	})
}

const sendTypingToChat = (user) => {
	return (chatId, isTyping) => {
		io.emit(`${TYPING}-${chatId}`, {user, isTyping})
	}
}

const sendMessageToChat = (sender) => {
    return (chatId, message) => {
        io.emit(`${MESSAGE_RECEIVED}-${chatId}`, createMessage({ message, sender }));
    }
}

/*
* Add user to list passed in
*/
const addUser = (userList, user) => {
    let newList = Object.assign({}, userList);
    newList[user.name] = user;

    return newList;
}

/*
* Remove user from list passed in
*/
const removeUser = (userList, username) => {
    let newList = Object.assign({}, userList);
    delete newList[username];

    return newList;
}

/*
* Check if the user is in list passed in
*/
const isUser = (userList, username) => {
    return username in userList;
}