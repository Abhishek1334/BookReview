// Re-export from the new centralized auth service for backward compatibility
export {
  loginUser,
  registerUser,
  refreshToken,
  getCurrentUser,
  logoutUser
} from './authService'; 