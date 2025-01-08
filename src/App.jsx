import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? 
          <Login setIsAuthenticated={setIsAuthenticated} setCurrentUser={setCurrentUser} /> : 
          <Navigate to="/dashboard" />
        } />
        <Route path="/dashboard" element={
          isAuthenticated ? 
          <Dashboard currentUser={currentUser} setIsAuthenticated={setIsAuthenticated} /> : 
          <Navigate to="/login" />
        } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;