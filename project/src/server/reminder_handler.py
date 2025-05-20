import json
import os
import sys
from datetime import datetime

def save_reminder(data):
    # Get the directory containing reminder.json
    reminder_file = os.path.join(os.path.dirname(__file__), 'data', 'reminder.json')
    os.makedirs(os.path.dirname(reminder_file), exist_ok=True)
    
    try:
        # Parse input data
        reminder_data = json.loads(data)
        
        # Create reminder object
        reminder = {
            "id": str(datetime.now().timestamp()),
            "medicine": reminder_data['medicine'],
            "times": reminder_data['times'],
            "days": reminder_data['days'],
            "numberOfDays": reminder_data['numberOfDays'],
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Read existing reminders
        try:
            with open(reminder_file, 'r') as f:
                reminders = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            reminders = []
        
        # Add new reminder
        reminders.append(reminder)
        
        # Save updated reminders
        with open(reminder_file, 'w') as f:
            json.dump(reminders, f, indent=2)
        
        print(json.dumps({"success": True, "message": "Reminder saved successfully"}))
        return 0
        
    except Exception as e:
        print(json.dumps({"success": False, "message": str(e)}))
        return 1

if __name__ == "__main__":
    if len(sys.argv) > 1:
        sys.exit(save_reminder(sys.argv[1]))