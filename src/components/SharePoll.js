import React, { Component } from 'react';

class SharePoll extends Component {
  state = {
    copied: false
  };

  generateShareableLink = () => {
    const { pollId } = this.props;
    return `${window.location.origin}?poll=${pollId}`;
  };

  copyToClipboard = () => {
    const link = this.generateShareableLink();
    navigator.clipboard.writeText(link)
      .then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 3000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  render() {
    const { copied } = this.state;
    const shareableLink = this.generateShareableLink();

    return (
      <div className="share-poll-container">
        <h3>Share this Poll</h3>
        <p>Share this link with others to let them vote on your poll:</p>
        
        <div className="share-link-group">
          <input
            type="text"
            className="share-link-input"
            value={shareableLink}
            readOnly
          />
          
          <button
            className="copy-link-button"
            onClick={this.copyToClipboard}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div className="share-code">
          <p>Or share this code: <strong>{this.props.pollId}</strong></p>
        </div>
      </div>
    );
  }
}

export default SharePoll; 