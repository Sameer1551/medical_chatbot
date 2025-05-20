import json
import os
import sys
from datetime import datetime
import hashlib

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def load_users():
    users_file = os.path.join(os.path.dirname(__file__), 'data', 'userdata.json')
    try:
        with open(users_file, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_users(users):
    users_file = os.path.join(os.path.dirname(__file__), 'data', 'userdata.json')
    os.makedirs(os.path.dirname(users_file), exist_ok=True)
    with open(users_file, 'w') as f:
        json.dump(users, f, indent=2)

def handle_signup(data):
    try:
        user_data = json.loads(data)
        users = load_users()
        
        # Check if email already exists
        if any(user['email'] == user_data['email'] for user in users):
            return json.dumps({
                'success': False,
                'message': 'Email already registered'
            })
        
        # Create new user
        new_user = {
            'id': str(datetime.now().timestamp()),
            'name': user_data['name'],
            'email': user_data['email'],
            'phone': user_data['phone'],
            'password': hash_password(user_data['password']),
            'created_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        users.append(new_user)
        save_users(users)
        
        # Return user data without password
        user_response = {k: v for k, v in new_user.items() if k != 'password'}
        return json.dumps({
            'success': True,
            'message': 'User registered successfully',
            'user': user_response
        })
        
    except Exception as e:
        return json.dumps({
            'success': False,
            'message': str(e)
        })

def handle_login(data):
    try:
        login_data = json.loads(data)
        users = load_users()
        
        # Find user by email
        user = next((user for user in users if user['email'] == login_data['email']), None)
        
        if not user:
            return json.dumps({
                'success': False,
                'message': 'User not found'
            })
        
        # Verify password
        if user['password'] != hash_password(login_data['password']):
            return json.dumps({
                'success': False,
                'message': 'Invalid password'
            })
        
        # Return user data without password
        user_response = {k: v for k, v in user.items() if k != 'password'}
        return json.dumps({
            'success': True,
            'message': 'Login successful',
            'user': user_response
        })
        
    except Exception as e:
        return json.dumps({
            'success': False,
            'message': str(e)
        })

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({
            'success': False,
            'message': 'Invalid arguments'
        }))
        sys.exit(1)
        
    action = sys.argv[1]
    data = sys.argv[2]
    
    if action == 'signup':
        print(handle_signup(data))
    elif action == 'login':
        print(handle_login(data))
    else:
        print(json.dumps({
            'success': False,
            'message': 'Invalid action'
        }))