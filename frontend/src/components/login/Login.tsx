import React, { useState } from 'react';
import loginService from '../../services/loginservice';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import showPasswordIcon from './../../assets/show.png';
import hidePasswordIcon from './../../assets/hide.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const loginSuccess = await loginService.login(username, password);
      login();
      if (loginSuccess) {
        setLoggedIn(true);
      } else { }
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loggedIn) {
    navigate('/dashboard');
    return null;
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-64 mx-auto mt-10 p-6 bg-white rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <div className="mb-4">
        <label htmlFor="username" className="block mb-1">Username:</label>
        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
      </div>
      <div className="mb-4 relative">
        <label htmlFor="password" className="block mb-1">Password:</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded pr-10"
            id="password"
          />
          <button
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center justify-center bg-transparent rounded-r"
            aria-label={showPassword ? 'Hide Password' : 'Show Password'}
            style={{ width: "40px" }}
          >
            {showPassword ? (
              <img src={hidePasswordIcon} alt="Hide Password" className="h-4 w-4" />
            ) : (
              <img src={showPasswordIcon} alt="Show Password" className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <button onClick={handleLogin} className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Login</button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default Login;
