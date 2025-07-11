import './ChatWidget.css';
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleDown, faAngleDoubleUp } from '@fortawesome/free-solid-svg-icons';
import { faLightbulb, faUser } from '@fortawesome/free-regular-svg-icons';

const ChatWidget = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState([
    { id: 0, message: "Hello! I'm your insight assistant. You can ask me anything about the IOT data here.", senderName: "Bot", isUser: false },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messageEndRef = useRef(null);
  const sampleQuestions = [
    "which device uses the most electricity?",
    "which device generates the most electricity?",
    "give me the top 3 devices that has the highest voltage readings.",
    "give me the top 3 devices that generates the most electricity."
  ];

  const handleOnSend = async () => {
    if (!newMessage.trim()) return;
    const nextId = messages.length;
    const userMessage = { id: nextId, message: newMessage.trim(), senderName: "You", isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    try {
      const response = await fetch(`http://localhost:8000/ask?q=${newMessage.trim()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const botMessage = { id: nextId + 1, message: data.answer, senderName: "Bot", isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = { id: nextId + 1, message: "Error: Could not send message. Please check your connection and try again.", senderName: "Bot", isUser: false };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  function handleSampleQuestionClick(question) {
    setNewMessage(question);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-widget" data-minimized={isMinimized}>
      {/* Minimize/Maximize Button */}
      <div
        className="chat-header"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className='w-full text-center'>AI Insight</div>
        {isMinimized ? (
          <FontAwesomeIcon icon={faAngleDoubleDown} title="Expand" />
        ) : (
          <FontAwesomeIcon icon={faAngleDoubleUp} title="Collapse" />
        )}
      </div>

      {/* Chat messages */}
      <div className="chat-message-area" data-minimized={isMinimized}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className="message-container"
            data-user={msg.isUser}
          >
            {!msg.isUser && (
              <FontAwesomeIcon icon={faLightbulb} className="avatar" />
            )}
            <div className="message-bubble" data-user={msg.isUser}>
              {msg.message}
            </div>
            {msg.isUser && (
              <FontAwesomeIcon icon={faUser} className="avatar" />
            )}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="scroll mask-fade-x">
        <div className="animate-scroll-left">
          {[...sampleQuestions, ...sampleQuestions].map((q, index) => (
            <span
              key={index}
              onClick={() => handleSampleQuestionClick(q)}
            >
              {q}
            </span>
          ))}
        </div>
      </div>

      {/* Input area */}
      {!isMinimized && (
        <div className="input-area">
          <input
            type="text"
            className="input-field"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleOnSend()}
          />
          <button
            onClick={handleOnSend}
            className="send-button"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
