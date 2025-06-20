import { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search books, authors...", autoFocus = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search with useCallback to prevent unnecessary re-renders
  const debouncedSearch = useCallback(
    debounce((term) => {
      onSearch(term);
    }, 400),
    [onSearch]
  );

  // Trigger debounced search when searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="relative flex items-center w-full sm:max-w-md">
      {/* Search Icon */}
      <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        <Search className="h-3 w-3 sm:h-4 sm:w-4" />
      </div>

      {/* Search Input */}
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="pl-8 sm:pl-10 pr-8 sm:pr-10 transition-all focus-visible:ring-2 text-sm h-9 sm:h-10"
      />

      {/* Clear Button */}
      {searchTerm && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-muted rounded-full"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

// Debounce utility function
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

export default SearchBar; 