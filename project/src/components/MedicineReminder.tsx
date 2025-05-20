import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface MedicineReminderProps {
  onClose: () => void;
  onSubmit: (data: {
    medicine: string;
    times: Date[];
    days: string[];
    numberOfDays: number | null;
  }) => void;
}

const MedicineReminder: React.FC<MedicineReminderProps> = ({ onClose, onSubmit }) => {
  const [medicine, setMedicine] = useState('');
  const [times, setTimes] = useState<Date[]>([new Date()]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [numberOfDays, setNumberOfDays] = useState<number | null>(null);
  const [reminderType, setReminderType] = useState<'days' | 'weekly'>('days');

  const weekDays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      medicine,
      times,
      days: selectedDays,
      numberOfDays: reminderType === 'days' ? numberOfDays : null
    });
    onClose();
  };

  const addTime = () => {
    setTimes([...times, new Date()]);
  };

  const removeTime = (index: number) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  const updateTime = (index: number, newTime: Date | null) => {
    if (newTime) {
      const newTimes = [...times];
      newTimes[index] = newTime;
      setTimes(newTimes);
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Set Medicine Reminder</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine Name
            </label>
            <input
              type="text"
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Times
            </label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {times.map((time, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <DateTimePicker
                    value={dayjs(time)}
                    onChange={(newValue) => updateTime(index, newValue?.toDate() || null)}
                    className="flex-1"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </LocalizationProvider>
            <button
              type="button"
              onClick={addTime}
              className="text-blue-500 text-sm hover:text-blue-700"
            >
              + Add another time
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Reminder Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={reminderType === 'days'}
                  onChange={() => setReminderType('days')}
                  className="mr-2"
                />
                Number of Days
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={reminderType === 'weekly'}
                  onChange={() => setReminderType('weekly')}
                  className="mr-2"
                />
                Weekly Schedule
              </label>
            </div>
          </div>

          {reminderType === 'days' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Days
              </label>
              <input
                type="number"
                min="1"
                value={numberOfDays || ''}
                onChange={(e) => setNumberOfDays(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
                required={reminderType === 'days'}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Days
              </label>
              <div className="grid grid-cols-2 gap-2">
                {weekDays.map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      onChange={() => toggleDay(day)}
                      className="rounded text-blue-500"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Set Reminder
          </button>
        </form>
      </div>
    </div>
  );
};

export default MedicineReminder;