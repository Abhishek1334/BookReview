import { useState } from 'react';
import { ChevronUp, ChevronDown, Shield, Github, Globe, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";

const RecruiterNote = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      {/* Expandable Content - Shows above trigger */}
      {isExpanded && (
        <div className="mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-3 max-h-80 overflow-y-auto">
          {/* Admin Credentials - Compact */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-orange-800 mb-2">🔑 Admin Login</h4>
            <div className="space-y-2 text-xs">
              <div className="bg-white p-2 rounded border">
                <span className="text-gray-600">Email:</span>
                <div className="font-mono text-gray-800 select-all">admin@bookplatform.com</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="text-gray-600">Password:</span>
                <div className="font-mono text-gray-800 select-all">admin123</div>
              </div>
            </div>
          </div>

          {/* Features - Simplified */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-green-800 mb-2">🚀 Try These Features</h4>
            <div className="text-xs text-green-700 space-y-1">
              <div>• Browse featured book collections on homepage</div>
              <div>• Search & filter books on /books page</div>
              <div>• Admin dashboard: manage books & reviews</div>
              <div>• Write reviews with star rating and comment on book detail pages</div>
              <div>• Update user profile</div>
            </div>
          </div>

          {/* Contact - Compact */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-2">📞 Contact</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <a 
                href="mailto:AbhishekRajoria24@gmail.com" 
                className="flex items-center gap-1 text-blue-700 hover:underline"
              >
                <Mail className="h-3 w-3" />
                Email
              </a>
              <a 
                href="https://github.com/Abhishek1334" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-700 hover:underline"
              >
                <Github className="h-3 w-3" />
                GitHub
              </a>
              <a 
                href="https://abhishek-rajoria.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-700 hover:underline"
              >
                <Globe className="h-3 w-3" />
                Portfolio
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Compact Trigger Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
        size="sm"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">For Recruiters</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </div>
      </Button>
    </div>
  );
};

export default RecruiterNote; 