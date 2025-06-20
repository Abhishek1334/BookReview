import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, User, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useAuth from '../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../api/usersService';
import toast from '../utils/toast';

const EditProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [errors, setErrors] = useState({});

  // Check if user can edit this profile
  const canEdit = user && user.id === id;

  useEffect(() => {
    if (!canEdit) {
      toast.error('You can only edit your own profile');
      navigate('/');
      return;
    }

    if (id) {
      fetchProfile();
    }
  }, [id, canEdit, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await getUserProfile(id);
      setProfile(profileData);
      setFormData({
        name: profileData.name || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = await updateUserProfile(id, {
        name: formData.name.trim()
      });
      
      setProfile(updatedProfile);
      toast.success('Profile updated successfully!');
      
      // Refresh the user context to update the navbar
      await refreshUser();
      
      // Navigate back to profile page
      navigate(`/profile/${id}`);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-gray-200 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate(`/profile/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>

          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>

          <div className="mt-6 text-center">
            <Button onClick={fetchProfile} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Profile not found
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-gray-100"
          onClick={() => navigate(`/profile/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        {/* Edit Profile Form */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl">
                    {getInitials(formData.name || profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">Profile Picture</h3>
                  <p className="text-sm text-gray-500">
                    Avatar is automatically generated from your name
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`transition-all ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">
                    Role
                  </Label>
                  <Input
                    type="text"
                    value={profile.role}
                    disabled
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">
                    Role is managed by administrators
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/profile/${id}`)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfilePage; 