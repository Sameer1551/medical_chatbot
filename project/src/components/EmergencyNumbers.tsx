import React from 'react';
import { Phone } from 'lucide-react';

const EmergencyNumbers: React.FC = () => {
  const emergencyNumbers = [
    { id: 'ambulance', name: 'Ambulance', number: '108', color: 'bg-red-500' },
    { id: 'police', name: 'Police', number: '100', color: 'bg-blue-700' },
    { id: 'fire', name: 'Fire', number: '101', color: 'bg-orange-600' },
    { id: 'emergency', name: 'Emergency', number: '112', color: 'bg-green-600' },
    { id: 'women', name: 'Women Helpline', number: '181', color: 'bg-purple-600' },
    { id: 'child', name: 'Child Helpline', number: '1098', color: 'bg-yellow-600' }
  ];

  const handleCall = (number: string) => {
    // In a real implementation this would interact with a backend
    // to place the call, but we'll simulate it for now
    window.open(`tel:${number}`, '_self');
  };

  return (
    <div className="inline-block bg-white rounded-lg p-4 shadow-md max-w-[95%]">
      <h3 className="font-medium text-gray-900 mb-3">Emergency Contact Numbers</h3>
      <div className="grid grid-cols-2 gap-2">
        {emergencyNumbers.map((emergency) => (
          <button
            key={emergency.id}
            onClick={() => handleCall(emergency.number)}
            className={`${emergency.color} text-white py-2 px-3 rounded flex items-center justify-between transition-transform hover:scale-105`}
          >
            <span>{emergency.name}</span>
            <div className="flex items-center">
              <span className="mr-1">{emergency.number}</span>
              <Phone size={16} />
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Click on any number to place a call
      </p>
    </div>
  );
};

export default EmergencyNumbers;