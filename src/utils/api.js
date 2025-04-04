// API Base URL - can be overridden with environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// For deployment, you can set REACT_APP_API_URL in your environment to point to your deployed API
// e.g., https://your-api-domain.com/api

/**
 * Fetch all polls from the server
 */
export const fetchPolls = async () => {
  try {
    const response = await fetch(`${API_URL}/polls`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch polls: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching polls:', error);
    throw error;
  }
};

/**
 * Fetch a specific poll by ID
 * @param {string} pollId - The ID of the poll to fetch
 */
export const fetchPoll = async (pollId) => {
  try {
    const response = await fetch(`${API_URL}/polls/${pollId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch poll: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching poll ${pollId}:`, error);
    throw error;
  }
};

/**
 * Create a new poll
 * @param {Object} pollData - Data for the new poll
 * @param {string} pollData.question - The poll question
 * @param {Array<string>} pollData.options - Array of poll options
 * @param {string} pollData.createdBy - Username of poll creator
 */
export const createPoll = async (pollData) => {
  try {
    const response = await fetch(`${API_URL}/polls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pollData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create poll: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating poll:', error);
    throw error;
  }
};

/**
 * Submit a vote for a poll option
 * @param {string} pollId - The ID of the poll
 * @param {string} optionId - The ID of the selected option
 * @param {string} username - The username of the voter
 */
export const submitVote = async (pollId, optionId, username) => {
  try {
    const response = await fetch(`${API_URL}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        optionId,
        username,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit vote: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
};

/**
 * Fetch poll results
 * @param {string} pollId - The ID of the poll 
 */
export const fetchPollResults = async (pollId) => {
  try {
    const response = await fetch(`${API_URL}/polls/${pollId}/results`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch results: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching poll results for ${pollId}:`, error);
    throw error;
  }
}; 