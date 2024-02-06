import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
      navigate('/login');
    }, 3000);

    return () => clearTimeout(splashTimeout);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      {showSplash && (
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to My Finance App</h1>
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-gray-900"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
