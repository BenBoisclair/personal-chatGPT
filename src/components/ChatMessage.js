import React from 'react'
import Markdown from "markdown-to-jsx";
import Prism from 'prismjs';

const ChatMessage = ({message , loadingCheck}) => {
    return (
    <div className={`chat-message ${message.role === "assistant" && "chatgpt"}`}>
        <div className="chat-message-center">
            <div className={`avatar ${message.role === "assistant" && "chatgpt"} ${message.role}`}>
                {message.role === "assistant" ? 'AI' : <img className='userAvatar' src={localStorage.getItem('photo')} alt="avatar" />}
            </div>
            <div className="message">
                {loadingCheck ?
                <div className="loading-container">
                    <div className="loading-bar"></div>
                </div> : <Markdown>{message.content}</Markdown> }
            </div>
        </div>
    </div>
    )
}

export default ChatMessage
