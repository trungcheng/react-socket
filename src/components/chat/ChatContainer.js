import React, { Component } from 'react';
import { COMMUNITY_CHAT, MESSAGE_SENT, MESSAGE_RECEIVED, TYPING } from '../../Events';
import SideBar from './SideBar';
import ChatHeading from './ChatHeading';
import Messages from '../message/Messages';
import MessageInput from '../message/MessageInput';

export default class ChatContainer extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            chats: [],
            activeChat: null
        };
    }

    componentDidMount() {
        const { socket } = this.props;
        socket.emit(COMMUNITY_CHAT, this.resetChat);
    }

    resetChat = (chat) => {
        return this.addChat(chat, true);
    }

    addChat = (chat, reset) => {
        const { socket } = this.props;
        const { chats } = this.state;

        const newChats = reset ? [chat] : [...chats, chat];
        this.setState({ chats: newChats });

        const messageEvent = `${MESSAGE_RECEIVED}-${chat.id}`;
        const typingEvent = `${TYPING}-${chat.id}`;

        socket.on(typingEvent);
        socket.on(messageEvent, this.addMessageToChat(chat.id));
    }

    addMessageToChat = (chatId) => {
        return message => {
            const { chats } = this.state;
            let newChats = chats.map((chat) => {
                if (chat.id === chatId)
                    chat.messages.push(message);
                return chat;
            })

            this.setState({ chats: newChats });
        }
    }

    updateTypingInChat = (chatId) => {

    }

    setActiveChat = (activeChat) => {
        this.setState({ activeChat });
    }

    sendMessage = (chatId, message) => {
        const { socket } = this.props;
        socket.emit(MESSAGE_SENT, {chatId, message});
    }

    sendTyping = (chatId, isTyping) => {
        const { socket } = this.props;
        socket.emit(TYPING, {chatId, isTyping});
    }

    render() {
        const { user, logout } = this.props;
        const { chats, activeChat } = this.state;
        return (
            <div>
                <SideBar
                    logout={logout}
                    chats={chats}
                    user={user}
                    activeChat={activeChat}
                    setActiveChat={this.setActiveChat}
                />
                <div className="chat-room-container">
                    {
                        activeChat !== null ? (

                            <div className="chat-room">
                                <ChatHeading name={activeChat.name} />
                                <Messages
                                    messages={activeChat.messages}
                                    user={user}
                                    typingUsers={activeChat.typingUsers}
                                />
                                <MessageInput
                                    sendMessage={
                                        (message) => {
                                            this.sendMessage(activeChat.id, message)
                                        }
                                    }
                                    sendTyping={
                                        (isTyping) => {
                                            this.sendTyping(activeChat.id, isTyping)
                                        }
                                    }
                                />
                            </div>

                        ):
                        <div className="chat-room choose">
                            <h3>Choose a chat!</h3>
                        </div>
                    }
                </div>
            </div>
        );
    }
}