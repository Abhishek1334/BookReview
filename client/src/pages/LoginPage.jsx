import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useAuth from '../hooks/useAuth';

// Modular components
import AuthHeader from '../components/forms/AuthHeader';
import FormField from '../components/forms/FormField';
import PasswordInput from '../components/forms/PasswordInput';
import AuthFooter from '../components/forms/AuthFooter';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const success = await login(formData);
      if (success) {
      navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <AuthHeader 
          title="Welcome back"
          description="Sign in to your BookReview account"
        />

        {/* Login Form */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-lg sm:text-xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center text-sm">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
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
                placeholder="Enter your password"
                autoComplete="current-password"
                error={errors.password}
                label="Password"
                required
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
              
              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-foreground hover:text-gray-600 transition-colors underline underline-offset-4"
                >
                  Create account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <AuthFooter text="By signing in, you agree to our terms of service and privacy policy." />
      </div>
    </div>
  );
};

export default LoginPage; 