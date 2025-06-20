import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from 'lucide-react';

const GenreFilter = ({ 
  genres = [], 
  selectedGenre, 
  onGenreChange, 
  placeholder = "All Genres" 
}) => {
  // Default genres if none provided
  const defaultGenres = [
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'Romance',
    'Science Fiction',
    'Fantasy',
    'Biography',
    'History',
    'Self-Help',
    'Business',
    'Philosophy',
    'Poetry'
  ];

  const genreList = genres.length > 0 ? genres : defaultGenres;

  const handleValueChange = (value) => {
    // Convert "all" back to empty string for the parent component
    onGenreChange(value === "all" ? "" : value);
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2 bg-white rounded-md p-1 sm:p-2">
      <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
      <Select value={selectedGenre || "all"} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[140px] sm:w-[180px] h-9 sm:h-10 text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-gray-50">
          {/* Clear filter option */}
          <SelectItem value="all" className="text-sm">All Genres</SelectItem>
          
          {/* Genre options */}
          {genreList.map((genre) => (
            <SelectItem key={genre} value={genre} className="text-sm">
              {genre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default GenreFilter; 