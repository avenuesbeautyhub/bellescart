/**
 * Common validation helper functions
 */

/**
 * Validates email format using regex
 * @param email - Email address to validate
 * @returns boolean - True if email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns object - Contains isValid and message
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validates required string field
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns object - Contains isValid and message
 */
export const validateRequiredString = (value: string | number, fieldName: string): { isValid: boolean; message: string } => {
  if (!value || value.toString().trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }

  return { isValid: true, message: `${fieldName} is valid` };
};
