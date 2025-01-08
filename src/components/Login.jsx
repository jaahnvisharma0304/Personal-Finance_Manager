import { useState } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

function Login({ setIsAuthenticated, setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isNewUser) {
      // Create new user
      const newUser = {
        id: uuidv4(),
        name,
        email,
        password,
        balance: 0,
        transactions: [],
        wishes: [{ id: uuidv4(), title: 'Example Wish', amount: 5000, priority: 'Medium' }],
        budgets: [{ id: uuidv4(), category: 'Monthly Budget', amount: 10000 }],
        categories: ['Food', 'Transport', 'Entertainment', 'Bills']
      };
      
      // Save to localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      localStorage.setItem('users', JSON.stringify([...users, newUser]));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setCurrentUser(newUser);
    } else {
      // Login existing user
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
      } else {
        alert('Invalid credentials');
        return;
      }
    }
    
    setIsAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            {isNewUser ? 'Create Account' : 'Welcome Back'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {isNewUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-md py-2 px-4 hover:opacity-90 transition-opacity"
            >
              {isNewUser ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            {isNewUser ? 'Already have an account? ' : 'Don\'t have an account? '}
            <button
              onClick={() => setIsNewUser(!isNewUser)}
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              {isNewUser ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;