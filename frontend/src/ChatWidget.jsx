import React, { useState, useRef, useEffect } from 'react';

const ChatWidget = () => {
  const [messages, setMessages] = useState([
    { id: 0, message: "Hello! I'm your assistant.", senderName: "Bot", isUser: false },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messageEndRef = useRef(null);

  const handleOnSend = () => {
    if (!newMessage.trim()) return;
    const nextId = messages.length;
    setMessages([
      ...messages,
      { id: nextId, message: newMessage.trim(), senderName: "You", isUser: true },
    ]);
    setNewMessage('');
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full max-w-md h-96 bg-white shadow-lg rounded-lg flex flex-col overflow-hidden">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} gap-2`}
          >
            {!msg.isUser && (
              <img
                src="https://img.icons8.com/ios-filled/50/007bff/user-male-circle.png"
                alt="Bot"
                className="w-8 h-8 rounded-full self-end"
              />
            )}
            <div
              className={`max-w-[75%] px-4 py-2 text-sm rounded-xl ${
                msg.isUser
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }`}
            >
              {msg.message}
            </div>
            {msg.isUser && <div className="w-8 h-8" />}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 bg-white border-t flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleOnSend()}
        />
        <button
          onClick={handleOnSend}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
