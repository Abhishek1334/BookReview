import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Shield, 
  BookOpen, 
  Star, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Calendar
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { getBooks, addBook, updateBook, deleteBook, getGenres } from '../api/booksService';
import { getAllReviews, deleteReview } from '../api/reviewsService';
import toast from '../utils/toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for dashboard stats
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalReviews: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for books management
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksPage] = useState(1);

  // State for reviews management
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage] = useState(1);

  // State for book form
  const [showBookForm, setShowBookForm] = useState(false);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    description: '',
    genres: [],
    coverImage: null
  });
  const [bookFormLoading, setBookFormLoading] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  // State for delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State for review delete confirmation modal
  const [showReviewDeleteConfirm, setShowReviewDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [reviewDeleteLoading, setReviewDeleteLoading] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch books and reviews data
      const [booksData, reviewsData] = await Promise.all([
        getBooks({ limit: 1 }), // Just get count
        getAllReviews({ limit: 1 }) // Just get count
      ]);

      // Calculate average rating from reviews
      const allReviews = await getAllReviews({ limit: 1000 }); // Get more for average
      const averageRating = allReviews.reviews.length > 0
        ? allReviews.reviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.reviews.length
        : 0;

      setStats({
        totalBooks: booksData.totalBooks || 0,
        totalReviews: reviewsData.totalReviews || 0,
        averageRating: Math.round(averageRating * 10) / 10
      });
    } catch {
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  // Fetch books
  const fetchBooks = async (page = 1) => {
    try {
      setBooksLoading(true);
      const response = await getBooks({ page, limit: 10 });
      setBooks(response.books || []);
    } catch {
      toast.error('Failed to load books');
    } finally {
      setBooksLoading(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async (page = 1) => {
    try {
      setReviewsLoading(true);
      const response = await getAllReviews({ page, limit: 10, sort: '-createdAt' });
      setReviews(response.reviews || []);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  // Fetch genres
  const fetchGenres = async () => {
    try {
      const genres = await getGenres();
      setAvailableGenres(genres);
    } catch {
      // Use default genres if API fails
      setAvailableGenres(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy']);
    }
  };

  // Load initial data
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBooks();
      fetchReviews();
      fetchGenres();
    }
  }, [user]);

  // Cleanup image preview on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle book form submission
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookFormData.title.trim() || !bookFormData.author.trim()) {
      toast.error('Title and author are required');
      return;
    }

    try {
      setBookFormLoading(true);
      
      const formData = new FormData();
      formData.append('title', bookFormData.title.trim());
      formData.append('author', bookFormData.author.trim());
      if (bookFormData.description.trim()) {
        formData.append('description', bookFormData.description.trim());
      }
      if (bookFormData.genres.length > 0) {
        formData.append('genres', JSON.stringify(bookFormData.genres));
      }
      if (bookFormData.coverImage) {
        formData.append('coverImage', bookFormData.coverImage);
      }

      if (editingBook) {
        await updateBook(editingBook._id, formData);
        toast.success('Book updated successfully!');
      } else {
        await addBook(formData);
        toast.success('Book added successfully!');
      }

      // Reset form and refresh data
      setBookFormData({ title: '', author: '', description: '', genres: [], coverImage: null });
      cleanupImagePreview();
      setShowBookForm(false);
      setEditingBook(null);
      fetchBooks(booksPage);
      fetchStats();
    } catch (err) {
      toast.error(err.message || 'Failed to save book');
    } finally {
      setBookFormLoading(false);
    }
  };

  // Handle book deletion
  const handleDeleteBook = async (bookId, title) => {
    setBookToDelete({ id: bookId, title });
    setShowDeleteConfirm(true);
  };

  // Confirm book deletion
  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteBook(bookToDelete.id);
      toast.success('Book and all associated reviews deleted successfully!');
      fetchBooks(booksPage);
      fetchReviews(reviewsPage); // Refresh reviews since they may have been deleted too
      fetchStats();
      setShowDeleteConfirm(false);
      setBookToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete book');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancel book deletion
  const cancelDeleteBook = () => {
    setShowDeleteConfirm(false);
    setBookToDelete(null);
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId, bookTitle) => {
    setReviewToDelete({ id: reviewId, bookTitle });
    setShowReviewDeleteConfirm(true);
  };

  // Confirm review deletion
  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      setReviewDeleteLoading(true);
      await deleteReview(reviewToDelete.id);
      toast.success('Review deleted successfully!');
      fetchReviews(reviewsPage);
      fetchStats();
      setShowReviewDeleteConfirm(false);
      setReviewToDelete(null);
    } catch (err) {
      console.error('Delete review error:', err);
      toast.error(err.message || 'Failed to delete review');
    } finally {
      setReviewDeleteLoading(false);
    }
  };

  // Cancel review deletion
  const cancelDeleteReview = () => {
    setShowReviewDeleteConfirm(false);
    setReviewToDelete(null);
  };

  // Handle edit book
  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookFormData({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      genres: book.genres || [],
      coverImage: null // Reset file input
    });
    setImagePreview(null); // Reset preview for new files
    setShowBookForm(true);
  };

  // Handle file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setBookFormData(prev => ({ ...prev, coverImage: file }));
    
    if (file) {
      // Create preview URL for new file
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  // Clean up preview URL when component unmounts or image changes
  const cleanupImagePreview = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  // Handle form close/cancel
  const handleFormClose = () => {
    cleanupImagePreview();
    setShowBookForm(false);
    setEditingBook(null);
    setBookFormData({ title: '', author: '', description: '', genres: [], coverImage: null });
  };

  // Handle genre selection
  const handleGenreToggle = (genre) => {
    setBookFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Don't render if not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-100">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Welcome back, {user.name}. Manage your BookReview platform from here.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3 ">
            <Dialog open={showBookForm} onOpenChange={setShowBookForm}>
              <DialogTrigger asChild>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Book
                </Button>
              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border shadow-2xl">
                <DialogHeader>
                  <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                  <DialogDescription>
                    {editingBook ? 'Update the book information below.' : 'Fill in the details to add a new book to the library.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBookSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={bookFormData.title}
                        onChange={(e) => setBookFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter book title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author">Author *</Label>
                      <Input
                        id="author"
                        value={bookFormData.author}
                        onChange={(e) => setBookFormData(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="Enter author name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={bookFormData.description}
                      onChange={(e) => setBookFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter book description"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Cover Image</Label>
                    
                    {/* Image Preview Section */}
                    <div className="mb-4">
                      {/* Existing image preview (when editing) */}
                      {editingBook && editingBook.coverImage && !imagePreview && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-2">Current cover image:</p>
                          <div className="w-32 h-48 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                            <img 
                              src={editingBook.coverImage} 
                              alt={editingBook.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* New image preview */}
                      {imagePreview && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-2">
                            {editingBook ? 'New cover image:' : 'Preview:'}
                          </p>
                          <div className="w-32 h-48 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                            <img 
                              src={imagePreview} 
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              cleanupImagePreview();
                              setBookFormData(prev => ({ ...prev, coverImage: null }));
                              // Reset file input
                              const fileInput = document.getElementById('coverImage');
                              if (fileInput) fileInput.value = '';
                            }}
                            className="mt-2 text-xs"
                          >
                            Remove Image
                          </Button>
                        </div>
                      )}
                    </div>

                    <Input
                      id="coverImage"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageChange}
                    />
                    <p className="text-xs text-gray-500">Maximum 5MB. JPEG, JPG, PNG only.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Genres</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableGenres.map((genre) => (
                        <Button
                          key={genre}
                          type="button"
                          variant={bookFormData.genres.includes(genre) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleGenreToggle(genre)}
                          className={
                            bookFormData.genres.includes(genre) 
                              ? "bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-md" 
                              : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                          }
                        >
                          {genre}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFormClose}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={bookFormLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    >
                      {bookFormLoading ? 'Saving...' : (editingBook ? 'Update Book' : 'Add Book')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 rounded-lg bg-blue-100 flex-shrink-0">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">
                    {loading ? '...' : stats.totalBooks}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Total Books</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 rounded-lg bg-green-100 flex-shrink-0">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">
                    {loading ? '...' : stats.totalReviews}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 rounded-lg bg-yellow-100 flex-shrink-0">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">
                    {loading ? '...' : stats.averageRating || 'N/A'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Books Management */}
          <Card className="border-border/50">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                Books Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {booksLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-3 sm:space-x-4">
                      <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : books.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                  {books.map((book) => (
                    <div key={book._id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-14 sm:w-12 sm:h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {book.coverImage ? (
                            <img 
                              src={book.coverImage} 
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base line-clamp-1">{book.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">by {book.author}</p>
                          <div className="flex items-center gap-1 sm:gap-2 mt-1">
                            <div className="flex items-center">
                              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs ml-1">{book.averageRating?.toFixed(1) || '0.0'}</span>
                            </div>
                            <span className="text-xs text-gray-500">({book.reviewCount || 0})</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBook(book)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBook(book._id, book.title)}
                          className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">No books found</p>
              )}
            </CardContent>
          </Card>

          {/* Reviews Management */}
          <Card className="border-border/50">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {reviewsLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                  {reviews.map((review) => (
                    <div key={review._id} className="p-2 sm:p-3 border rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                                    i < review.rating 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs sm:text-sm font-medium line-clamp-1">{review.user?.name}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-1">
                            <strong>{review.book?.title}</strong> by {review.book?.author}
                          </p>
                          {review.comment && (
                            <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReview(review._id, review.book?.title)}
                          className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">No reviews found</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <Shield className="h-4 w-4 inline mr-1" />
            You have administrator privileges. Use these tools responsibly to maintain the quality of the BookReview platform.
          </p>
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md bg-white border shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Delete Book
              </DialogTitle>
              <DialogDescription className="text-gray-700">
                Are you sure you want to delete <strong>"{bookToDelete?.title}"</strong>?
                <br /><br />
                <span className="text-red-600 font-medium">
                  This action cannot be undone and will also delete all associated reviews.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={cancelDeleteBook}
                disabled={deleteLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteBook}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Book'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review Delete Confirmation Modal */}
        <Dialog open={showReviewDeleteConfirm} onOpenChange={setShowReviewDeleteConfirm}>
          <DialogContent className="max-w-md bg-white border shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Delete Review
              </DialogTitle>
              <DialogDescription className="text-gray-700">
                Are you sure you want to delete this review for <strong>"{reviewToDelete?.bookTitle}"</strong>?
                <br /><br />
                <span className="text-red-600 font-medium">
                  This action cannot be undone.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={cancelDeleteReview}
                disabled={reviewDeleteLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteReview}
                disabled={reviewDeleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                {reviewDeleteLoading ? 'Deleting...' : 'Delete Review'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard; 