import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SplashScreen from './screens/SplashScreen';
import Login from './components/login/Login';
import TransactionForm from './components/Dashboard/TransactionForm';
import TransactionList from './components/Dashboard/TransactionList';
import FinancialReport from './components/financialreport/FinancialReport';
import { useAuth } from './contexts/AuthContext';
import Modal from 'react-modal'; // Import Modal from react-modal

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/financial-report" element={<FinancialReport />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const navigate = useNavigate();

  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);

  const openAddTransactionModal = () => {
    setIsAddTransactionModalOpen(true);
  };

  const closeAddTransactionModal = () => {
    setIsAddTransactionModalOpen(false);
  };

  React.useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold mr-4">My Finance App</h1>
          <nav>
            <ul className="flex items-center">
              <li><Link to="/dashboard" className="px-4 py-2 text-white hover:bg-blue-600 rounded">Dashboard</Link></li>
              <li><Link to="/financial-report" className="px-4 py-2 text-white hover:bg-blue-600 rounded">Finance Report</Link></li>
            </ul>
          </nav>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 focus:outline-none">Logout</button>
      </header>
      <main className="container mx-auto flex-grow p-4">
        <button onClick={openAddTransactionModal} className="bg-blue-500 text-white px-4 py-2 rounded focus:outline-none mt-10">Add +</button>
        <Modal isOpen={isAddTransactionModalOpen} onRequestClose={closeAddTransactionModal} className="modal" contentLabel="Transaction Modal" style={{ content: { height: 'fit-content', margin: 'auto', backgroundColor: 'rgb(98 98 98 / 42%)' } }}>
          <TransactionForm isOpen={isAddTransactionModalOpen} closeModal={closeAddTransactionModal} />
        </Modal>
        <TransactionList />
      </main>
    </div>
  );
};

export default App;