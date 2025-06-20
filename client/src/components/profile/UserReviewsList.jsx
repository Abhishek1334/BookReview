import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  BookOpen,
  ArrowRight 
} from 'lucide-react';
import { getUserReviews } from '../../api/reviewsService';

const UserReviewsList = ({ userId }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserReviews();
    }
  }, [userId]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const response = await getUserReviews(userId, { limit: 50 });
      setReviews(response.reviews || []);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const handleViewBook = (review) => {
    const bookId = review.book?._id;
    
    if (bookId) {
      navigate(`/books/${bookId}`);
    } else {
      console.error('No book ID found for review:', review);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
                <div className="flex gap-4">
                  <div className="w-16 h-24 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="h-4 w-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">Failed to load reviews</p>
            <Button onClick={fetchUserReviews} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Reviews ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div 
                key={review._id} 
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Book Cover */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-24 bg-gray-100 rounded overflow-hidden">
                      {review.book?.coverImage ? (
                        <img 
                          src={review.book.coverImage} 
                          alt={review.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 space-y-2">
                    {/* Book Info */}
                    <div>
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {review.book?.title || 'Unknown Book'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        by {review.book?.author || 'Unknown Author'}
                      </p>
                    </div>

                    {/* Rating and Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {review.rating}/5
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>

                    {/* Review Comment */}
                    {review.comment && (
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                        {review.comment}
                      </p>
                    )}

                    {/* Book Genres */}
                    {review.book?.genres && review.book.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {review.book.genres.slice(0, 3).map((genre, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {review.book.genres.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{review.book.genres.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* View Book Button */}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBook(review)}
                        className="text-xs"
                      >
                        View Book
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No reviews yet</p>
            <p className="text-sm text-gray-400">Start reviewing books to see them here!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserReviewsList; 