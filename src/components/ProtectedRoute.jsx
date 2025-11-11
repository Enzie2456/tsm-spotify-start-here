// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('spotifyToken');
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;