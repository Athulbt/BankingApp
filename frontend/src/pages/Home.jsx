import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to Banking App
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Modern digital banking for everyone
      </p>
      {user ? (
        <Link to="/dashboard" className="btn-primary text-lg">
          Go to Dashboard
        </Link>
      ) : (
        <div className="space-x-4">
          <Link to="/register" className="btn-primary text-lg">
            Get Started
          </Link>
          <Link to="/login" className="btn-secondary text-lg">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;