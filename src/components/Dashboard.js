import React, { Component } from 'react';
import { fetchPolls, deletePoll, togglePollActive } from '../utils/api';

class Dashboard extends Component {
  state = {
    userPolls: [],
    isLoading: true,
    error: null,
    stats: {
      totalPolls: 0,
      totalVotes: 0,
      activePolls: 0
    },
    actionInProgress: null // To track which poll is currently being acted upon
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
      const activePolls = userPolls.filter(poll => poll.isActive).length;
      
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

  // Handle poll deletion
  handleDeletePoll = async (event, pollId) => {
    // Prevent the click from bubbling up to the parent elements
    event.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }
    
    this.setState({ actionInProgress: pollId, error: null });
    
    try {
      await deletePoll(pollId);
      
      // Update the local state to remove the deleted poll
      this.setState(prevState => ({
        userPolls: prevState.userPolls.filter(poll => poll.id !== pollId),
        actionInProgress: null
      }), () => {
        // Recalculate stats after state update
        const { userPolls } = this.state;
        const totalPolls = userPolls.length;
        const totalVotes = userPolls.reduce((total, poll) => {
          return total + poll.results.reduce((pollTotal, option) => pollTotal + option.votes, 0);
        }, 0);
        const activePolls = userPolls.filter(poll => poll.isActive).length;
        
        this.setState({
          stats: {
            totalPolls,
            totalVotes,
            activePolls
          }
        });
      });
    } catch (error) {
      console.error('Failed to delete poll:', error);
      this.setState({
        error: `Failed to delete poll: ${error.message}`,
        actionInProgress: null
      });
    }
  };

  // Handle toggling poll active status
  handleToggleActive = async (event, pollId, currentStatus) => {
    // Prevent the click from bubbling up to the parent elements
    event.stopPropagation();
    
    const action = currentStatus ? 'pause' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this poll?`)) {
      return;
    }
    
    this.setState({ actionInProgress: pollId, error: null });
    
    try {
      const result = await togglePollActive(pollId);
      
      // Update the poll in the local state
      this.setState(prevState => ({
        userPolls: prevState.userPolls.map(poll => 
          poll.id === pollId ? { ...poll, isActive: result.isActive } : poll
        ),
        actionInProgress: null
      }), () => {
        // Recalculate stats after state update
        const { userPolls } = this.state;
        const activePolls = userPolls.filter(poll => poll.isActive).length;
        
        this.setState(prevState => ({
          stats: {
            ...prevState.stats,
            activePolls
          }
        }));
      });
    } catch (error) {
      console.error(`Failed to ${action} poll:`, error);
      this.setState({
        error: `Failed to ${action} poll: ${error.message}`,
        actionInProgress: null
      });
    }
  };

  render() {
    const { username } = this.props;
    const { userPolls, isLoading, error, stats, actionInProgress } = this.state;

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
                  className={`poll-card ${!poll.isActive ? 'poll-inactive' : ''}`}
                >
                  <div className="poll-card-content" onClick={() => this.handleViewPoll(poll)}>
                    <h4>{poll.question}</h4>
                    <p className="poll-meta">Created: {new Date(poll.createdAt).toLocaleDateString()}</p>
                    <p className="poll-meta">Options: {poll.options.length}</p>
                    <p className="poll-meta">
                      Votes: {poll.results.reduce((total, option) => total + option.votes, 0)}
                    </p>
                    <p className="poll-meta">
                      Status: {poll.isActive ? 'Active' : 'Paused'}
                    </p>
                  </div>
                  
                  <div className="poll-actions">
                    <button 
                      className={`toggle-button ${poll.isActive ? 'pause-button' : 'activate-button'}`}
                      onClick={(e) => this.handleToggleActive(e, poll.id, poll.isActive)}
                      disabled={actionInProgress === poll.id}
                    >
                      {actionInProgress === poll.id ? 'Processing...' : poll.isActive ? 'Pause' : 'Activate'}
                    </button>
                    <button 
                      className="delete-button"
                      onClick={(e) => this.handleDeletePoll(e, poll.id)}
                      disabled={actionInProgress === poll.id}
                    >
                      {actionInProgress === poll.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
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