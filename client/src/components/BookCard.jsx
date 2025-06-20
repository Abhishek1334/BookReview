import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle, Eye } from 'lucide-react';

const BookCard = ({ book, variant = "default" }) => {
  const {
    _id,
    title,
    author,
    coverImage,
    averageRating = 0,
    reviewCount = 0,
    genre,
    description
  } = book;

  // Format rating to 1 decimal place
  const formattedRating = averageRating ? averageRating.toFixed(1) : '0.0';
  
  // Default cover image if none provided
  const displayCover = coverImage || '/placeholder-book-cover.svg';

  return (
    <Card className="group border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <CardHeader className="p-2 sm:p-3 flex-shrink-0">
        {/* Book Cover */}
        <div className="relative overflow-hidden rounded-t-sm">
          <img
            src={displayCover}
            alt={`Cover of ${title}`}
            className="w-full h-32 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/placeholder-book-cover.svg';
            }}
          />
          {/* Overlay with quick actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              asChild
              size="sm"
              className="bg-white/90 text-gray-900 hover:bg-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <Link to={`/books/${_id}`}>
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Quick View</span>
                <span className="sm:hidden">View</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 sm:p-4 flex-1 flex flex-col">
        {/* Genre Badge */}
        {genre && (
          <Badge variant="secondary" className="text-xs mb-1 sm:mb-2 matte-stone self-start">
            {genre}
          </Badge>
        )}

        {/* Title */}
        <h3 className="font-semibold text-sm sm:text-lg line-clamp-2 mb-1 group-hover:text-gray-600 transition-colors leading-tight">
          {title}
        </h3>

        {/* Author */}
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-1">
          by {author}
        </p>

        {/* Description (if variant is expanded) */}
        {variant === "expanded" && description && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Rating */}
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium">{formattedRating}</span>
            </div>

            {/* Review Count */}
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs">{reviewCount}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-2 sm:p-4 pt-0 mt-auto">
        <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm py-2 sm:py-2">
          <Link to={`/books/${_id}`}>
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">View</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookCard; 