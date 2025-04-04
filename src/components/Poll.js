import React, { Component } from 'react';
import { submitVote } from '../utils/api';

class Poll extends Component {
  state = {
    selectedOption: null,
    isVoting: false,
    error: null,
    hasVoted: false
  };

  componentDidMount() {
    // Check if user has already voted on this poll
    const { pollId, username } = this.props;
    const votedPolls = JSON.parse(localStorage.getItem(`${username}_votedPolls`) || '[]');
    
    if (votedPolls.includes(pollId)) {
      this.setState({ hasVoted: true });
    }
  }

  // Handle option selection
  handleOptionSelect = (optionId) => {
    this.setState({ selectedOption: optionId });
  };

  // Handle vote submission
  handleVoteSubmit = async () => {
    const { selectedOption } = this.state;
    const { onVoteSubmit, pollId, username } = this.props;
    
    // Validate that an option is selected
    if (!selectedOption) {
      return;
    }

    this.setState({ isVoting: true, error: null });

    try {
      // Submit vote to API
      const result = await submitVote(pollId, selectedOption, username);
      
      // Record that this user has voted on this poll in localStorage
      const votedPolls = JSON.parse(localStorage.getItem(`${username}_votedPolls`) || '[]');
      votedPolls.push(pollId);
      localStorage.setItem(`${username}_votedPolls`, JSON.stringify(votedPolls));
      
      // Mark as voted in state
      this.setState({ hasVoted: true });
      
      // Invoke the callback provided by parent component with the voting result
      onVoteSubmit(result);
      
      // Reset selected option after successful vote
      this.setState({ selectedOption: null });
    } catch (error) {
      this.setState({ error: error.message || 'Failed to submit vote. Please try again.' });
    } finally {
      this.setState({ isVoting: false });
    }
  };

  render() {
    const { question, options } = this.props;
    const { selectedOption, isVoting, error, hasVoted } = this.state;

    return (
      <div className="poll-container">
        <h2 className="poll-question">{question}</h2>
        
        {!hasVoted ? (
          <>
            <div className="poll-options">
              {options.map(option => (
                <div
                  key={option.id}
                  className={`poll-option ${selectedOption === option.id ? 'selected' : ''}`}
                  onClick={() => this.handleOptionSelect(option.id)}
                >
                  {option.text}
                </div>
              ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="vote-button"
              onClick={this.handleVoteSubmit}
              disabled={!selectedOption || isVoting}
            >
              {isVoting ? 'Submitting Vote...' : 'Vote Now'}
            </button>
          </>
        ) : (
          <div className="voted-message">
            Thank you for voting! View the results below.
          </div>
        )}
      </div>
    );
  }
}

export default Poll; 