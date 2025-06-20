import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Star, 
  MessageSquare, 
  Edit, 
  Mail 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const UserProfileHeader = ({ 
  profile, 
  stats, 
  onEdit, 
  loading = false 
}) => {
  const { user } = useAuth();
  
  if (!profile) return null;

  const isOwnProfile = user && user.id === profile._id;

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <Badge className={getRoleColor(profile.role)}>
                {profile.role}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{profile.email}</span>
            </div>
          </div>

          {/* Edit Button */}
          {isOwnProfile && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onEdit}
              disabled={loading}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats?.totalReviews || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatDate(stats?.joinedDate)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileHeader; 