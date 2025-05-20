import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import EmergencyNumbers from './EmergencyNumbers';

const ChatWindow: React.FC = () => {
  const { messages, isWaitingForResponse } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-blue-50">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`mb-4 ${
            message.sender === 'user' ? 'text-right' : ''
          }`}
        >
              {message.isEmergencyNumbers ? (
                <EmergencyNumbers />
              ) : (
                <div
                  className={`inline-block rounded-lg px-4 py-2 max-w-[80%] break-words whitespace-pre-line ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                  dangerouslySetInnerHTML={{ __html: message.text }}
                >
                </div>
              )}
        </div>
      ))}
      
      {isWaitingForResponse && (
        <div className="mb-4">
          <div className="inline-block rounded-lg px-4 py-2 bg-white text-gray-800 rounded-tl-none shadow-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow