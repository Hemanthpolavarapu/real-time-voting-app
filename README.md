# Real-Time Voting App Frontend

A real-time voting application frontend built with React and Socket.IO. This application allows users to create polls, share them with others, and see real-time voting results.

## Features

- Create polls with multiple options
- Join existing polls using a unique poll ID
- Vote on poll options
- View real-time results with automatic updates
- Share polls with others
- User authentication with username

## Installation

1. Clone the repository
```bash
git clone https://github.com/Hemanthpolavarapu/real-time-voting-app.git
cd real-time-voting-app
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=https://voting-api-backend.onrender.com/api
PORT=3000
REACT_APP_USERNAME="your_default_username"
```

4. Start the development server
```bash
npm start
```

The application will be available at http://localhost:3000

## Usage

1. **Login**: Enter your username to access the application
2. **Create a Poll**: Click "Create Poll" in the navigation bar, fill out the form with your question and options
3. **Join a Poll**: Click "Join Poll" in the navigation bar, enter the poll ID
4. **Vote**: Select an option in a poll and click "Submit Vote"
5. **View Results**: Results are displayed after voting and update in real-time
6. **Share Poll**: Copy the share link to allow others to join your poll

## Technologies Used

- React.js
- Socket.IO Client
- CSS for styling
- Environment variables for configuration

## Backend API

This frontend connects to a backend API. The backend repository is available at:
[https://github.com/Hemanthpolavarapu/voting-api-backend](https://github.com/Hemanthpolavarapu/voting-api-backend)

## Live Demo

- Frontend: [Coming Soon]
- Backend API: [https://voting-api-backend.onrender.com/api](https://voting-api-backend.onrender.com/api)

## License

MIT
