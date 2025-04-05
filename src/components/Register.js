import React, { Component } from 'react';

class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    error: null,
    isRegistering: false
  };

  handleInputChange = (field, e) => {
    this.setState({ [field]: e.target.value, error: null });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = this.state;
    
    // Validate inputs
    if (!username.trim()) {
      this.setState({ error: 'Please enter a username' });
      return;
    }
    
    if (!email.trim()) {
      this.setState({ error: 'Please enter an email address' });
      return;
    }
    
    if (!password) {
      this.setState({ error: 'Please enter a password' });
      return;
    }
    
    if (password !== confirmPassword) {
      this.setState({ error: 'Passwords do not match' });
      return;
    }
    
    this.setState({ isRegistering: true, error: null });
    
    try {
      // For now, just simulate registration by storing in localStorage
      // In a real app, this would be a call to your backend API
      // await registerUser(username, email, password);
      
      // Check if username already exists
      if (localStorage.getItem(`user_${username}`)) {
        throw new Error('Username already exists');
      }
      
      // Store user in localStorage (this is a simplified example)
      const user = { username, email, password };
      localStorage.setItem(`user_${username}`, JSON.stringify(user));
      
      // Call the parent's onRegister method
      this.props.onRegister(username);
      
    } catch (error) {
      this.setState({
        error: error.message || 'Registration failed. Please try again.',
        isRegistering: false
      });
    }
  };
  
  navigateToLogin = () => {
    this.props.onNavigate('login');
  };

  render() {
    const { username, email, password, confirmPassword, error, isRegistering } = this.state;

    return (
      <div className="auth-container">
        <h2>Create an Account</h2>
        <p className="auth-subtitle">Join to create and vote on polls</p>
        
        <form onSubmit={this.handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => this.handleInputChange('username', e)}
              placeholder="Choose a username"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => this.handleInputChange('email', e)}
              placeholder="Enter your email"
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
              placeholder="Create a password"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => this.handleInputChange('confirmPassword', e)}
              placeholder="Confirm your password"
              className="form-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isRegistering}
          >
            {isRegistering ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-alternate">
          <p>Already have an account?</p>
          <button 
            onClick={this.navigateToLogin}
            className="auth-link-btn"
          >
            Login
          </button>
        </div>
      </div>
    );
  }
}

export default Register; 