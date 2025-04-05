import React, { Component } from 'react';

class SharePoll extends Component {
  state = {
    copied: false,
    shareMethod: 'link' // 'link' or 'code'
  };

  generateShareableLink = () => {
    const { pollId, username } = this.props;
    const baseUrl = window.location.origin;
    
    // Create a unique link that includes poll ID and optionally the username of who shared it
    const url = new URL(baseUrl);
    url.searchParams.set('poll', pollId);
    
    // Add username as referrer if available
    if (username) {
      url.searchParams.set('ref', encodeURIComponent(username));
    }
    
    return url.toString();
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

  changeShareMethod = (method) => {
    this.setState({ shareMethod: method });
  };

  render() {
    const { copied, shareMethod } = this.state;
    const { pollId } = this.props;
    const shareableLink = this.generateShareableLink();

    return (
      <div className="share-poll-container">
        <h3>Share this Poll</h3>
        <p>Invite others to vote on your poll:</p>
        
        <div className="share-method-tabs">
          <button 
            className={`share-tab ${shareMethod === 'link' ? 'active' : ''}`}
            onClick={() => this.changeShareMethod('link')}
          >
            Share Link
          </button>
          <button 
            className={`share-tab ${shareMethod === 'code' ? 'active' : ''}`}
            onClick={() => this.changeShareMethod('code')}
          >
            Share Code
          </button>
        </div>
        
        {shareMethod === 'link' ? (
          <div className="share-link-section">
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
            
            <div className="social-share-buttons">
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(`Vote on my poll: ${shareableLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-button whatsapp"
              >
                Share on WhatsApp
              </a>
              
              <a 
                href={`mailto:?subject=${encodeURIComponent('Vote on my poll')}&body=${encodeURIComponent(`I've created a poll and would like your opinion. Vote here: ${shareableLink}`)}`}
                className="share-button email"
              >
                Share via Email
              </a>
            </div>
          </div>
        ) : (
          <div className="share-code-section">
            <p className="share-code-instruction">
              Share this code with others. They can enter it in the "Join Poll" section:
            </p>
            <div className="poll-code-display">
              <span className="poll-code">{pollId}</span>
              <button
                className="copy-code-button"
                onClick={() => {
                  navigator.clipboard.writeText(pollId);
                  this.setState({ copied: true });
                  setTimeout(() => this.setState({ copied: false }), 3000);
                }}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default SharePoll; 