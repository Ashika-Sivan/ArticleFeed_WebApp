/**
 * Extracts a user-friendly error message from any error (Axios error, Network error, or generic Error)
 */
export const getErrorMessage = (error, defaultFallback = 'Something went wrong. Please try again.') => {
  if (!error) return defaultFallback;

  // Network / Connection Error
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Unable to reach the server. Please check your internet connection and try again.';
  }

  // Response with JSON payload
  const data = error.response?.data;
  if (typeof data === 'string' && data.trim()) {
    return data;
  }
  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }
  if (data?.error && typeof data.error === 'string') {
    return data.error;
  }

  // HTTP Status Fallbacks
  const status = error.response?.status;
  if (status === 400) return 'Please check the details you entered and try again.';
  if (status === 401) return 'Incorrect credentials or session expired. Please log in.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested resource was not found.';
  if (status >= 500) return 'Our server encountered an issue. Please try again shortly.';

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return defaultFallback;
};

export default getErrorMessage;

