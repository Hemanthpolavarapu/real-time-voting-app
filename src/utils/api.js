// API Base URL - can be overridden with environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// For deployment, you can set REACT_APP_API_URL in your environment to point to your deployed API
// e.g., https://your-api-domain.com/api

/**
 * Fetch all polls from the server
 */
export const fetchPolls = async () => {
  try {
    console.log('Fetching polls from:', `${API_URL}/polls`);
    console.log('Current API_URL:', API_URL);
    
    const response = await fetch(`${API_URL}/polls`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch polls: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetched polls data:', data);
    return data;
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
  let retries = 2; // Number of retries
  
  while (retries >= 0) {
    try {
      console.log(`Attempting to create poll. Retries left: ${retries}`);
      console.log('Poll data:', pollData);
      console.log('API URL:', `${API_URL}/polls`);
      
      const response = await fetch(`${API_URL}/polls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(pollData),
      });
      
      // Log response information for debugging
      console.log('Response status:', response.status);
      console.log('Response OK:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        
        if (response.status === 500) {
          throw new Error('Server error. This may be temporary, please try again.');
        } else {
          throw new Error(`Failed to create poll: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }
      }
      
      const data = await response.json();
      console.log('Poll created successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Error creating poll:', error);
      
      // If network error and we have retries left, try again
      if ((error.name === 'TypeError' || error.message.includes('fetch')) && retries > 0) {
        retries--;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        continue;
      }
      
      // No more retries or not a network error, throw the error
      throw error;
    }
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