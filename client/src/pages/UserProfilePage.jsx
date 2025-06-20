import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UserProfileHeader from '../components/profile/UserProfileHeader';
import UserReviewsList from '../components/profile/UserReviewsList';
import { getUserProfile, getUserStats } from '../api/usersService';

const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile and stats in parallel
      const [profileData, statsData] = await Promise.all([
        getUserProfile(id),
        getUserStats(id)
      ]);

      setProfile(profileData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Navigate to edit profile page (to be implemented)
    navigate(`/profile/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Loading Header */}
          <div className="animate-pulse mb-4 sm:mb-6">
            <div className="h-6 sm:h-8 w-24 sm:w-32 bg-gray-200 rounded mb-3 sm:mb-4"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-5 sm:h-6 w-36 sm:w-48 bg-gray-200 rounded"></div>
                  <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-2 sm:p-3 bg-gray-100 rounded-lg">
                    <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-200 rounded mb-1 sm:mb-2"></div>
                    <div className="h-4 sm:h-6 w-6 sm:w-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading Reviews */}
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
              <div className="h-5 sm:h-6 w-24 sm:w-32 bg-gray-200 rounded mb-3 sm:mb-4"></div>
              <div className="space-y-3 sm:space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-12 h-16 sm:w-16 sm:h-24 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded"></div>
                        <div className="h-3 sm:h-4 w-1/2 bg-gray-200 rounded"></div>
                        <div className="h-3 sm:h-4 w-full bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
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
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <Button 
            variant="ghost" 
            className="mb-4 sm:mb-6 text-sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Back to Home</span>
            <span className="xs:hidden">Back</span>
          </Button>

          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              {error}
            </AlertDescription>
          </Alert>

          <div className="mt-4 sm:mt-6 text-center">
            <Button onClick={fetchUserData} variant="outline" size="sm">
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
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <Button 
            variant="ghost" 
            className="mb-4 sm:mb-6 text-sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Back to Home</span>
            <span className="xs:hidden">Back</span>
          </Button>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              User not found
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-4 sm:mb-6 hover:bg-gray-100 text-sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden xs:inline">Back to Home</span>
          <span className="xs:hidden">Back</span>
        </Button>

        {/* User Profile Header */}
        <UserProfileHeader
          profile={profile}
          stats={stats}
          onEdit={handleEdit}
        />

        {/* User Reviews */}
        <UserReviewsList userId={id} />
      </div>
    </div>
  );
};

export default UserProfilePage; 