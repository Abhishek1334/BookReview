import { BookOpen } from 'lucide-react';

const AuthHeader = ({ title, description }) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 mb-4">
        <BookOpen className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  );
};

export default AuthHeader; 