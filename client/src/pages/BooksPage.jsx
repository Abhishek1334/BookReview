import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import { getBooks } from '../api';
import toast from '../utils/toast';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortOption, setSortOption] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
    'Technology', 'Health', 'Travel', 'Cooking', 'Art'
  ];

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'author', label: 'Author A-Z' },
    { value: '-averageRating', label: 'Highest Rated' },
  ];

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedGenre && { genre: selectedGenre }),
        sort: sortOption,
      };

      const response = await getBooks(params);
      setBooks(response.books);
      setTotalPages(response.totalPages);
      setTotalBooks(response.totalBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [currentPage, searchTerm, selectedGenre, sortOption]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre === 'all' ? '' : genre);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSortOption('-createdAt');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedGenre || sortOption !== '-createdAt';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Book Collection</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Discover and explore our extensive library
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search books by title, author, or description..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Genre Filter */}
                <Select value={selectedGenre || 'all'} onValueChange={handleGenreChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Filter */}
                <Select 
                  value={sortOption} 
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters & Results Count */}
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-xs sm:text-sm"
                  >
                    Clear Filters
                  </Button>
                )}
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                  {totalBooks} books found
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="bg-gray-200 h-32 sm:h-48 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 rounded"></div>
                    <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 rounded-lg bg-gray-100 inline-block mb-4">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? "Try adjusting your search criteria or clear filters" 
                : "No books are available at the moment"
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Books Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BooksPage; 