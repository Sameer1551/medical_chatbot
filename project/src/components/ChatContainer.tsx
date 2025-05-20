import React from 'react';
import ChatHeader from './ChatHeader';
import ChatWindow from './ChatWindow';
import ChatForm from './ChatForm';
import QuickCommands from './QuickCommands';
import MedicineReminder from './MedicineReminder';
import { useChat } from '../context/ChatContext';
import { ChevronUp } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChatContainer: React.FC = () => {
  const { 
    quickCommandsVisible, 
    setQuickCommandsVisible,
    showMedicineReminder,
    setShowMedicineReminder,
    addReminder
  } = useChat();

  return (
    <div className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[700px] relative">
      <ChatHeader />
      <ChatWindow />
      
      <div className="relative">
        {quickCommandsVisible && <QuickCommands />}
        
        <button 
          className="absolute -top-3 right-4 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
          onClick={() => setQuickCommandsVisible(!quickCommandsVisible)}
          aria-label={quickCommandsVisible ? "Hide quick commands" : "Show quick commands"}
        >
          <ChevronUp size={16} className={`transform transition-transform ${quickCommandsVisible ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <ChatForm />
      
      {showMedicineReminder && (
        <MedicineReminder
          onClose={() => setShowMedicineReminder(false)}
          onSubmit={addReminder}
        />
      )}
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ChatContainer;