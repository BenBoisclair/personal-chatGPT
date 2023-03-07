import React from 'react'
import ChatMessage from './ChatMessage'

const LoadingChat = () => {
    return (
        <div>
            <ChatMessage message={{role: 'assistant', content: 'Loading'}} loadingCheck={true} />
        </div>
    )
}

export default LoadingChat;