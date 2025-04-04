import React, { Component } from 'react';
import { fetchPoll } from '../utils/api';

class JoinPoll extends Component {
  state = {
    pollCode: '',
    error: null,
    isLoading: false
  };

  componentDidMount() {
    // Check URL for poll parameter
    const urlParams = new URLSearchParams(window.location.search);
    const pollId = urlParams.get('poll');
    
    if (pollId) {
      this.setState({ pollCode: pollId });
      this.findPoll(pollId);
    }
  }

  handleInputChange = (e) => {
    this.setState({ pollCode: e.target.value, error: null });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { pollCode } = this.state;
    
    if (!pollCode.trim()) {
      this.setState({ error: 'Please enter a poll code' });
      return;
    }
    
    this.findPoll(pollCode);
  };

  findPoll = async (pollCode) => {
    this.setState({ isLoading: true, error: null });
    
    try {
      // Fetch the poll from the API
      const poll = await fetchPoll(pollCode);
      
      // Call the parent component's handler
      this.props.onJoinPoll(poll);
      
    } catch (error) {
      this.setState({ 
        error: error.message || 'Poll not found. Please check the code and try again.',
        isLoading: false
      });
    }
  };

  render() {
    const { pollCode, error, isLoading } = this.state;

    return (
      <div className="join-poll-container">
        <h2>Join a Poll</h2>
        <p>Enter a poll code to join an existing poll:</p>
        
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            value={pollCode}
            onChange={this.handleInputChange}
            placeholder="Enter poll code"
            className="poll-code-input"
            disabled={isLoading}
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button
            type="submit"
            className="join-poll-button"
            disabled={!pollCode.trim() || isLoading}
          >
            {isLoading ? 'Searching...' : 'Join Poll'}
          </button>
        </form>
      </div>
    );
  }
}

export default JoinPoll; 