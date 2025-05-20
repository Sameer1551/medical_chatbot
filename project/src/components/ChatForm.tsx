import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const ChatForm: React.FC = () => {
  const [input, setInput] = useState('');
  const { handleUserMessage, isWaitingForResponse } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim() === '' || isWaitingForResponse) return;
    
    const message = input;
    setInput('');
    await handleUserMessage(message);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isWaitingForResponse}
          placeholder="Type your message..."
          className="flex-1 p-3 rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isWaitingForResponse || input.trim() === ''}
          className="bg-blue-500 text-white p-3 rounded-r-full disabled:bg-blue-300 hover:bg-blue-600 transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
};

export default ChatForm;