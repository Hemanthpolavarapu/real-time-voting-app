import React, { Component } from 'react';
import { createPoll } from '../utils/api';

class CreatePoll extends Component {
  state = {
    question: '',
    options: ['', '', ''],
    error: null,
    isCreating: false
  };

  handleQuestionChange = (e) => {
    this.setState({ question: e.target.value });
  };

  handleOptionChange = (index, e) => {
    const newOptions = [...this.state.options];
    newOptions[index] = e.target.value;
    this.setState({ options: newOptions });
  };

  addOption = () => {
    this.setState(prevState => ({
      options: [...prevState.options, '']
    }));
  };

  removeOption = (index) => {
    // Prevent removing if only 2 options remain
    if (this.state.options.length <= 2) {
      this.setState({ error: 'A poll must have at least 2 options' });
      return;
    }

    const newOptions = [...this.state.options];
    newOptions.splice(index, 1);
    this.setState({
      options: newOptions,
      error: null
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { question, options } = this.state;
    const { username } = this.props;
    
    // Validate inputs
    if (!question.trim()) {
      this.setState({ error: 'Please enter a question' });
      return;
    }
    
    // Filter out empty options
    const validOptions = options.filter(option => option.trim());
    
    if (validOptions.length < 2) {
      this.setState({ error: 'Please provide at least 2 options' });
      return;
    }
    
    this.setState({ isCreating: true, error: null });
    
    try {
      // Create poll using API
      const poll = await createPoll({
        question,
        options: validOptions,
        createdBy: username
      });
      
      // Clear form
      this.setState({
        question: '',
        options: ['', '', ''],
        isCreating: false
      });
      
      // Notify parent component
      this.props.onPollCreated(poll);
      
    } catch (error) {
      this.setState({
        error: error.message || 'Failed to create poll. Please try again.',
        isCreating: false
      });
    }
  };

  render() {
    const { question, options, error, isCreating } = this.state;

    return (
      <div className="create-poll-container">
        <h2>Create a New Poll</h2>
        
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="question">Question:</label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={this.handleQuestionChange}
              placeholder="Enter your poll question"
              className="question-input"
            />
          </div>
          
          <div className="form-group">
            <label>Options:</label>
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => this.handleOptionChange(index, e)}
                  placeholder={`Option ${index + 1}`}
                  className="option-input"
                />
                <button
                  type="button"
                  onClick={() => this.removeOption(index)}
                  className="remove-option-btn"
                >
                  &times;
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={this.addOption}
              className="add-option-btn"
            >
              + Add Option
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button
            type="submit"
            className="create-poll-btn"
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Poll'}
          </button>
        </form>
      </div>
    );
  }
}

export default CreatePoll; 