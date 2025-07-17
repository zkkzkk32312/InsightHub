import './ChatWidget.css';
import React, { useRef, useEffect, useReducer } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SyncLoader } from 'react-spinners';
import { faAngleDoubleDown, faAngleDoubleUp } from '@fortawesome/free-solid-svg-icons';
import { faLightbulb, faUser } from '@fortawesome/free-regular-svg-icons';

// Consolidated state management using useReducer
const initialChatState = {
  messages: [
    { id: 0, message: "Hello! I'm your insight assistant. You can ask me anything about the IOT data here.", senderName: "Bot" },
  ],
  isLoading: false,
  error: null,
  nextMessageId: 1,
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { ...action.payload, id: state.nextMessageId }],
        nextMessageId: state.nextMessageId + 1,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'REPLACE_LOADING_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg.id === action.payload.loadingId 
            ? { ...action.payload.newMessage, id: action.payload.loadingId }
            : msg
        ),
        isLoading: false,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// UI state management
const initialUIState = {
  isMinimized: true,
  newMessage: '',
  isSending: false,
};

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_MINIMIZED':
      return {
        ...state,
        isMinimized: !state.isMinimized,
      };
    
    case 'SET_NEW_MESSAGE':
      return {
        ...state,
        newMessage: action.payload,
      };
    
    case 'SET_SENDING':
      return {
        ...state,
        isSending: action.payload,
      };
    
    case 'CLEAR_INPUT':
      return {
        ...state,
        newMessage: '',
      };
    
    default:
      return state;
  }
};

const ChatWidget = () => {
  const [chatState, dispatchChat] = useReducer(chatReducer, initialChatState);
  const [uiState, dispatchUI] = useReducer(uiReducer, initialUIState);
  
  const messageEndRef = useRef(null);
  const sampleQuestions = [
    "which device uses the most electricity?",
    "which device generates the most electricity?",
    "give me the top 3 devices that has the highest voltage readings.",
    "give me the top 3 devices that generates the most electricity."
  ];

  const handleOnSend = async () => {
    if (!uiState.newMessage.trim()) return;
    
    dispatchUI({ type: 'SET_SENDING', payload: true });
    
    // Add user message
    dispatchChat({ 
      type: 'ADD_MESSAGE', 
      payload: { 
        message: uiState.newMessage.trim(), 
        senderName: "You", 
      } 
    });
    
    // Add loading message
    const loadingMessageId = chatState.nextMessageId + 1;
    dispatchChat({
      type: 'ADD_MESSAGE',
      payload: {
        message: <SyncLoader color="#3B82F6" size={4}/>,
        senderName: "Bot",
        isLoading: true,
      }
    });
    
    const currentMessage = uiState.newMessage.trim();
    dispatchUI({ type: 'CLEAR_INPUT' });
    dispatchChat({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch(`https://iotinsight.zackcheng.com/ask?q=${encodeURIComponent(currentMessage)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Replace loading message with bot response
      dispatchChat({
        type: 'REPLACE_LOADING_MESSAGE',
        payload: {
          loadingId: loadingMessageId,
          newMessage: {
            message: data.answer,
            senderName: "Bot",
          }
        }
      });
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Replace loading message with error message
      dispatchChat({
        type: 'REPLACE_LOADING_MESSAGE',
        payload: {
          loadingId: loadingMessageId,
          newMessage: {
            message: "Error: Could not send message. Please check your connection and try again.",
            senderName: "Bot",
          }
        }
      });
      
      dispatchChat({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatchUI({ type: 'SET_SENDING', payload: false });
    }
  };

  const handleSampleQuestionClick = (question) => {
    dispatchUI({ type: 'SET_NEW_MESSAGE', payload: question });
  };

  const handleToggleMinimized = () => {
    dispatchUI({ type: 'TOGGLE_MINIMIZED' });
  };

  const handleInputChange = (e) => {
    dispatchUI({ type: 'SET_NEW_MESSAGE', payload: e.target.value });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !uiState.isSending) {
      handleOnSend();
    }
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  return (
    <div className="chat-widget" data-minimized={uiState.isMinimized}>
      {/* Minimize/Maximize Button */}
      <div
        className="chat-header bg-bkg3"
        onClick={handleToggleMinimized}
      >
        <div className='w-full text-center'>AI Insight</div>
        {uiState.isMinimized ? (
          <FontAwesomeIcon icon={faAngleDoubleDown} title="Expand" />
        ) : (
          <FontAwesomeIcon icon={faAngleDoubleUp} title="Collapse" />
        )}
      </div>

      {/* Chat messages */}
      <div className="chat-message-area bg-bkg" data-minimized={uiState.isMinimized}>
        {chatState.messages.map((msg) => {
          const isUser = msg.senderName === 'You';
          const colorClass = isUser
            ? 'bg-blue-500'
            : 'bg-bkg2 text-content';

          return (
            <div key={msg.id} className="message-container" data-user={isUser}>
              {!isUser && (
                <FontAwesomeIcon icon={faLightbulb} className="avatar" />
              )}
              <div className={`message-bubble ${colorClass}`} data-user={isUser}>
                {msg.message}
              </div>
              {isUser && <FontAwesomeIcon icon={faUser} className="avatar" />}
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>


      <div className="scroll bg-bkg">
        <div className="mask-fade-x">
          <div className="animate-scroll-left ">
            {[...sampleQuestions, ...sampleQuestions].map((q, index) => (
              <span
                key={index}
                onClick={() => handleSampleQuestionClick(q)}
                className ="bg-bkg3"
              >
                {q}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Input area */}
      {!uiState.isMinimized && (
        <div className="input-area bg-bkg2">
          <input
            type="text"
            className="input-field"
            placeholder="Type a message..."
            value={uiState.newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={uiState.isSending}
          />
          <button
            onClick={handleOnSend}
            className="send-button"
            disabled={uiState.isSending || !uiState.newMessage.trim()}
          >
            {uiState.isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;