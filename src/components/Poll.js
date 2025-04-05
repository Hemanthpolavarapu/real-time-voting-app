import React, { Component } from 'react';
import { submitVote } from '../utils/api';

class Poll extends Component {
  state = {
    selectedOption: null,
    isVoting: false,
    error: null,
    localHasVoted: false,
    userHasActuallyVoted: false
  };

  componentDidMount() {
    // Set local voting state based on props
    this.setState({ localHasVoted: this.props.hasVoted });
    
    // Check if user has actually voted on this poll
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
    const userHasActuallyVoted = votedPolls[this.props.pollId] === true;
    this.setState({ userHasActuallyVoted });
  }

  componentDidUpdate(prevProps) {
    // Update local state if the hasVoted prop changes
    if (prevProps.hasVoted !== this.props.hasVoted) {
      this.setState({ localHasVoted: this.props.hasVoted });
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
      this.setState({ error: 'Please select an option to vote' });
      return;
    }

    this.setState({ isVoting: true, error: null });

    try {
      // Submit vote to API
      const result = await submitVote(pollId, selectedOption, username);
      
      // Mark as voted in state
      this.setState({ 
        localHasVoted: true,
        userHasActuallyVoted: true
      });
      
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
    const { selectedOption, isVoting, error, localHasVoted, userHasActuallyVoted } = this.state;
    
    // Use either local state or props to determine if user has voted
    const hasVoted = localHasVoted || this.props.hasVoted;

    return (
      <div className="poll-container">
        <h2 className="poll-question">{question}</h2>
        
        {/* Only show voting form if NOT already voted */}
        {!userHasActuallyVoted ? (
          <>
            <div className="poll-options">
              {options.map(option => (
                <div
                  key={option.id}
                  className={`poll-option ${selectedOption === option.id ? 'selected' : ''}`}
                  onClick={() => this.handleOptionSelect(option.id)}
                >
                  <div className="option-selector">
                    <span className="option-checkbox"></span>
                    <span className="option-text">{option.text}</span>
                  </div>
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
            <div className="voted-check">✓</div>
            <p>Thank you for voting! View the results below.</p>
          </div>
        )}
      </div>
    );
  }
}

export default Poll; 