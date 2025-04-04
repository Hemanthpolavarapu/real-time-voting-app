import { io } from 'socket.io-client';

// Determine the API URL based on environment
// For deployment, strip '/api' if present since Socket.IO connects to the base URL
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL.replace('/api', '') 
  : 'http://localhost:5001';

console.log('Socket connecting to:', API_BASE_URL);

// Create socket instance
const socket = io(API_BASE_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'] // Explicitly configure transports
});

// Socket event handlers
socket.on('connect', () => {
  console.log('Connected to server via Socket.IO');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  console.log('Attempting to reconnect...');
});

// Function to join a poll room for real-time updates
export const joinPoll = (pollId) => {
  socket.emit('joinPoll', pollId);
};

// Function to leave a poll room
export const leavePoll = (pollId) => {
  socket.emit('leavePoll', pollId);
};

export default socket; 