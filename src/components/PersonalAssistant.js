import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import AuthDetails from './AuthDetails';
import LogOut from './LogOut';
import LoadingChat from './LoadingChat';
import Home from './Home';

import { auth, app } from '../firebase';
import { getFirestore } from "firebase/firestore";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';

function PersonalAssistant() {
  const defaultPrompt = {"role": "system", "content": "You are a personal assistant that is skilled in all areas. You will answer questions for the user and help them with their tasks. Keep the answers short and to the point. You can also ask questions to help identify the user's needs even more. You will also show utmost respect to the user by calling them 'Sir'."};
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState([defaultPrompt]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatHistoryLoaded, setChatHistoryLoaded] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clearConversationsText, setClearConversationsText] = useState('Clear All Conversations');
  const [clearConversationConfirm, setClearConversationConfirm] = useState(false);
  const [clearConversationTimer, setClearConversationTimer] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [deleteToggle, setDeleteToggle] = useState(false);
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
      return; 
    }
    if (input === '') {
      return;
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

      const newLog = [...newChatLog, {role: "assistant", content: `${content}`}];
      if (chatHistory.length > 0) {
        const currentLogIndex = chatHistory.map(chat => JSON.stringify(chat.chatLog)).indexOf(JSON.stringify(chatLog));
        if (currentLogIndex >= 0) {
          const updatedChatLog = {...chatHistory[currentLogIndex], chatLog: newLog};
          const updatedChatHistory = [...chatHistory];
          updatedChatHistory[currentLogIndex] = updatedChatLog;
          setChatHistory(updatedChatHistory);
        }
      }
    } catch (error) {
      setIsLoading(true);
    }
  }

  async function clearChat() {
    if(chatLog.length < 2 || isLoading) {
      return;
    }

    const currentLogIndex = currentLog !== null ? chatHistory.findIndex((chat) => chat.id === currentLog) : -1;

    if (currentLogIndex >= 0) {
      setChatLog([defaultPrompt]);
      setCurrentLog(null);
      return;
    }

    setCurrentLog(null);
    setChatLoading(true);
    const summarizeChatLog = [...chatLog, {role: "user", content: 'What is the main topic of this conversation in one sentence? Keep it to 5 words or less.'}];
    try {
      const response = await fetch('http://localhost:3001/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: summarizeChatLog
        })
      });
      const data = await response.json();
      const content = data.message.content;
      const storeChatLog = {id: chatHistory.length, name: content, chatLog: chatLog}
      setChatHistory([...chatHistory, storeChatLog]);
      setChatLog([defaultPrompt]);
      setChatLoading(false);
    } catch (error) {
      console.error(error);
    }
  }

  function handleInput(e) {
    setInput(e.target.value);
    const numRows = e.target.value.split('\n').length;
    e.target.rows = numRows > maxRows ? maxRows : numRows;
  }

  function setChatLogButton(e) {
    const chatLogId = parseInt(e.target.dataset.id)
    const newChatLog = chatHistory.find((chat) => chat.id === chatLogId).chatLog;
    setChatLog(newChatLog);
    setCurrentLog(chatLogId);
  }

  function clearConversations() {
    setChatHistoryLoaded(false);
    const db = getFirestore(app);
    const userRef = doc(db, 'users', localStorage.getItem('uid'));
    updateDoc(userRef, { chatLog: [] })
      .then(() => {
        setChatHistory([]);
        setChatHistoryLoaded(true);
        setClearConversationsText('Clear All Conversations');
      })
      .catch((error) => {
        console.error('Error clearing conversations:', error);
      });
  }


  function handleClearConversationsClick() {
    if (chatHistoryLoaded === false) {
      return;
    }
    if (chatHistory.length === 0) {
      return;
    }
    if (clearConversationTimer) {
      clearTimeout(clearConversationTimer);
      setClearConversationTimer(null);
    }
    if (clearConversationConfirm) {
      setClearConversationsText('Clearing...');
      clearConversations();
      setClearConversationConfirm(false);
    } else {
      setClearConversationsText('Are you sure?');
      setClearConversationConfirm(true);
      const timer = setTimeout(() => {
        setClearConversationsText('Clear All Conversations');
        setClearConversationConfirm(false);
      }, 5000);
      setClearConversationTimer(timer);
    }
  }

  function handleDelete (e) {
    const chatLogId = parseInt(e.target.dataset.id)
    const updatedChatHistory = chatHistory.filter((chat) => chat.id !== chatLogId);
    setChatHistory(updatedChatHistory);
    setDeleteToggle(false);
  }

  function handleToggleDelete (e) {
    setDeleteToggle(!deleteToggle);
  }
  
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [input, chatLog]);

  useEffect(() => {
    async function loadChatHistory() {
      const db = getFirestore(app);
      const userRef = doc(db, 'users', localStorage.getItem('uid'));
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const loadedChatHistory = docSnap.data().chatLog;
        setChatHistory(loadedChatHistory);
      } else {
        console.log('No such document!');
      }
      setChatHistoryLoaded(true);
    }

    if (isLoggedIn) {
      loadChatHistory();
    } else {
      setChatHistoryLoaded(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (chatHistoryLoaded && chatHistory.length > 0) {
      const db = getFirestore(app);
      setDoc(doc(db, 'users', localStorage.getItem('uid')), {
        chatLog: chatHistory,
      }, { merge: true });
    }
  }, [chatHistory, chatHistoryLoaded]);


  return (
    <div className="personalAI">
      <aside className="sidemenu">
        <AuthDetails name={localStorage.getItem('name')}/>
        <NewChatButton onClick={clearChat}/>
        <ChatHistoryContainer deleteToggle={deleteToggle} handleDelete={handleDelete} chatHistory={chatHistory} setChatLogButton={setChatLogButton} currentLog={currentLog} chatHistoryLoaded={chatHistoryLoaded} chatLoading={chatLoading}/>
        <DeleteConversationButton onClick={handleToggleDelete}/>
        <ClearConversationButton onClick={handleClearConversationsClick} clearConversationsText={clearConversationsText}/>
        <LogOut/>
      </aside>
      <section className="chatBox">
        <ChatInput input={input} handleInput={handleInput} handleSubmit={handleSubmit} handleKeyDown={handleKeyDown}/>
        {chatLog.length > 1 ? <Chat chatLog={chatLog} messagesEndRef={messagesEndRef} isLoading={isLoading}/> : <Home />}
      </section>
    </div>
  );
}

export default PersonalAssistant;

const DeleteConversationButton = ({ onClick = null, deleteToggle = null }) => {
  return (
    <div className="side-menu-button delete-conversation-button" onClick={onClick}>
      Delete Conversation
    </div>
  )
}

const ChatInput = ({ input, handleInput, handleSubmit, handleKeyDown }) => {
  return (
    <div className="chat-input-holder">
      <form onSubmit={handleSubmit}>
        <textarea value={input} onChange={handleInput} className="chat-input-textarea" placeholder="Type your message here..." rows="1" onKeyDown={handleKeyDown}></textarea>
        {/* <button className="chat-input-button">Submit</button> */}
      </form>
    </div>
  )
}

const ChatHistory = ({ chat, keyID, onClick = null, currentLog = null, deleteToggle = null, handleDelete=null}) => {

  function toTitleCase(str) {
    return str.replace(/\b\w+/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  return (
    <div className={`chat-history-item ${currentLog === chat.id ? 'highlight' : ''} ${currentLog === 'loading' ? 'chatLoading' : ''}`} key={keyID} title={toTitleCase(chat.name)} onClick={onClick} data-id={chat.id}>
      {toTitleCase(chat.name)}{currentLog !== 'loading' && deleteToggle ? <button onClick={handleDelete} class='chat-history-delete' data-id={chat.id}>Delete</button> : null}
    </div>
  )
}

const ChatHistoryContainer = ({ chatHistory, setChatLogButton = null, currentLog = null, chatLoading, chatHistoryLoaded, deleteToggle = null, handleDelete}) => {

  function reverse (chatHistory) {
    let newChatHistory = [];
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      newChatHistory.push(chatHistory[i]);
    }
    return newChatHistory;
  }

  const reversedChatHistory = reverse(chatHistory);

  return (
    <div className='chat-history-container'>
      {chatHistoryLoaded ?
      <div>
        {chatLoading ? <ChatHistory chat={{name: ''}} currentLog='loading'/> : ''}
        {reversedChatHistory.map((chat, index) => (
          <ChatHistory keyID={index} chat={chat} onClick={deleteToggle ? null : setChatLogButton} currentLog={currentLog} deleteToggle={deleteToggle} handleDelete={handleDelete}/>
        ))}
      </div> : <div className="loader"></div>}
    </div>
  )
}

const Chat = ({ chatLog, messagesEndRef, isLoading}) => {
  return (
    <div className="chat-log scrollbar-hidden" ref={messagesEndRef}>
      {chatLog.map((message, index) => (
      (message.role !== "system" ? <ChatMessage keyID={index} message={message}/> : '')
      ))}
      {isLoading ? <LoadingChat/> : ''}
    </div>
  )
}

const NewChatButton = ({onClick}) => {
  return (
    <div className="side-menu-button new-chat-button" onClick={onClick}>
      <span>+</span>
      New Chat
    </div>
  )
}

const ClearConversationButton = ({onClick, clearConversationsText}) => {
  return (
    <div className="side-menu-button clear-conversation-button" onClick={onClick}>
      {clearConversationsText}
    </div>
  )
}