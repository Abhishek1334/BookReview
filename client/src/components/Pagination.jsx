import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading = false,
  showPageNumbers = true,
  maxVisiblePages = 5 
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const showStartEllipsis = visiblePages[0] > 2;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || loading}
        className="flex items-center space-x-1 px-2 sm:px-3"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline text-xs sm:text-sm">Previous</span>
        <span className="sm:hidden text-xs">Prev</span>
      </Button>

      {showPageNumbers && (
        <>
          {/* First Page */}
          {showStartEllipsis && (
            <>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={loading}
                className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
              >
                1
              </Button>
              <div className="flex items-center">
                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </div>
            </>
          )}

          {/* Visible Page Numbers */}
          {visiblePages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              disabled={loading}
              className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm ${
                currentPage === page 
                  ? "bg-gray-900 hover:bg-gray-800 text-white" 
                  : ""
              }`}
            >
              {page}
            </Button>
          ))}

          {/* Last Page */}
          {showEndEllipsis && (
            <>
              <div className="flex items-center">
                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </div>
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={loading}
                className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
              >
                {totalPages}
              </Button>
            </>
          )}
        </>
      )}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || loading}
        className="flex items-center space-x-1 px-2 sm:px-3"
      >
        <span className="hidden sm:inline text-xs sm:text-sm">Next</span>
        <span className="sm:hidden text-xs">Next</span>
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      {/* Page Info */}
      <div className="hidden md:flex items-center text-xs sm:text-sm text-muted-foreground ml-4">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination; 