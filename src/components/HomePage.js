import React from 'react';

const HomePage = ({ onNavigate }) => {
  return (
    <div className="home-page-container">
      <div className="hero-section">
        <h1 className="app-title">Real-Time Voting Application</h1>
        <p className="app-subtitle">Create polls, collect votes, and see results in real-time</p>
        
        <div className="hero-image">
          <img src="/voting-illustration.svg" alt="Voting Illustration" />
        </div>
        
        <div className="auth-buttons">
          <button 
            className="auth-button login-button"
            onClick={() => onNavigate('login')}
          >
            Login
          </button>
          <button 
            className="auth-button register-button"
            onClick={() => onNavigate('register')}
          >
            Register
          </button>
        </div>
      </div>
      
      <div className="features-section">
        <h2>Features</h2>
        
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Results</h3>
            <p>See voting results update instantly as votes come in</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Easy Sharing</h3>
            <p>Share polls with a simple link or code</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>Works great on all devices</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Quick Setup</h3>
            <p>Create a poll in seconds with multiple options</p>
          </div>
        </div>
      </div>
      
      <footer className="home-footer">
        <p>© 2025 Real-Time Voting App</p>
      </footer>
    </div>
  );
};

export default HomePage; 