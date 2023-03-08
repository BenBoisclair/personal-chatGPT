import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import AuthDetails from './AuthDetails';
import LogOut from './LogOut';
import LoadingChat from './LoadingChat';

import { auth, provider, app } from '../firebase';
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
  const [chatLoading, setChatLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  async function clearChat() {
    if(chatLog.length < 2 || isLoading) {
      return;
    }
    setCurrentLog(null);
    setChatLoading(true);
    const summarizeChatLog = [...chatLog, {role: "user", content: 'Describe this conversation in 3 words. Use Keywords. Separate with a comma.'}];
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
        console.log('Conversations cleared');
      })
      .catch((error) => {
        console.error('Error clearing conversations:', error);
      });
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

  // useEffect(() => {
  //   const db = getFirestore(app);
  //   const userRef = doc(db, 'users', localStorage.getItem('uid'));
  //   const docSnap = getDoc(userRef);
  //   const unsubscribe = onSnapshot(docRef, (docSnap) => {
  //     if (docSnap.exists()) {
  //       const loadedChatHistory = docSnap.data().chatLog;
  //       setChatHistory(loadedChatHistory);
  //     } else {
  //       console.log('No such document!');
  //     }
  //     setChatHistoryLoaded(true);
  //   });

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
        <div className='chat-history-container'>
          {chatHistoryLoaded ?
          <div>
            {chatHistory.map((chat, index) => (
              <ChatHistory keyID={index} chat={chat} onClick={setChatLogButton} currentLog={currentLog}/>
            ))}
            {chatLoading ? <ChatHistory chat={{name: ''}} currentLog='loading'/> : ''}
          </div> : <div className="loader"></div>}
        </div>
        <div className="side-menu-button clear-conversation-button" onClick={clearConversations}>
            Clear Conversations
        </div>
        <LogOut/>
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
          (message.role !== "system" ? <ChatMessage keyID={index} message={message}/> : '')
          ))}
          {isLoading ? <LoadingChat/> : ''}
        </div>
      </section>
    </div>
  );
}

export default PersonalAssistant;

const ChatHistory = ({ chat, keyID, onClick = null, currentLog = null}) => {

  function toTitleCase(str) {
    return str.replace(/\b\w+/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  return (
    <div className={`chat-history-item ${currentLog === chat.id ? 'highlight' : ''} ${currentLog === 'loading' ? 'chatLoading' : ''}`} key={keyID} title={toTitleCase(chat.name)} onClick={onClick} data-id={chat.id}>
      <span>{toTitleCase(chat.name)}</span>
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
