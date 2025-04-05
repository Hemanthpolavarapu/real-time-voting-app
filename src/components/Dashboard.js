import React, { Component } from 'react';
import { fetchPolls } from '../utils/api';

class Dashboard extends Component {
  state = {
    userPolls: [],
    isLoading: true,
    error: null,
    stats: {
      totalPolls: 0,
      totalVotes: 0,
      activePolls: 0
    }
  };

  componentDidMount() {
    this.loadUserData();
  }

  loadUserData = async () => {
    const { username } = this.props;
    
    this.setState({ isLoading: true, error: null });
    
    try {
      // Fetch polls from API
      const polls = await fetchPolls();
      const userPolls = polls.filter(poll => poll.createdBy === username);
      
      // Calculate stats
      const totalPolls = userPolls.length;
      const totalVotes = userPolls.reduce((total, poll) => {
        return total + poll.results.reduce((pollTotal, option) => pollTotal + option.votes, 0);
      }, 0);
      const activePolls = userPolls.length; // In a real app, you might have a concept of active vs. expired polls
      
      this.setState({
        userPolls,
        isLoading: false,
        stats: {
          totalPolls,
          totalVotes,
          activePolls
        }
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      this.setState({
        error: `Error: ${error.message}. Please try again.`,
        isLoading: false,
        userPolls: []
      });
    }
  };

  handleCreatePoll = () => {
    this.props.onNavigate('create_poll');
  };

  handleViewPoll = (poll) => {
    this.props.onJoinPoll(poll);
  };

  handleLogout = () => {
    this.props.onLogout();
  };

  handleJoinPoll = () => {
    this.props.onNavigate('join_poll');
  };

  render() {
    const { username } = this.props;
    const { userPolls, isLoading, error, stats } = this.state;

    return (
      <div className="dashboard-container">
        <h1 className="app-title">Real-Time Polling App</h1>
        
        <div className="app-nav">
          <div className="nav-buttons">
            <button 
              className="nav-button"
              onClick={this.handleCreatePoll}
            >
              Create Poll
            </button>
            <button 
              className="nav-button"
              onClick={this.handleJoinPoll}
            >
              Join Poll
            </button>
          </div>
          
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
        
        <div className="dashboard-header">
          <h2>Welcome, {username}!</h2>
          <button 
            className="create-poll-button"
            onClick={this.handleCreatePoll}
          >
            Create New Poll
          </button>
        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <h3>{stats.totalPolls}</h3>
            <p>Total Polls</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalVotes}</h3>
            <p>Total Votes</p>
          </div>
          <div className="stat-card">
            <h3>{stats.activePolls}</h3>
            <p>Active Polls</p>
          </div>
        </div>
        
        <div className="user-polls-section">
          <h3>Your Polls</h3>
          
          {isLoading ? (
            <div className="loading">Loading your polls...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : userPolls.length === 0 ? (
            <div className="no-polls">
              <p>You haven't created any polls yet.</p>
              <button 
                className="create-first-poll-button"
                onClick={this.handleCreatePoll}
              >
                Create your first poll
              </button>
            </div>
          ) : (
            <div className="user-polls-list">
              {userPolls.map(poll => (
                <div 
                  key={poll.id} 
                  className="poll-card"
                  onClick={() => this.handleViewPoll(poll)}
                >
                  <h4>{poll.question}</h4>
                  <p className="poll-meta">Created: {new Date(poll.createdAt).toLocaleDateString()}</p>
                  <p className="poll-meta">Options: {poll.options.length}</p>
                  <p className="poll-meta">
                    Votes: {poll.results.reduce((total, option) => total + option.votes, 0)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Dashboard; 