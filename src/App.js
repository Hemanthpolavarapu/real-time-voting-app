import React, { Component } from 'react';
import Poll from './components/Poll';
import PollResults from './components/PollResults';
import UserLogin from './components/UserLogin';
import CreatePoll from './components/CreatePoll';
import JoinPoll from './components/JoinPoll';
import SharePoll from './components/SharePoll';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import socket, { joinPoll, leavePoll } from './utils/socket';
import { fetchPolls, fetchPollResults } from './utils/api';
import './App.css';

// App modes
const APP_MODES = {
  HOME: 'home',          // Landing page
  LOGIN: 'login',        // Login page
  REGISTER: 'register',  // Register page
  DASHBOARD: 'dashboard',// User dashboard
  CREATE_POLL: 'create_poll',
  JOIN_POLL: 'join_poll',
  VIEW_POLL: 'view_poll'
};

class App extends Component {
  state = {
    username: '',
    isAuthenticated: false,
    currentMode: APP_MODES.HOME,
    activePoll: null,
    results: [],
    isLoading: false,
    error: null,
    lastUpdated: new Date(),
    userPolls: [],
    showResults: false
  };

  componentDidMount() {
    // Check if user is already logged in
    const savedUsername = localStorage.getItem('votingAppUsername');
    if (savedUsername) {
      this.setState({ 
        username: savedUsername,
        isAuthenticated: true,
        currentMode: APP_MODES.DASHBOARD
      });
      
      // Load user's polls
      this.loadUserPolls(savedUsername);
    }
    
    // Check URL for poll parameter
    const urlParams = new URLSearchParams(window.location.search);
    const pollId = urlParams.get('poll');
    
    if (pollId && savedUsername) {
      // If poll ID is in URL and user is logged in, go to join poll
      this.setState({ currentMode: APP_MODES.JOIN_POLL });
    } else if (pollId) {
      // If poll ID in URL but no login, go to login first
      this.setState({ currentMode: APP_MODES.LOGIN });
    }

    // Set up socket event listeners
    socket.on('resultsUpdated', this.handleResultsUpdated);
    socket.on('pollCreated', this.handlePollCreatedNotification);
  }

  componentWillUnmount() {
    // Remove socket event listeners
    socket.off('resultsUpdated', this.handleResultsUpdated);
    socket.off('pollCreated', this.handlePollCreatedNotification);
    
    // Leave any active poll room
    if (this.state.activePoll) {
      leavePoll(this.state.activePoll.id);
    }
  }

  // Handle real-time poll results updates
  handleResultsUpdated = (data) => {
    const { activePoll } = this.state;
    
    // Only update if this is for the active poll
    if (activePoll && data.pollId === activePoll.id) {
      this.setState({
        results: data.results,
        lastUpdated: new Date()
      });
    }
  };

  // Handle new poll created notification
  handlePollCreatedNotification = (poll) => {
    const { username } = this.state;
    
    // If this user created the poll, update their polls list
    if (poll.createdBy === username) {
      this.setState(prevState => ({
        userPolls: [...prevState.userPolls, poll]
      }));
    }
  };

  // Method to handle user login
  handleLogin = (username) => {
    localStorage.setItem('votingAppUsername', username);
    
    this.setState({
      username,
      isAuthenticated: true,
      currentMode: APP_MODES.DASHBOARD
    });
    
    // Load user's polls
    this.loadUserPolls(username);
    
    // Check URL for poll parameter to join after login
    const urlParams = new URLSearchParams(window.location.search);
    const pollId = urlParams.get('poll');
    
    if (pollId) {
      this.setState({ currentMode: APP_MODES.JOIN_POLL });
    }
  };
  
  // Method to handle user registration
  handleRegister = (username) => {
    localStorage.setItem('votingAppUsername', username);
    
    this.setState({
      username,
      isAuthenticated: true,
      currentMode: APP_MODES.DASHBOARD
    });
    
    // Load user's polls (will be empty for new user)
    this.loadUserPolls(username);
  };

  // Load polls created by the user
  loadUserPolls = async (username) => {
    this.setState({ isLoading: true, error: null });
    
    try {
      const polls = await fetchPolls();
      const userPolls = polls.filter(poll => poll.createdBy === username);
      this.setState({ userPolls, isLoading: false });
      console.log('Polls loaded successfully:', polls);
      console.log('User polls:', userPolls);
    } catch (error) {
      console.error('Failed to load user polls:', error);
      // Still set userPolls to an empty array even if there's an error
      this.setState({
        error: `Note: ${error.message}. You can create a new poll.`,
        isLoading: false,
        userPolls: []
      });
    }
  };

  // Method to fetch poll results from API
  fetchPollResults = async () => {
    const { activePoll } = this.state;
    
    if (!activePoll) return;
    
    this.setState({ isLoading: true, error: null });
    
    try {
      const results = await fetchPollResults(activePoll.id);
      
      // Update state with latest results
      this.setState({
        results,
        lastUpdated: new Date(),
        isLoading: false
      });
    } catch (error) {
      this.setState({
        error: error.message || 'Error fetching poll results',
        isLoading: false
      });
    }
  };

  // Method to handle vote submission
  handleVoteSubmit = (voteResult) => {
    // Mark as voted to show results
    this.setState({ showResults: true });
    
    // Save that this user has voted on this poll
    if (this.state.activePoll) {
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
      votedPolls[this.state.activePoll.id] = true;
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
    }
    
    // Update results with the ones returned from API
    if (voteResult && voteResult.results) {
      this.setState({
        results: voteResult.results,
        lastUpdated: new Date()
      });
    }
  };

  // Handle poll creation
  handlePollCreated = (poll) => {
    // Join the poll's socket room for real-time updates
    joinPoll(poll.id);
    
    this.setState({
      currentMode: APP_MODES.VIEW_POLL,
      activePoll: poll,
      results: poll.results,
      showResults: true, // Creator can see results immediately but not as "voted"
      lastUpdated: new Date()
    });
    
    // Update URL with poll ID for sharing
    const url = new URL(window.location);
    url.searchParams.set('poll', poll.id);
    window.history.pushState({}, '', url);
  };

  // Handle joining an existing poll
  handleJoinPoll = (poll) => {
    // Leave any previous poll room
    if (this.state.activePoll) {
      leavePoll(this.state.activePoll.id);
    }
    
    // Join the new poll's socket room for real-time updates
    joinPoll(poll.id);
    
    // Check if user has already voted on this poll
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
    const hasVoted = votedPolls[poll.id] === true;
    
    this.setState({
      currentMode: APP_MODES.VIEW_POLL,
      activePoll: poll,
      results: poll.results,
      showResults: hasVoted || poll.createdBy === this.state.username, // Show results if already voted or is creator
      lastUpdated: new Date()
    });
    
    // Update URL with poll ID for sharing
    const url = new URL(window.location);
    url.searchParams.set('poll', poll.id);
    window.history.pushState({}, '', url);
  };

  // Handle user logout
  handleLogout = () => {
    console.log("Logging out user:", this.state.username);
    
    // Leave any active poll socket rooms
    if (this.state.activePoll) {
      leavePoll(this.state.activePoll.id);
    }
    
    // Remove all user data from local storage
    localStorage.removeItem('votingAppUsername');
    localStorage.removeItem('votedPolls');
    
    // Disconnect socket and reconnect later
    if (socket.connected) {
      socket.disconnect();
    }
    
    // Reset state completely
    this.setState({
      username: '',
      isAuthenticated: false,
      currentMode: APP_MODES.HOME,
      activePoll: null,
      userPolls: [],
      results: [],
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
      showResults: false
    });
    
    // Clear poll ID from URL if present
    const url = new URL(window.location);
    url.search = '';
    window.history.pushState({}, '', url);
    
    // Reconnect socket after logout is complete
    setTimeout(() => {
      if (!socket.connected) {
        socket.connect();
      }
    }, 500);
    
    console.log("Logout complete");
  };

  // Navigate to different app modes
  navigateTo = (mode) => {
    // If leaving the view poll mode, leave the socket room
    if (this.state.currentMode === APP_MODES.VIEW_POLL && mode !== APP_MODES.VIEW_POLL && this.state.activePoll) {
      leavePoll(this.state.activePoll.id);
    }
    
    this.setState({ currentMode: mode });
    
    // If going home, clear the poll from URL
    if (mode === APP_MODES.HOME) {
      const url = new URL(window.location);
      url.searchParams.delete('poll');
      window.history.pushState({}, '', url);
    }
  };

  // Format timestamp for display
  formatLastUpdated = () => {
    const { lastUpdated } = this.state;
    return lastUpdated.toLocaleTimeString();
  };

  render() {
    const { 
      username, 
      isAuthenticated,
      currentMode, 
      activePoll, 
      results, 
      isLoading, 
      error, 
      userPolls, 
      showResults 
    } = this.state;

    // Render different content based on mode
    switch (currentMode) {
      case APP_MODES.HOME:
        return <HomePage onNavigate={this.navigateTo} />;
      
      case APP_MODES.LOGIN:
        return <Login onLogin={this.handleLogin} onNavigate={this.navigateTo} />;
      
      case APP_MODES.REGISTER:
        return <Register onRegister={this.handleRegister} onNavigate={this.navigateTo} />;
      
      case APP_MODES.DASHBOARD:
        return (
          <Dashboard 
            username={username} 
            userPolls={userPolls}
            onNavigate={this.navigateTo} 
            onJoinPoll={this.handleJoinPoll}
            onLogout={this.handleLogout}
          />
        );
        
      case APP_MODES.JOIN_POLL:
        // Redirect to login if trying to join poll without being logged in
        if (!isAuthenticated) {
          return <Login onLogin={this.handleLogin} onNavigate={this.navigateTo} />;
        }
        return <JoinPoll onJoinPoll={this.handleJoinPoll} />;
      
      case APP_MODES.CREATE_POLL:
        // Redirect to login if trying to create poll without being logged in
        if (!isAuthenticated) {
          return <Login onLogin={this.handleLogin} onNavigate={this.navigateTo} />;
        }
        return (
          <div className="app-container">
            <h1 className="app-title">Real-Time Polling App</h1>
            
            <div className="app-nav">
              <button 
                className="nav-button"
                onClick={() => this.navigateTo(APP_MODES.DASHBOARD)}
              >
                Back to Dashboard
              </button>
              
              <div className="user-section">
                <span className="user-info">Logged in as: {username}</span>
                <button 
                  className="logout-button"
                  onClick={this.handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
            
            <CreatePoll 
              username={username} 
              onPollCreated={this.handlePollCreated} 
            />
          </div>
        );
      
      case APP_MODES.VIEW_POLL:
        // Redirect to login if trying to view poll without being logged in
        if (!isAuthenticated) {
          return <Login onLogin={this.handleLogin} onNavigate={this.navigateTo} />;
        }
        return (
          <div className="app-container">
            <h1 className="app-title">Real-Time Polling App</h1>
            
            <div className="app-nav">
              <button 
                className="nav-button"
                onClick={() => this.navigateTo(APP_MODES.DASHBOARD)}
              >
                Back to Dashboard
              </button>
              
              <div className="user-section">
                <span className="user-info">Logged in as: {username}</span>
                <button 
                  className="logout-button"
                  onClick={this.handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {activePoll && (
              <div className="view-poll-container">
                <Poll
                  pollId={activePoll.id}
                  question={activePoll.question}
                  options={activePoll.options}
                  onVoteSubmit={this.handleVoteSubmit}
                  username={username}
                  hasVoted={showResults}
                />
                
                <PollResults
                  results={results}
                  isLoading={isLoading}
                  error={error}
                  onRefresh={this.fetchPollResults}
                  showResults={showResults}
                />
                
                <SharePoll pollId={activePoll.id} username={username} />
                
                <div className="poll-status">
                  <span>Last updated: {this.formatLastUpdated()}</span>
                  <span>(Updates automatically in real-time)</span>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return <HomePage onNavigate={this.navigateTo} />;
    }
  }
}

export default App;
