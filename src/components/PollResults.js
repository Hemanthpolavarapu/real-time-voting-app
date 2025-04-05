import React, { Component } from 'react';

class PollResults extends Component {
  calculatePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  render() {
    const { results, isLoading, error, onRefresh, showResults } = this.props;

    // If results should be hidden (before voting), don't render them
    if (!showResults) {
      return null;
    }

    // Calculate total votes
    const totalVotes = results.reduce((sum, option) => sum + option.votes, 0);

    return (
      <div className="results-container">
        <h2 className="results-title">Poll Results</h2>

        {isLoading && <div className="loading">Refreshing results...</div>}
        
        {error && <div className="error-message">{error}</div>}

        {results.map(option => {
          const percentage = this.calculatePercentage(option.votes, totalVotes);
          const voteText = `${option.votes} vote${option.votes !== 1 ? 's' : ''} (${percentage}%)`;
          
          return (
            <div key={option.id}>
              <div className="result-label">
                <span>{option.text}</span>
                <span>{voteText}</span>
              </div>
              <div className="result-bar-container">
                <div 
                  className="result-bar" 
                  style={{ width: `${percentage || 3}%` }}
                  data-text={percentage > 10 ? voteText : ''}
                ></div>
              </div>
            </div>
          );
        })}

        <div className="total-votes">
          <strong>Total votes:</strong> {totalVotes}
        </div>
        
        <button 
          className="refresh-button" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Results'}
        </button>
      </div>
    );
  }
}

export default PollResults; 