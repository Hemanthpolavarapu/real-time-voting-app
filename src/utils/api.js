// API Base URL - can be overridden with environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// For deployment, you can set REACT_APP_API_URL in your environment to point to your deployed API
// e.g., https://your-api-domain.com/api

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function to create headers with authentication
const createAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Login a user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    const data = await response.json();
    
    // Store auth token in localStorage for future API calls
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('username', data.username);
    }
    
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Logout a user (clear localStorage)
 */
export const logoutUser = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('username');
};

/**
 * Get user profile
 */
export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: createAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Get user polls
 */
export const getUserPolls = async () => {
  try {
    const response = await fetch(`${API_URL}/users/polls`, {
      method: 'GET',
      headers: createAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user polls: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user polls:', error);
    throw error;
  }
};

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
 */
export const createPoll = async (pollData) => {
  let retries = 3;
  let delay = 1000;
  
  while (retries >= 0) {
    try {
      console.log(`Attempting to create poll. Retries left: ${retries}`);
      console.log('Poll data:', pollData);
      
      const response = await fetch(`${API_URL}/polls`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(pollData),
        signal: AbortSignal.timeout(10000)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Failed to create poll: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          console.error('Could not parse error JSON', jsonError);
        }
        
        if (response.status === 500) {
          throw new Error('Server is experiencing issues. Please try again in a moment.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status === 401) {
          throw new Error('Authentication required. Please log in to create a poll.');
        } else {
          throw new Error(errorMessage);
        }
      }
      
      const data = await response.json();
      console.log('Poll created successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Error creating poll:', error);
      
      if (error.name === 'AbortError') {
        console.log('Request timed out');
        if (retries > 0) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5;
          continue;
        } else {
          throw new Error('Request timed out. Please check your internet connection.');
        }
      }
      
      if ((error.name === 'TypeError' || error.message.includes('fetch') || 
           error.message.includes('network') || error.message.includes('connection')) && retries > 0) {
        retries--;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5;
        continue;
      }
      
      if (retries === 0) {
        throw new Error('Could not connect to the server after multiple attempts. Please try again later.');
      } else {
        throw error;
      }
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
      headers: createAuthHeaders(),
      body: JSON.stringify({
        optionId,
        username, // For backward compatibility
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to submit vote: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
};

/**
 * Delete a poll (creator only)
 * @param {string} pollId - The ID of the poll to delete
 */
export const deletePoll = async (pollId) => {
  try {
    const response = await fetch(`${API_URL}/polls/${pollId}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete poll: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting poll:', error);
    throw error;
  }
};

/**
 * Toggle a poll's active status (creator only)
 * @param {string} pollId - The ID of the poll to toggle
 */
export const togglePollActive = async (pollId) => {
  try {
    const response = await fetch(`${API_URL}/polls/${pollId}/toggle-active`, {
      method: 'PUT',
      headers: createAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to toggle poll status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error toggling poll status:', error);
    throw error;
  }
};

/**
 * Update a poll's timing (creator only)
 * @param {string} pollId - The ID of the poll to update
 * @param {Object} timing - Timing data
 * @param {string} [timing.startAt] - ISO date string when poll should start
 * @param {string} [timing.activeUntil] - ISO date string when poll should end
 */
export const updatePollTiming = async (pollId, { startAt, activeUntil }) => {
  try {
    const response = await fetch(`${API_URL}/polls/${pollId}/timing`, {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify({
        startAt,
        activeUntil
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update poll timing: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating poll timing:', error);
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