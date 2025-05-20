import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Message } from '../types/chat';
import { useTips } from '../hooks/useTips';
import { useDailyTip } from '../hooks/useDailyTip';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  resetMessages: () => void;
  isWaitingForResponse: boolean;
  setIsWaitingForResponse: (waiting: boolean) => void;
  quickCommandsVisible: boolean;
  setQuickCommandsVisible: (visible: boolean) => void;
  handleUserMessage: (text: string) => Promise<void>;
  handleCommand: (command: string) => Promise<void>;
  getAyurvedicTip: (condition: string) => Promise<string>;
  getDailyTip: () => string;
  lastDailyTipTime: number;
  reminders: Reminder[];
  addReminder: (reminder: Reminder) => void;
  showMedicineReminder: boolean;
  setShowMedicineReminder: (show: boolean) => void;
}

export interface Reminder {
  medicine: string;
  times: string[];
  days: string[];
  numberOfDays: number | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:5000/api';

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialMessages: Message[] = [
    { id: '1', text: 'Hello! I\'m your medical assistant. How can I help you today?', sender: 'bot', timestamp: new Date() }
  ];
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const resetMessages = () => {
    setMessages(initialMessages);
  };
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [quickCommandsVisible, setQuickCommandsVisible] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showMedicineReminder, setShowMedicineReminder] = useState(false);

  const { getTip } = useTips();
  const { getDailyTip, lastTipTime } = useDailyTip();

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const addReminder = async (reminder: {
    medicine: string;
    times: Date[];
    days: string[];
    numberOfDays: number | null;
  }) => {
    try {
      const formattedReminder = {
        medicine: reminder.medicine,
        times: reminder.times.map(time => time.toISOString()),
        days: reminder.days,
        numberOfDays: reminder.numberOfDays
      };

      const response = await axios.post(`${API_BASE_URL}/reminders`, formattedReminder, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setReminders(prev => [...prev, formattedReminder]);
        toast.success('Reminder set successfully!');
        addMessage({
          id: Date.now().toString(),
          text: `Reminder set for ${reminder.medicine} ${reminder.numberOfDays ? `for ${reminder.numberOfDays} days` : `on ${reminder.days.join(', ')}`}`,
          sender: 'bot',
          timestamp: new Date()
        });
      } else {
        toast.error(response.data.message || 'Failed to set reminder. Please try again.');
      }
    } catch (error) {
      console.error('Error setting reminder:', error);
      toast.error('Failed to set reminder. Please try again.');
    }
  };

  const [awaitingMedicineInput, setAwaitingMedicineInput] = React.useState(false);
  const [awaitingAyurvedaInput, setAwaitingAyurvedaInput] = React.useState(false);
  const [awaitingSpecialistInput, setAwaitingSpecialistInput] = React.useState(false);

  const handleCommand = async (command: string) => {
    console.log('handleCommand called with:', command);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: command,
      sender: 'user',
      timestamp: new Date()
    };

    addMessage(userMessage);
    setIsWaitingForResponse(true);

    try {
      let response = '';

      switch (command) {
        case 'Give me ayurvedic tips':
          response = 'What health condition would you like ayurvedic tips for? (e.g., cough, cold, fever, headache)';
          setAwaitingAyurvedaInput(true);
          break;
        case 'I need a doctor':
          response = 'I can help you find a doctor. Could you please specify what type of specialist you need?';
          setAwaitingSpecialistInput(true);
          break;
        case 'Find a nearby hospital':
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
              const { latitude, longitude } = position.coords;
              const resp = await axios.post(`${API_BASE_URL}/nearby-hospitals`, {
                latitude,
                longitude
              });
              addMessage({
                id: (Date.now() + 2).toString(),
                text: resp.data.response,
                sender: 'bot',
                timestamp: new Date()
              });
            });
          }
          response = 'Getting your location to find nearby hospitals...';
          break;
        case 'Remind me to take medicine':
          setShowMedicineReminder(true);
          response = 'Opening medicine reminder setup...';
          break;
        case 'Emergency help':
          response = 'Here are emergency numbers you can call for immediate assistance:';
          break;
        case 'What\'s this medicine for?':
          response = 'Please type the name of the medicine you want to know about. (only FDA approved)';
          setAwaitingMedicineInput(true);
          break;
        case 'Daily health tip':
          response = getDailyTip();
          break;
        default:
          response = 'I\'m not sure how to help with that specific request. Could you try another command or rephrase?';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      addMessage(botMessage);

      if (command === 'Emergency help') {
        addMessage({
          id: (Date.now() + 2).toString(),
          text: 'EMERGENCY_NUMBERS',
          sender: 'bot',
          timestamp: new Date(),
          isEmergencyNumbers: true
        });
      }
    } catch (error) {
      console.error('Error handling command:', error);
      addMessage({
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      });
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  const handleUserMessage = async (text: string) => {
    console.log('handleUserMessage called with:', text);
    if (awaitingMedicineInput) {
      setAwaitingMedicineInput(false);
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date()
      };
      addMessage(userMessage);
      setIsWaitingForResponse(true);

      try {
        const response = await axios.post(`${API_BASE_URL}/medicine-info`, {
          medicineName: text
        });

        let botResponse = '';
        if (response.data.success) {
          const { data } = response.data;
          botResponse = `Information about ${data.medicine_name}:<br/><br/>` +
            `<b>Description:</b><br/>${data.description}<br/><br/>` +
            `<b>Purpose:</b><br/>${data.purpose}<br/><br/>` +
            `<b>Dosage:</b><br/>${data.dosage_and_administration}<br/><br/>` +
            `<b>Precautions:</b><br/>${data.precautions}`;
        } else {
          botResponse = response.data.message;
        }

        addMessage({
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error fetching medicine info:', error);
        addMessage({
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error fetching medicine information. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        });
      } finally {
        setIsWaitingForResponse(false);
      }
      return;
    }

    if (awaitingAyurvedaInput) {
      setAwaitingAyurvedaInput(false);
      console.log('Fetching ayurvedic tips for condition:', text);
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date()
      };
      addMessage(userMessage);
      setIsWaitingForResponse(true);

      try {
        const response = await axios.post(`${API_BASE_URL}/ayurvedic-tips`, {
          condition: text
        });

        let botResponse = '';
        if (response.data.success) {
          const { tips, precautions } = response.data.data;
          botResponse = `Here are some Ayurvedic tips for ${text}:<br/><br/>` +
            `<strong>Tips -</strong><br/>${tips.map((tip: string, i: number) => `${i + 1}. ${tip}`).join('<br/>')}<br/><br/>` +
            `<strong>Precautions:</strong><br/>${precautions.map((precaution: string, i: number) => `${i + 1}. ${precaution}`).join('<br/>')}`;
        } else {
          botResponse = response.data.message;
        }

        addMessage({
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error fetching ayurvedic tips:', error);
        addMessage({
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error fetching ayurvedic tips. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        });
      } finally {
        setIsWaitingForResponse(false);
      }
      return;
    }
if (awaitingSpecialistInput) {
  setAwaitingSpecialistInput(false);
  const userMessage: Message = {
    id: Date.now().toString(),
    text,
    sender: 'user',
    timestamp: new Date()
  };
  addMessage(userMessage);
  setIsWaitingForResponse(true);

  try {
    console.log('Sending specialistType to backend:', text);
    const response = await axios.post(`${API_BASE_URL}/specialists`, {
      specialistType: text
    });
    console.log('Received response from backend:', response);

    let botResponse = '';
if (response.data.success) {
  const specialists = response.data.data;
  if (Array.isArray(specialists) && specialists.length > 0) {
    botResponse = `<b>This is only demo data</b><br/><br/>Here are some ${text} specialists:<br/><br/>` + specialists.map((spec: any, index: number) =>
      `${index + 1}. Dr. ${spec.name}<br/>   Hospital: ${spec.hospital}<br/>   Experience: ${spec.experience}<br/>   Contact: ${spec.contact}<br/>   Availability: ${spec.availability}`
    ).join('<br/><br/>');
  } else {
    botResponse = `No specialists found for type: ${text}`;
  }
} else {
  botResponse = response.data.message || 'Sorry, I encountered an error. Please try again.';
}

    addMessage({
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching specialists:', error);
    addMessage({
      id: (Date.now() + 1).toString(),
      text: 'Sorry, I encountered an error fetching specialist information. Please try again.',
      sender: 'bot',
      timestamp: new Date()
    });
  } finally {
    setIsWaitingForResponse(false);
  }
  return;
}

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    addMessage(userMessage);
    setIsWaitingForResponse(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, { message: text });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date()
      };

      addMessage(botMessage);
    } catch (error) {
      addMessage({
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      });
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  return (
    <ChatContext.Provider value={{
      messages,
      addMessage,
      resetMessages,
      isWaitingForResponse,
      setIsWaitingForResponse,
      quickCommandsVisible,
      setQuickCommandsVisible,
      handleUserMessage,
      handleCommand,
      getAyurvedicTip: getTip,
      getDailyTip,
      lastDailyTipTime: lastTipTime,
      reminders,
      addReminder,
      showMedicineReminder,
      setShowMedicineReminder
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};