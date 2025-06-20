import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MessageSquare } from 'lucide-react';
import ReviewCard from './ReviewCard';
import AddReviewForm from './AddReviewForm';
import useAuth from '../../hooks/useAuth';
import { getBookReviews, addReview, updateReview, deleteReview, getUserBookReview } from '../../api/reviewsService';
import toast from '../../utils/toast';

const ReviewsSection = ({ bookId, onReviewsChange }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    if (user) {
      fetchUserReview();
    }
  }, [bookId, user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getBookReviews(bookId);
      // API returns { success: true, data: [...] }
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    if (!user) return;
    
    try {
      const existingReview = await getUserBookReview(bookId, user.id);
      setUserReview(existingReview);
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  const handleAddReview = async (reviewData) => {
    try {
      setSubmitting(true);
      const newReview = await addReview(bookId, reviewData);
      setReviews(prev => [newReview, ...prev]);
      setUserReview(newReview);
      setShowAddForm(false);
      onReviewsChange?.();
      toast.success('Review added successfully!');
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error(error.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReview = async (reviewData) => {
    if (!editingReview) return;

    try {
      setSubmitting(true);
      const updatedReview = await updateReview(editingReview._id, reviewData);
      setReviews(prev => prev.map(review => 
        review._id === editingReview._id ? updatedReview : review
      ));
      setUserReview(updatedReview);
      setEditingReview(null);
      onReviewsChange?.();
      toast.success('Review updated successfully!');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error(error.message || 'Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      if (userReview?._id === reviewId) {
        setUserReview(null);
      }
      onReviewsChange?.();
      toast.success('Review deleted successfully!');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Failed to delete review');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowAddForm(false);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingReview(null);
  };

  const canAddReview = user && !userReview && !showAddForm && !editingReview;

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
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Review Form */}
      {(showAddForm || editingReview) && (
        <AddReviewForm
          onSubmit={editingReview ? handleUpdateReview : handleAddReview}
          onCancel={handleCancelForm}
          existingReview={editingReview}
          loading={submitting}
        />
      )}

      {/* Reviews Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Reviews ({reviews.length})
            </CardTitle>
            {canAddReview && (
              <Button 
                onClick={() => setShowAddForm(true)}
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Review
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                  loading={submitting}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No reviews yet</p>
              <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsSection; 