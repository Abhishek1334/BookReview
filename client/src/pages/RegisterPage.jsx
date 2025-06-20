import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User } from 'lucide-react';
import useAuth from '../hooks/useAuth';

// Modular components
import AuthHeader from '../components/forms/AuthHeader';
import FormField from '../components/forms/FormField';
import PasswordInput from '../components/forms/PasswordInput';
import AuthFooter from '../components/forms/AuthFooter';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, register } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password must be less than 128 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setError('');
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const success = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      if (success) {
      navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      // Error handling is done in the AuthContext register method
      // We can add specific UI error handling here if needed
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <AuthHeader 
          title="Join BookReview"
          description="Create your account to start reviewing books"
        />

        {/* Register Form */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-lg sm:text-xl text-center">Create account</CardTitle>
            <CardDescription className="text-center text-sm">
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              {/* General Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <FormField
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                error={errors.name}
                label="Full Name"
                required
              />

              <FormField
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                error={errors.email}
                label="Email"
                required
              />
      
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                error={errors.password}
                label="Password"
                required
              />

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                error={errors.confirmPassword}
                label="Confirm Password"
                required
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
              
              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-foreground hover:text-gray-600 transition-colors underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <AuthFooter text="By creating an account, you agree to our terms of service and privacy policy." />
      </div>
    </div>
  );
};

export default RegisterPage; 