import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Edit, Trash2, MoreHorizontal, AlertCircle } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import useAuth from '../../hooks/useAuth';

const ReviewCard = ({ 
  review, 
  onEdit, 
  onDelete, 
  loading = false 
}) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!review) return null;

  const isOwner = user && user.id === review.user?._id;
  const canEdit = isOwner;

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

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(review._id);
      setShowDeleteConfirm(false);
    } catch {
      // Error handling is done in the parent component
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    onEdit(review);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                {getInitials(review.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</h4>
              <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
            </div>
          </div>

          {/* Actions Menu */}
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit} disabled={loading}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Review
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete} 
                  disabled={loading || isDeleting}
                  className="text-red-600 focus:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Review'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(review.rating)}
          </div>
          <span className="text-sm text-gray-600">{review.rating}/5</span>
        </div>
      </CardHeader>

      {/* Review Content */}
      {review.comment && (
        <CardContent className="pt-0">
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        </CardContent>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md bg-white border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Delete Review
            </DialogTitle>
            <DialogDescription className="text-gray-700">
              Are you sure you want to delete your review?
              <br /><br />
              <span className="text-red-600 font-medium">
                This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={isDeleting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ReviewCard; 