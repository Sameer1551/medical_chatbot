import React from 'react';
import { X } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4 relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold text-blue-600 mb-4">About Medical Chat Bot</h2>
        
        <div className="space-y-4 text-gray-700">
          <p>
            I'm your AI-powered medical assistant designed to provide helpful medical information and assistance.
          </p>
          
          <h3 className="text-lg font-semibold text-blue-500">What I can do:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide emergency contact numbers</li>
            <li>Help you find nearby hospitals and medical stores</li>
            <li>Share ayurvedic tips for common health issues</li>
            <li>Provide daily health tips</li>
            <li>Help you understand what different medicines are for</li>
            <li>Set reminders for taking your medicine</li>
            <li>Help you find a doctor based on your needs</li>
          </ul>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Important:</strong> While I provide general medical information, I'm not a replacement for professional medical advice. Always consult with a qualified healthcare provider for medical concerns.
            </p>
          </div>
          
          <p>
            Use the quick command buttons or simply type your questions to get started!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;