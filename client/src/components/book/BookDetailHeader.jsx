import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Calendar, User, Edit, Trash2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const BookDetailHeader = ({ 
  book, 
  onEdit, 
  onDelete, 
  loading = false 
}) => {
  const { user } = useAuth();
  
  if (!book) return null;

  const isCreator = user && user.id === book.createdBy?._id;
  const canEdit = user && (user.role === 'admin' || isCreator);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Book Cover */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div className="w-32 h-48 sm:w-48 sm:h-72 bg-gray-100 rounded-lg overflow-hidden shadow-md">
            {book.coverImage ? (
              <img 
                src={book.coverImage} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <svg className="w-8 h-8 sm:w-16 sm:h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Book Information */}
        <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left">
          {/* Title and Author */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 leading-tight">{book.title}</h1>
            <p className="text-lg sm:text-xl text-gray-600">by {book.author}</p>
          </div>
          
          {/* Action Buttons - Mobile positioned below title */}
          {canEdit && (
            <div className="flex flex-col xs:flex-row gap-2 justify-center sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                disabled={loading}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 text-xs sm:text-sm"
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                disabled={loading}
                className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 text-xs sm:text-sm"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Delete
              </Button>
            </div>
          )}

          {/* Genres */}
          {book.genres && book.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-start">
              {book.genres.map((genre, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {/* Rating and Reviews */}
          <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-4 justify-center sm:justify-start">
            <div className="flex items-center gap-1">
              {renderStars(book.averageRating || 0)}
              <span className="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2">
                {book.averageRating ? book.averageRating.toFixed(1) : '0.0'}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-gray-500">
              {book.reviewCount || 0} {book.reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {/* Description */}
          {book.description && (
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Description</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{book.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4 border-t border-gray-200 items-center sm:items-start">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Added by {book.createdBy?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatDate(book.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailHeader; 