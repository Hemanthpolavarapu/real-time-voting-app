import React, { Component } from 'react';
import Poll from './components/Poll';
import PollResults from './components/PollResults';
import UserLogin from './components/UserLogin';
import CreatePoll from './components/CreatePoll';
import JoinPoll from './components/JoinPoll';
import SharePoll from './components/SharePoll';
import socket, { joinPoll, leavePoll } from './utils/socket';
import { fetchPolls, fetchPollResults } from './utils/api';
import './App.css';

// App modes
const APP_MODES = {
  LOGIN: 'login',
  HOME: 'home',
  CREATE_POLL: 'create_poll',
  JOIN_POLL: 'join_poll',
  VIEW_POLL: 'view_poll'
};

class App extends Component {
  state = {
    username: '',
    currentMode: APP_MODES.LOGIN,
    activePoll: null,
    results: [],
    isLoading: false,
    error: null,
    lastUpdated: new Date(),
    userPolls: [],
    showResults: false
  };

  componentDidMount() {
    // Check URL for poll parameter
    const urlParams = new URLSearchParams(window.location.search);
    const pollId = urlParams.get('poll');
    
    if (pollId) {
      // If poll ID is in URL, set mode to join poll
      this.setState({ currentMode: APP_MODES.JOIN_POLL });
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
    this.setState({
      username,
      currentMode: APP_MODES.HOME
    });
    
    // Load user's polls
    this.loadUserPolls(username);
  };

  // Load polls created by the user
  loadUserPolls = async (username) => {
    this.setState({ isLoading: true, error: null });
    
    try {
      const polls = await fetchPolls();
      const userPolls = polls.filter(poll => poll.createdBy === username);
      this.setState({ userPolls, isLoading: false });
    } catch (error) {
      this.setState({
        error: `Failed to load polls: ${error.message}`,
        isLoading: false
      });
      console.error('Failed to load user polls:', error);
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
      showResults: true, // Creator can see results immediately
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
    
    this.setState({
      currentMode: APP_MODES.VIEW_POLL,
      activePoll: poll,
      results: poll.results,
      showResults: false, // Don't show results until voted
      lastUpdated: new Date()
    });
    
    // Update URL with poll ID for sharing
    const url = new URL(window.location);
    url.searchParams.set('poll', poll.id);
    window.history.pushState({}, '', url);
  };

  // Navigate to different app modes
  navigateTo = (mode) => {
    // If leaving the view poll mode, leave the socket room
    if (this.state.currentMode === APP_MODES.VIEW_POLL && mode !== APP_MODES.VIEW_POLL && this.state.activePoll) {
      leavePoll(this.state.activePoll.id);
    }
    
    this.setState({ currentMode: mode });
    
    // If going home, clear the URL parameters
    if (mode === APP_MODES.HOME) {
      const url = new URL(window.location);
      url.search = '';
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
      currentMode, 
      activePoll, 
      results, 
      isLoading, 
      error, 
      userPolls, 
      showResults 
    } = this.state;

    // If not logged in, show login screen
    if (currentMode === APP_MODES.LOGIN) {
      return <UserLogin onLogin={this.handleLogin} />;
    }

    return (
      <div className="app-container">
        <h1 className="app-title">Real-Time Polling App</h1>
        
        {/* Navigation */}
        <div className="app-nav">
          <button 
            className={`nav-button ${currentMode === APP_MODES.HOME ? 'active' : ''}`}
            onClick={() => this.navigateTo(APP_MODES.HOME)}
          >
            Home
          </button>
          <button 
            className={`nav-button ${currentMode === APP_MODES.CREATE_POLL ? 'active' : ''}`}
            onClick={() => this.navigateTo(APP_MODES.CREATE_POLL)}
          >
            Create Poll
          </button>
          <button 
            className={`nav-button ${currentMode === APP_MODES.JOIN_POLL ? 'active' : ''}`}
            onClick={() => this.navigateTo(APP_MODES.JOIN_POLL)}
          >
            Join Poll
          </button>
          <span className="user-info">Logged in as: {username}</span>
        </div>
        
        {/* Error display for main app errors */}
        {error && <div className="error-message">{error}</div>}
        
        {/* Home screen */}
        {currentMode === APP_MODES.HOME && (
          <div className="home-container">
            <h2>Your Polls</h2>
            {isLoading ? (
              <div className="loading">Loading your polls...</div>
            ) : (
              <>
                {userPolls.length === 0 ? (
                  <p>You haven't created any polls yet. Create your first poll!</p>
                ) : (
                  <div className="user-polls-list">
                    {userPolls.map(poll => (
                      <div 
                        key={poll.id} 
                        className="poll-item"
                        onClick={() => this.handleJoinPoll(poll)}
                      >
                        <h3>{poll.question}</h3>
                        <p>Created: {new Date(poll.createdAt).toLocaleDateString()}</p>
                        <p>Options: {poll.options.length}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Create Poll screen */}
        {currentMode === APP_MODES.CREATE_POLL && (
          <CreatePoll 
            username={username} 
            onPollCreated={this.handlePollCreated} 
          />
        )}
        
        {/* Join Poll screen */}
        {currentMode === APP_MODES.JOIN_POLL && (
          <JoinPoll onJoinPoll={this.handleJoinPoll} />
        )}
        
        {/* View Poll screen */}
        {currentMode === APP_MODES.VIEW_POLL && activePoll && (
          <div className="view-poll-container">
            <Poll
              pollId={activePoll.id}
              question={activePoll.question}
              options={activePoll.options}
              onVoteSubmit={this.handleVoteSubmit}
              username={username}
            />
            
            <PollResults
              results={results}
              isLoading={isLoading}
              error={error}
              onRefresh={this.fetchPollResults}
              showResults={showResults}
            />
            
            <SharePoll pollId={activePoll.id} />
            
            <div className="poll-status">
              <span>Last updated: {this.formatLastUpdated()}</span>
              <span>(Updates automatically in real-time)</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;
