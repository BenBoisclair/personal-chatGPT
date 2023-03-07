import './App.css';
import './normal.css';
import { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import { BrowserRoute as Router, Switch, Route } from 'react-router-dom';

function PersonalAssistant() {
  const defaultPrompt = {"role": "system", "content": "You are a personal assistant that is skilled in all areas. You will answer questions for the user and help them with their tasks. Keep the answers short and to the point. You can also ask questions to help identify the user's needs even more. You will also show utmost respect to the user by calling them 'Sir'."};
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState([defaultPrompt]);
  const [setHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const maxRows = 10;

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        e.preventDefault();
        const cursorPosition = e.target.selectionStart;
        const newValue = input.substring(0, cursorPosition) + "\n" + input.substring(cursorPosition);
        setInput(newValue);
      } else {
        handleSubmit(e);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) {
      return; // don't do anything if loading
    }
    const newChatLog = [...chatLog, {role: "user", content: `${input}`}];
    setChatLog(newChatLog);
    await setInput("");
    e.target.rows = 1;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: newChatLog
        })
      });
      const data = await response.json();
      const content = data.message.content;
      await setChatLog([...newChatLog, {role: "assistant", content: `${content}`}]);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(true);
    }
  }

  function clearChat() {
    // setChatHistory([...chatLog]);
    setChatLog([defaultPrompt]);
  }

  function handleInput(e) {
    setInput(e.target.value);
    const numRows = e.target.value.split('\n').length;
    e.target.rows = numRows > maxRows ? maxRows : numRows;
  }
  

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [input, chatLog]);

  return (
    <div className="App">
    <aside className="sidemenu">
      <div className="side-menu-button" onClick={clearChat}>
        <span>+</span>
        New Chat
      </div>
    </aside>
    <section className="chatBox">
      <div className="chat-input-holder">
        <form onSubmit={handleSubmit}>
          <textarea value={input} onChange={handleInput} className="chat-input-textarea" placeholder="Type your message here..." rows="1" onKeyDown={handleKeyDown}></textarea>
          {/* <button className="chat-input-button">Submit</button> */}
        </form>
      </div>
      <div className="chat-log scrollbar-hidden" ref={messagesEndRef}>
        {chatLog.map((message, index) => (
        (message.role != "system" ? <ChatMessage key={index} message={message}/> : '')
        ))}
        {isLoading ? <LoadingChat/> : ''}
      </div>
    </section>
    </div>
  );
}

export default App;

const LoadingChat = () => {
  return (
    <div>
      <ChatMessage message={{role: 'assistant', content: 'Loading'}} loadingCheck={true} />
    </div>
  )
}