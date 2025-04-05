import React, { Component } from 'react';
import { createPoll } from '../utils/api';

class CreatePoll extends Component {
  state = {
    question: '',
    options: ['', ''],
    isSubmitting: false,
    error: null,
    startAt: '',
    activeUntil: '',
    enableScheduling: false
  };

  handleQuestionChange = (e) => {
    this.setState({ question: e.target.value, error: null });
  };

  handleOptionChange = (index, e) => {
    const { options } = this.state;
    const newOptions = [...options];
    newOptions[index] = e.target.value;
    this.setState({ options: newOptions, error: null });
  };

  handleAddOption = () => {
    this.setState(prevState => ({
      options: [...prevState.options, '']
    }));
  };

  handleRemoveOption = (index) => {
    const { options } = this.state;
    
    if (options.length <= 2) {
      this.setState({ error: 'A poll must have at least 2 options' });
      return;
    }
    
    const newOptions = options.filter((_, i) => i !== index);
    this.setState({ options: newOptions });
  };

  handleBackToDashboard = () => {
    this.props.onNavigate('dashboard');
  };

  handleToggleScheduling = () => {
    this.setState(prevState => ({
      enableScheduling: !prevState.enableScheduling,
      startAt: '',
      activeUntil: ''
    }));
  };

  handleStartAtChange = (e) => {
    this.setState({ startAt: e.target.value });
  };

  handleActiveUntilChange = (e) => {
    this.setState({ activeUntil: e.target.value });
  };

  validateScheduling = () => {
    const { startAt, activeUntil, enableScheduling } = this.state;
    
    if (!enableScheduling) return true;
    
    const now = new Date();
    const start = startAt ? new Date(startAt) : null;
    const end = activeUntil ? new Date(activeUntil) : null;
    
    if (start && start < now) {
      this.setState({ error: 'Start time cannot be in the past' });
      return false;
    }
    
    if (start && end && start >= end) {
      this.setState({ error: 'End time must be after start time' });
      return false;
    }
    
    return true;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    
    const { question, options, startAt, activeUntil, enableScheduling } = this.state;
    const { username } = this.props;
    
    // Validate question
    if (!question.trim()) {
      this.setState({ error: 'Please enter a question for your poll' });
      return;
    }
    
    // Validate options
    const validOptions = options.filter(option => option.trim().length > 0);
    if (validOptions.length < 2) {
      this.setState({ error: 'Please enter at least 2 options for your poll' });
      return;
    }
    
    // Validate scheduling
    if (!this.validateScheduling()) {
      return;
    }
    
    this.setState({ isSubmitting: true, error: null });
    
    try {
      // Create poll object
      const pollData = {
        question,
        options: validOptions,
        createdBy: username
      };
      
      // Add scheduling if enabled
      if (enableScheduling) {
        if (startAt) {
          pollData.startAt = new Date(startAt).toISOString();
        }
        
        if (activeUntil) {
          pollData.activeUntil = new Date(activeUntil).toISOString();
        }
      }
      
      // Call API to create poll
      const newPoll = await createPoll(pollData);
      
      // Call the parent's onPollCreated method
      this.props.onPollCreated(newPoll);
      
    } catch (error) {
      console.error('Failed to create poll:', error);
      this.setState({
        error: error.message || 'Failed to create poll. Please try again.',
        isSubmitting: false
      });
    }
  };

  render() {
    const { 
      question, 
      options, 
      isSubmitting, 
      error, 
      enableScheduling, 
      startAt, 
      activeUntil 
    } = this.state;

    return (
      <div className="create-poll-container">
        <h2>Create a New Poll</h2>
        
        <form onSubmit={this.handleSubmit} className="create-poll-form">
          <div className="form-group">
            <label htmlFor="question">Poll Question</label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={this.handleQuestionChange}
              placeholder="Enter your question"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Poll Options</label>
            {options.map((option, index) => (
              <div key={index} className="option-row">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => this.handleOptionChange(index, e)}
                  placeholder={`Option ${index + 1}`}
                  className="form-input option-input"
                />
                <button
                  type="button"
                  onClick={() => this.handleRemoveOption(index)}
                  className="remove-option-btn"
                >
                  X
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={this.handleAddOption}
              className="add-option-btn"
            >
              Add Option
            </button>
          </div>
          
          <div className="form-group">
            <div className="scheduling-toggle">
              <input
                type="checkbox"
                id="enableScheduling"
                checked={enableScheduling}
                onChange={this.handleToggleScheduling}
              />
              <label htmlFor="enableScheduling">Schedule Poll Availability</label>
            </div>
            
            {enableScheduling && (
              <div className="scheduling-options">
                <div className="schedule-row">
                  <div className="schedule-field">
                    <label htmlFor="startAt">Start Time (optional)</label>
                    <input
                      type="datetime-local"
                      id="startAt"
                      value={startAt}
                      onChange={this.handleStartAtChange}
                      className="form-input"
                    />
                    <p className="field-help">If not set, poll starts immediately</p>
                  </div>
                  
                  <div className="schedule-field">
                    <label htmlFor="activeUntil">End Time (optional)</label>
                    <input
                      type="datetime-local"
                      id="activeUntil"
                      value={activeUntil}
                      onChange={this.handleActiveUntilChange}
                      className="form-input"
                    />
                    <p className="field-help">If not set, poll stays active indefinitely</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            <button
              type="button"
              onClick={this.handleBackToDashboard}
              className="back-button"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="create-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default CreatePoll; 