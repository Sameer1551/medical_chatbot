import { useState, useEffect } from 'react';

export const useDailyTip = () => {
  const [tips, setTips] = useState<string[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [lastTipTime, setLastTipTime] = useState(0);

  useEffect(() => {
    // This would normally fetch from an API, but we'll use mock data for now
    const mockTips = [
      "Stay hydrated by drinking at least 8 glasses of water daily.",
      "Include a variety of colorful fruits and vegetables in your diet.",
      "Aim for 30 minutes of moderate exercise most days of the week.",
      "Practice deep breathing exercises to reduce stress.",
      "Limit screen time before bedtime for better sleep.",
      "Take regular breaks when working on a computer to reduce eye strain.",
      "Wash your hands frequently to prevent the spread of germs.",
      "Practice good posture while sitting and standing.",
      "Get at least 7-8 hours of sleep each night.",
      "Include protein-rich foods in your diet for muscle health."
    ];

    setTips(mockTips);
    
    // Load last tip time from storage
    const savedLastTipTime = localStorage.getItem('lastTipTime');
    const savedTipIndex = localStorage.getItem('currentTipIndex');
    
    if (savedLastTipTime) {
      setLastTipTime(parseInt(savedLastTipTime));
    }
    
    if (savedTipIndex) {
      setCurrentTipIndex(parseInt(savedTipIndex));
    }
  }, []);

  const getDailyTip = () => {
    const now = Date.now();
    const twelveHoursInMs = 12 * 60 * 60 * 1000;
    
    // Check if 12 hours have passed since the last tip
    if (now - lastTipTime >= twelveHoursInMs) {
      // Update the tip index
      const newIndex = (currentTipIndex + 1) % tips.length;
      setCurrentTipIndex(newIndex);
      setLastTipTime(now);
      
      // Save to storage
      localStorage.setItem('lastTipTime', now.toString());
      localStorage.setItem('currentTipIndex', newIndex.toString());
      
      return `Today's health tip: ${tips[newIndex]}`;
    } else {
      // Return the current tip
      return `Today's health tip: ${tips[currentTipIndex]}`;
    }
  };

  return { getDailyTip, lastTipTime };
};