import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
    <div className="min-h-screen">
      <Suspense 
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        <RouterProvider router={AppRoutes} />
      </Suspense>
    </div>
    </AuthProvider>
  );
};

export default App;
