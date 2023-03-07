import React from 'react'
import Markdown from "markdown-to-jsx";
import Prism from 'prismjs';

const ChatMessage = ({message , loadingCheck}) => {
    return (
    <div className={`chat-message ${message.role === "assistant" && "chatgpt"}`}>
        <div className="chat-message-center">
            <div className={`avatar ${message.role === "assistant" && "chatgpt"}`}>
                AI
            </div>
            <div className="message">
                {loadingCheck ?
                <div class="loading-container">
                    <div class="loading-bar"></div>
              </div> : <Markdown>{message.content}</Markdown> }
            </div>
        </div>
    </div>
    )
}

export default ChatMessage
