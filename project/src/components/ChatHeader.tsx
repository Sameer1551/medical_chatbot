import React, { useState, useRef, useEffect } from 'react';
import { Info, RotateCw, LogIn, User } from 'lucide-react';
import AboutModal from './AboutModal';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const ChatHeader: React.FC = () => {
  const [showAbout, setShowAbout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { resetMessages } = useChat();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setShowUserDetail(false);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const handleUserDetail = () => {
    setShowUserDetail(true);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setShowUserDetail(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <span className="text-2xl mr-2" role="img" aria-label="Medical Icon">🩺</span>
          <h1 className="text-xl font-semibold">Medical Chat Bot</h1>
          <button
            onClick={() => resetMessages()}
            className="ml-2 p-1 hover:bg-blue-600 rounded-full transition-colors"
            aria-label="Refresh chat"
          >
            <RotateCw size={18} />
          </button>
        </div>
        <div className="flex items-center space-x-2 relative" ref={dropdownRef}>
          <button
            onClick={isAuthenticated ? toggleDropdown : () => setShowLogin(true)}
            className="text-white bg-blue-600 rounded-full p-3 transition-transform duration-300 ease-in-out flex items-center shadow-lg hover:shadow-xl hover:bg-blue-700 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400"
            aria-label={isAuthenticated ? "User profile" : "Login"}
            title={isAuthenticated ? `User: ${user?.name}` : "Login"}
          >
            {isAuthenticated ? (
              <>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-4 h-4 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-blue-700 flex items-center justify-center shadow-md border-2 border-white">
                    <User size={16} />
                  </div>
                )}
                <span className="ml-3 text-sm font-semibold text-white truncate max-w-xs">{user?.name}</span>
              </>
            ) : (
              <LogIn size={16} className="transition-transform duration-300 ease-in-out hover:scale-125 hover:text-blue-300" />
            )}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl z-50 text-black border border-gray-300 overflow-hidden transition-all duration-300">
              <button
                onClick={handleUserDetail}
                className="block w-full text-left px-5 py-3 hover:bg-blue-100 transition-colors font-semibold text-gray-800"
              >
                User Detail
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-5 py-3 hover:bg-blue-100 transition-colors font-semibold text-gray-800"
              >
                Logout
              </button>
            </div>
          )}
          <button
            onClick={() => setShowAbout(true)}
            className="text-white hover:bg-blue-600 rounded-full p-1 transition-colors"
            aria-label="About this chatbot"
          >
            <Info size={20} />
          </button>
        </div>
      </header>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showUserDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4 relative">
            <button
              onClick={() => setShowUserDetail(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">User Details</h2>
            <div className="space-y-2 text-gray-800">
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Phone:</strong> {user?.phone}</p>
              <p><strong>Date of Account Creation:</strong> {user?.created_at || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;
