import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BookDetailHeader from '../components/book/BookDetailHeader';
import ReviewsSection from '../components/book/ReviewsSection';
import { getBookById, deleteBook } from '../api/booksService';
import toast from '../utils/toast';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);
      const bookData = await getBookById(id);
      setBook(bookData);
    } catch (err) {
      console.error('Error fetching book:', err);
      setError(err.message || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Navigate to edit page (to be implemented)
    navigate(`/books/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      await deleteBook(id);
      toast.success('Book deleted successfully');
      navigate('/');
    } catch (err) {
      console.error('Error deleting book:', err);
      toast.error(err.message || 'Failed to delete book');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewsChange = () => {
    // Refresh book data to update review count and average rating
    fetchBook();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Loading Header */}
          <div className="animate-pulse mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-48 h-72 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                    <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Reviews */}
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Button>

          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>

          <div className="mt-6 text-center">
            <Button onClick={fetchBook} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Button>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Book not found
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
          <span className="hidden xs:inline">Back to Books</span>
          <span className="xs:hidden">Back</span>
        </Button>

        {/* Book Details */}
        <BookDetailHeader
          book={book}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={actionLoading}
        />

        {/* Reviews Section */}
        <ReviewsSection
          bookId={id}
          onReviewsChange={handleReviewsChange}
        />
      </div>
    </div>
  );
};

export default BookDetailPage; 