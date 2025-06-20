import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import Layout from '../components/Layout';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

// Lazy load pages for better performance
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const BooksPage = lazy(() => import('../pages/BooksPage'));
const BookDetailPage = lazy(() => import('../pages/BookDetailPage'));
const UserProfilePage = lazy(() => import('../pages/UserProfilePage'));
const EditProfilePage = lazy(() => import('../pages/EditProfilePage'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export const AppRoutes = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'books',
        element: <BooksPage />,
      },
      {
        path: 'books/:id',
        element: <BookDetailPage />,
      },
      {
        path: 'profile/:id',
        element: (
          <PrivateRoute>
            <UserProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: 'profile/:id/edit',
        element: (
          <PrivateRoute>
            <EditProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: 'admin/dashboard',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]); 