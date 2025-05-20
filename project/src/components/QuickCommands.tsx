import React from 'react';
import Draggable from 'react-draggable';
import { useChat } from '../context/ChatContext';
import { User, Guitar as Hospital, Leaf, Clock, AlertCircle, Pill, Heart } from 'lucide-react';

const QuickCommands: React.FC = () => {
  const { handleCommand } = useChat();

  const commands = [
    { id: 'doctor', text: 'I need a doctor', icon: <User size={16} /> },
    { id: 'hospital', text: 'Find a nearby hospital', icon: <Hospital size={16} /> },
    { id: 'ayurvedic', text: 'Give me ayurvedic tips', icon: <Leaf size={16} /> },
    { id: 'reminder', text: 'Remind me to take medicine', icon: <Clock size={16} /> },
    { id: 'emergency', text: 'Emergency help', icon: <AlertCircle size={16} /> },
    { id: 'medicine', text: 'What\'s this medicine for?', icon: <Pill size={16} /> },
    { id: 'healthTip', text: 'Daily health tip', icon: <Heart size={16} /> }
  ];

  return (
    <Draggable handle=".drag-handle" bounds="parent">
      <div className="bg-white border-t border-b border-gray-200 shadow-sm">
        <div className="drag-handle bg-gray-100 px-4 py-1 cursor-move flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500">Quick Commands</span>
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2 p-3">
          {commands.map((command) => (
            <button
              key={command.id}
              onClick={() => handleCommand(command.text)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded-full flex items-center gap-1 transition-colors"
            >
              {command.icon}
              {command.text}
            </button>
          ))}
        </div>
      </div>
    </Draggable>
  );
};

export default QuickCommands;