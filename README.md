# Personal AI Assist

## Overview

Personal AI Assist is a smart assistant web application that integrates various productivity tools such as Gmail, Google Calendar, a To-Do List, and a Health Bar. Built using the MERN (MongoDB, Express.js, React, Node.js) stack, it allows users to manage tasks manually or via an AI-powered chatbot, ensuring an efficient and seamless user experience.

## Features

- **AI Chat Assistant**: Users can perform all actions through natural language commands, such as managing emails, scheduling events, updating health records, and handling to-do lists.
- **Gmail Integration**: View recent emails and send quick replies.
- **Google Calendar Integration**: Create and manage meetings or scheduled events.
- **To-Do List Management**: Add, update, remove, and mark tasks as completed.
- **Health Bar**: Visualize health data with three charts for BP, sugar levels, and heart rate. Users can add records and track doctor visits with prescriptions.
- **Responsive UI**: Designed using Tailwind CSS to ensure accessibility across all devices.
- **Data Management**: Utilizes MongoDB for efficient storage and retrieval of user data.

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT), bcrypt
- **AI Integration**: OpenAI API for chatbot assistance(LLM Model-gpt-3.5-turbo-1106)

## Installation & Setup

### Clone the repository:
```sh
git clone https://github.com/your-repo/PersonalAIAssist.git
cd personal-ai-assist
```

### Install dependencies:
```sh
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Set up environment variables:
Create a `.env` file in the backend directory and add the necessary environment variables:
```sh
PORT=4001
MONGO_URI="your_mongo_connection_string"
JWT_SECRET_KEY="your_secure_jwt_key"
OPENAI_API_KEY="your_openai_api_key"
GMAIL_CLIENT_ID="your_gmail_client_id"
GMAIL_CLIENT_SECRET="your_gmail_client_secret"

```

### MongoDB URI:
- **MongoDB Atlas (Cloud)**: Sign up at MongoDB Atlas, create a new cluster, and get your connection string.

### Generate JWT Secret Key:
```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### OpenAI & Google API Keys:
Sign up for OpenAI and Google API services, retrieve the necessary credentials, and update your `.env` file accordingly.

### Run the development server:
```sh
# Start backend
cd backend
npm run dev

# Start frontend
cd ../frontend
npm start
```

### Access the platform:
Open [http://localhost:5173](http://localhost:5173) in your browser.

## Enabling Gmail & Google Calendar APIs

### 1. Enable Gmail & Google Calendar APIs
- Go to the Google Cloud Console.
- Create a new project or select an existing one.
- Navigate to API & Services > Library.
- Search for Gmail API and Google Calendar API, then click "Enable" for both.

### 2. Set Up OAuth Credentials
- Go to API & Services > Credentials.
- Click "Create Credentials" > Select OAuth 2.0 Client ID.
- Configure the consent screen (if not already done).
- Choose Web Application as the application type.
- Add your frontend URL (e.g., `http://localhost:5173`) under Authorized JavaScript origins.
- Add your backend callback URL under Authorized Redirect URIs (e.g., `http://localhost:4001/auth/callback`).
- Click "Create" and save the Client ID and Client Secret.

### 3. Generate a Refresh Token for Gmail API
- Enable "Gmail API" access for your OAuth credentials.
- Use a tool like Google OAuth Playground to authenticate and generate a refresh token.
- Store the Client ID, Client Secret, and Refresh Token in your `.env` file.

## AI Chat Assistant - Prompt Examples

### To-Do List Prompts
- **Add a Task**: "Add 'Buy groceries' to my to-do list."
- **Update a Task**: "Change 'Pay electricity bill' to 'Pay bill on 23rd Feb' and mark it as done."
- **Delete a Task**: "Remove 'Call the doctor' from my to-do list."
- **Add/remove multiple Tasks**: "Add 12 months todos for Vaccinating my Dog every month"

### Health Record Prompts
- **Add a Health Record**: "Log my health stats: BP 120/80, heart rate 75 bpm, sugar 95 mg/dL for 8th Jan 2025."
- **Delete a Health Record**: "Delete my health record from Feb 10 2025."

### Doctor Visit Prompts
- **Add a Doctor Visit**: "I had a checkup with Dr. Smith on Feb 10. Prescribed Vitamin D and Metformin."
- **Delete a Doctor Visit**: "Remove my visit to Dr. Smith on Feb 10."

### Email Handling Prompts
- **Summarize Emails**: "Summarize my recent emails."
- **Reply to an Email**: "Reply to Raj's email about the workshop meeting saying I cannot make it and brief in 2-3 sentences."
- **Reply to Multiple Emails**: "Reply to all emails from Raj with 'Thanks for the update!'."

### Calendar Prompts
- **Upcoming Events**: "What events do I have coming up?"
- **Create an Event**: "Schedule a project discussion meeting with John on March 2 from 6-7 PM."
- **Create a Recurring Event**: "Schedule a weekly meeting with John on Tuesdays until March 31."

### Casual Chat
- **General Conversation**: "Hey, how's your day?","When did we get Independance?"
- **Clarification Needed**: "Mark meeting with John as completed." (If multiple meetings exist, it asks re asks and provides a list to choose.)

## Contributing
Contributions are welcome! Feel free to submit issues or pull requests to enhance Personal AI Assist.

## License
This project is licensed under the MIT License.

## Contact
For any inquiries or suggestions, please reach out via [namanherwatta@gmail.com](mailto:namanherwatta@gmail.com).

## Note
The Gpt model does not provide real time data and only answers based on model data.
