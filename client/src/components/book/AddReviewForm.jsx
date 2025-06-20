import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from 'lucide-react';

const AddReviewForm = ({ 
  onSubmit, 
  onCancel, 
  existingReview = null, 
  loading = false 
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    }
  }, [existingReview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    
    onSubmit({
      rating,
      comment: comment.trim()
    });
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleStarHover = (value) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const renderStars = () => {
    const displayRating = hoveredRating || rating;
    
    return Array.from({ length: 5 }, (_, i) => {
      const value = i + 1;
      return (
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(value)}
          onMouseEnter={() => handleStarHover(value)}
          onMouseLeave={handleStarLeave}
          className="p-1 hover:scale-110 transition-transform"
        >
          <Star 
            className={`h-6 w-6 transition-colors ${
              value <= displayRating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-200'
            }`} 
          />
        </button>
      );
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {existingReview ? 'Edit Your Review' : 'Add Your Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rating *</Label>
            <div className="flex items-center gap-1">
              {renderStars()}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 ? `${rating}/5` : 'Select a rating'}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Comment (optional)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this book..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              disabled={rating === 0 || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              {loading ? 'Saving...' : (existingReview ? 'Update Review' : 'Add Review')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddReviewForm; 