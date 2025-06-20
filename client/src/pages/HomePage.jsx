import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Star, Users, TrendingUp, ArrowRight, Award, Clock, Sparkles } from 'lucide-react';
import BookCard from '../components/BookCard';
import useAuth from '../hooks/useAuth';
import { getBooks } from '../api';
import toast from '../utils/toast';

const HomePage = () => {
  const { user } = useAuth();
  
  // State management
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch different book categories
  const fetchFeaturedSections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch featured books (newest first, more books for better display)
      const recentResponse = await getBooks({
        page: 1,
        limit: 12,
        sort: '-createdAt'
      });

      // Set featured books
      setFeaturedBooks(recentResponse?.books || []);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to fetch books. Please try again.');
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFeaturedSections();
  }, []);

  // Loading skeleton component
  const BookSkeleton = () => (
    <Card className="border-border/50 overflow-hidden">
      <div className="p-0">
        <Skeleton className="w-full h-48 rounded-t-lg" />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-24" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );

  if (user) {
    // Authenticated user view - Library-style homepage
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-6">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Welcome back, <span className="text-blue-600">{user.name.split(' ')[0]}</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover amazing books, read insightful reviews, and expand your literary horizons
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/books">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse All Books
                </Link>
              </Button>
              {user.role === 'admin' && (
                <Button asChild variant="outline" size="lg">
                  <Link to="/admin/dashboard">
                    <Award className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </Button>
              )}
            </div>

            {error ? (
              <Card className="border-red-200 bg-red-50 p-8 text-center">
                <h3 className="text-lg font-semibold mb-2 text-red-800">Unable to load library</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchFeaturedSections} variant="outline">
                  Try Again
                </Button>
              </Card>
            ) : (
              <>
                {/* Featured Books Section */}
                <section className="mb-16">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Featured Collection</h2>
                        <p className="text-gray-600 text-lg">Discover our latest and greatest books</p>
                      </div>
                    </div>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/books">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse All Books
                      </Link>
                    </Button>
                  </div>
                  
                  <div className={`grid gap-4 sm:gap-6 ${
                    featuredBooks.length === 0 ? '' :
                    featuredBooks.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
                    featuredBooks.length === 2 ? 'grid-cols-2 max-w-md mx-auto' :
                    featuredBooks.length === 3 ? 'grid-cols-3 max-w-2xl mx-auto' :
                    featuredBooks.length === 4 ? 'grid-cols-2 sm:grid-cols-4 max-w-3xl mx-auto' :
                    featuredBooks.length <= 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 max-w-5xl mx-auto' :
                    featuredBooks.length <= 8 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 max-w-6xl mx-auto' :
                    'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                  }`}>
                    {loading
                      ? Array.from({ length: 12 }).map((_, index) => (
                          <BookSkeleton key={index} />
                        ))
                      : featuredBooks.map((book) => (
                          <BookCard key={book._id} book={book} />
                        ))
                    }
                  </div>

                  {/* Show message if no books */}
                  {!loading && featuredBooks.length === 0 && (
                    <div className="text-center py-16">
                      <div className="p-4 rounded-lg bg-gray-100 inline-block mb-4">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No books available</h3>
                      <p className="text-gray-600 mb-4">
                        Check back soon for new additions to our collection.
                      </p>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Non-authenticated user view - Marketing homepage
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center justify-center p-4 sm:p-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-6 sm:mb-8">
              <BookOpen className="h-10 w-10 sm:h-14 sm:w-14 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Your Digital
              <span className="block text-blue-600">Book Haven</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover, review, and share your love for books in a vibrant community of readers. 
              Build your personal library and explore curated collections.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/register">
                  Start Your Journey
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="p-4 rounded-full bg-blue-100 w-fit mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="mb-3 text-xl">Vast Library</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Explore thousands of books across all genres. From classics to contemporary bestsellers.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="p-4 rounded-full bg-green-100 w-fit mx-auto mb-4">
                  <Star className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="mb-3 text-xl">Honest Reviews</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Read authentic reviews from fellow book lovers and share your own reading experiences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="p-4 rounded-full bg-purple-100 w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="mb-3 text-xl">Reading Community</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Connect with passionate readers, discover recommendations, and join the conversation.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Featured Books Preview */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Discover Great Books
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get a glimpse of our curated collection
            </p>
          </div>

          <div className={`grid gap-4 sm:gap-6 mb-12 ${
            featuredBooks.length === 0 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' :
            featuredBooks.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
            featuredBooks.length === 2 ? 'grid-cols-2 max-w-md mx-auto' :
            featuredBooks.length === 3 ? 'grid-cols-3 max-w-2xl mx-auto' :
            featuredBooks.length === 4 ? 'grid-cols-2 sm:grid-cols-4 max-w-3xl mx-auto' :
            featuredBooks.length <= 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 max-w-5xl mx-auto' :
            'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 max-w-5xl mx-auto'
          }`}>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <BookSkeleton key={index} />
                ))
              : featuredBooks.slice(0, 6).map((book) => (
                  <BookCard key={book._id} book={book} />
                ))
            }
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 sm:p-12 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Start Reading?</h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Join thousands of book enthusiasts and start building your personal digital library today.
            </p>
            <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-gray-100">
              <Link to="/register">
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 