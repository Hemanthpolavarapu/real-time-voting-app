import React, { Component } from 'react';

class UserLogin extends Component {
  state = {
    username: process.env.REACT_APP_USERNAME || '',
    error: null
  };

  componentDidMount() {
    // Check if username is already stored in localStorage or provided in environment
    const savedUsername = localStorage.getItem('username') || process.env.REACT_APP_USERNAME;
    if (savedUsername) {
      this.setState({ username: savedUsername });
      this.props.onLogin(savedUsername);
    }
  }

  handleInputChange = (e) => {
    this.setState({ username: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { username } = this.state;
    
    if (!username || username.trim().length < 3) {
      this.setState({ error: 'Username must be at least 3 characters long' });
      return;
    }
    
    // Save username to localStorage
    localStorage.setItem('username', username);
    
    // Call the parent component's login handler
    this.props.onLogin(username);
    
    // Clear any errors
    this.setState({ error: null });
  };

  render() {
    const { username, error } = this.state;

    return (
      <div className="login-container">
        <h2>Welcome to the Polling App</h2>
        <p>Please enter your name to continue:</p>
        
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            className="username-input"
            placeholder="Your name"
            value={username}
            onChange={this.handleInputChange}
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={!username.trim()}
          >
            Continue
          </button>
        </form>
      </div>
    );
  }
}

export default UserLogin; 