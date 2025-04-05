import React, { Component } from 'react';

class Login extends Component {
  state = {
    username: '',
    password: '',
    error: null,
    isLoggingIn: false
  };

  handleInputChange = (field, e) => {
    this.setState({ [field]: e.target.value, error: null });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    
    // Validate inputs
    if (!username.trim()) {
      this.setState({ error: 'Please enter your username' });
      return;
    }
    
    if (!password) {
      this.setState({ error: 'Please enter your password' });
      return;
    }
    
    this.setState({ isLoggingIn: true, error: null });
    
    try {
      // For now, just simulate login with localStorage
      // In a real app, this would be a call to your backend API
      // await loginUser(username, password);
      
      // Check if user exists
      const userData = localStorage.getItem(`user_${username}`);
      
      if (!userData) {
        throw new Error('User not found');
      }
      
      const user = JSON.parse(userData);
      
      // Check password
      if (user.password !== password) {
        throw new Error('Incorrect password');
      }
      
      // Call the parent's onLogin method
      this.props.onLogin(username);
      
    } catch (error) {
      this.setState({
        error: error.message || 'Login failed. Please check your credentials.',
        isLoggingIn: false
      });
    }
  };
  
  navigateToRegister = () => {
    this.props.onNavigate('register');
  };

  render() {
    const { username, password, error, isLoggingIn } = this.state;

    return (
      <div className="auth-container">
        <h2>Login</h2>
        <p className="auth-subtitle">Welcome back to Real-Time Voting App</p>
        
        <form onSubmit={this.handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => this.handleInputChange('username', e)}
              placeholder="Enter your username"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => this.handleInputChange('password', e)}
              placeholder="Enter your password"
              className="form-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-alternate">
          <p>Don't have an account?</p>
          <button 
            onClick={this.navigateToRegister}
            className="auth-link-btn"
          >
            Register
          </button>
        </div>
      </div>
    );
  }
}

export default Login; 