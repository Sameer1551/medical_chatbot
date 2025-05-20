import React from 'react';
import ChatContainer from './components/ChatContainer';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <ChatProvider>
          <ChatContainer />
        </ChatProvider>
      </div>
    </AuthProvider>
  );
}

export default App