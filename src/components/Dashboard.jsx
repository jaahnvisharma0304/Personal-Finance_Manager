import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { v4 as uuidv4 } from 'uuid';

function Dashboard({ currentUser, setIsAuthenticated }) {
  const [userData, setUserData] = useState(currentUser);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddWish, setShowAddWish] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [editingWish, setEditingWish] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: ''
  });

  const [newWish, setNewWish] = useState({
    title: '',
    amount: '',
    priority: 'Medium'
  });

  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: ''
  });

  useEffect(() => {
    // Update theme
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };


  const updateUserData = (newData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => u.id === newData.id ? newData : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(newData));
    setUserData(newData);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
  };

  const resetExpenseChart = () => {
    if (window.confirm('Are you sure you want to reset all transactions? This cannot be undone.')) {
      const updatedUserData = {
        ...userData,
        transactions: [],
        balance: 0
      };
      updateUserData(updatedUserData);
    }
  };

  const deleteTransaction = (transaction) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const updatedBalance = transaction.type === 'income'
        ? userData.balance - transaction.amount
        : userData.balance + transaction.amount;

      const updatedUserData = {
        ...userData,
        transactions: userData.transactions.filter(t => t.id !== transaction.id),
        balance: updatedBalance
      };

      updateUserData(updatedUserData);
    }
  };

  const updateBudgetForExpense = (category, amount) => {
    const matchingBudget = userData.budgets.find(b => b.category.toLowerCase() === category.toLowerCase());
    if (matchingBudget) {
      const spent = getSpentAmount(category);
      if (spent > matchingBudget.amount) {
        alert(`Warning: You've exceeded your budget for ${category}!`);
      }
    }
  };
  
  // const validateAmount = (value) => {
  //   // Remove any non-numeric characters except decimal point
  //   const numericValue = value.replace(/[^\d.]/g, '');
    
  //   // Ensure only one decimal point
  //   const parts = numericValue.split('.');
  //   if (parts.length > 2) {
  //     return parts[0] + '.' + parts[1];
  //   }
    
  //   return numericValue;
  // };
  
  const addTransaction = (e) => {
    e.preventDefault();
    if (isNaN(newTransaction.amount) || newTransaction.amount.trim() === "") {
      alert("Please enter a valid number for the amount.");
      return;
    }
    const transaction = {
      id: uuidv4(),
      ...newTransaction,
      date: new Date().toISOString(),
      amount: parseFloat(newTransaction.amount)
    };

    const updatedUserData = {
      ...userData,
      transactions: [transaction, ...userData.transactions],
      balance: newTransaction.type === 'income' 
        ? userData.balance + parseFloat(newTransaction.amount)
        : userData.balance - parseFloat(newTransaction.amount)
    };

    if (newTransaction.type === 'expense') {
      updateBudgetForExpense(newTransaction.category, parseFloat(newTransaction.amount));
    }

    updateUserData(updatedUserData);
    setShowAddTransaction(false);
    setNewTransaction({ type: 'expense', amount: '', category: '', description: '' });
  };

  // const addWish = (e) => {
  //   e.preventDefault();
  //   const wish = {
  //     id: editingWish ? editingWish.id : uuidv4(),
  //     ...newWish,
  //     amount: parseFloat(newWish.amount)
  //   };

  //   const updatedUserData = {
  //     ...userData,
  //     wishes: editingWish 
  //       ? userData.wishes.map(w => w.id === editingWish.id ? wish : w)
  //       : [...userData.wishes, wish]
  //   };

  //   updateUserData(updatedUserData);
  //   setShowAddWish(false);
  //   setEditingWish(null);
  //   setNewWish({ title: '', amount: '', priority: 'Medium' });
  // };
    const addWish = (e) => {
      e.preventDefault();

      // Check if the amount is a valid number
      if (isNaN(newWish.amount) || newWish.amount.trim() === "") {
        alert("Please enter a valid number for the amount.");
        return;
      }

      const wish = {
        id: editingWish ? editingWish.id : uuidv4(),
        ...newWish,
        amount: parseFloat(newWish.amount),
      };

      const updatedUserData = {
        ...userData,
        wishes: editingWish
          ? userData.wishes.map((w) => (w.id === editingWish.id ? wish : w))
          : [...userData.wishes, wish],
      };

      updateUserData(updatedUserData);
      setShowAddWish(false);
      setEditingWish(null);
      setNewWish({ title: "", amount: "", priority: "Medium" });
    };


  const deleteWish = (wishId) => {
    if (window.confirm('Are you sure you want to delete this wish?')) {
      const updatedUserData = {
        ...userData,
        wishes: userData.wishes.filter(w => w.id !== wishId)
      };
      updateUserData(updatedUserData);
    }
  };

  const editWish = (wish) => {
    setEditingWish(wish);
    setNewWish({
      title: wish.title,
      amount: wish.amount,
      priority: wish.priority
    });
    setShowAddWish(true);
  };

  const addBudget = (e) => {
    e.preventDefault();
    const budget = {
      id: editingBudget ? editingBudget.id : uuidv4(),
      ...newBudget,
      amount: parseFloat(newBudget.amount)
    };

    const updatedUserData = {
      ...userData,
      budgets: editingBudget
        ? userData.budgets.map(b => b.id === editingBudget.id ? budget : b)
        : [...userData.budgets, budget]
    };

    updateUserData(updatedUserData);
    setShowAddBudget(false);
    setEditingBudget(null);
    setNewBudget({ category: '', amount: '' });
  };

  const deleteBudget = (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      const updatedUserData = {
        ...userData,
        budgets: userData.budgets.filter(b => b.id !== budgetId)
      };
      updateUserData(updatedUserData);
    }
  };

  const editBudget = (budget) => {
    setEditingBudget(budget);
    setNewBudget({
      category: budget.category,
      amount: budget.amount
    });
    setShowAddBudget(true);
  };

  const getSpentAmount = (category) => {
    return userData.transactions
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === category.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const expensesByCategory = userData.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }));

  const incomeByCategory = userData.transactions
  .filter(t => t.type === 'income')
  .reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  useEffect(() => {
    setUserData(currentUser);
  }, [currentUser]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Money Manager💰
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-600'}`}
            >
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-6 mb-8`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <h2 className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}text-xl font-semibol`}>{userData.name}</h2>
              <p>{userData.email}</p>
              <p className="text-sm">ID: {userData.id.slice(0, 8)}</p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}text-center`}>
              <p>Current Balance</p>
              <p className={`${isDarkMode ? 'bg-gray-800 text-violet-400 text-3xl font-bold' : 'bg-white text-indigo-600 text-3xl font-bold'}`}>
                ₹{(userData.balance|| 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <button
                onClick={() => setShowAddTransaction(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 w-full mb-2"
              >
                Add Transaction
              </button>
              <button
                onClick={() => setShowAddBudget(true)}
                className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 w-full"
              >
                Add Budget
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Expense Distribution */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-6 mb-8`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Expense Distribution</h3>
                <button
                  onClick={resetExpenseChart}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                >
                  Reset All Transactions
                </button>
              </div>
              {/* <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3> */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${(value|| 0).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
            </motion.div>
            
            {/* Recent Transactions */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              // className="bg-white rounded-lg shadow-md p-6"
              className={`${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
              } rounded-lg shadow-md p-6`}
            >
              
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-4">
          {userData.transactions.slice(0, 5).map(transaction => (
            <div 
              key={transaction.id}
              className={`flex items-center justify-between p-3 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              } rounded-md`}
            >
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {transaction.description}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {transaction.category}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`${
                  transaction.type === 'income' ? 'text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300' : 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                } font-semibold flex items-center`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                  )}
                  ₹{(transaction.amount|| 0).toLocaleString()}
                </div>
                <button
                  onClick={() => deleteTransaction(transaction)}
                  className={`${transaction.type === 'income' ? 'text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300' : 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'}`}

                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
            </motion.div>
          </div>


        {/* Right Column */}
      <div className="space-y-8">
        {/* Budgets */}
        <div className="rounded-lg shadow-md p-6 bg-white dark:bg-gray-800 dark:text-white">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Budgets</h3>
              <button
                onClick={() => {
                  setEditingBudget(null);
                  setNewBudget({ category: '', amount: '' });
                  setShowAddBudget(true);
                }}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {userData.budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="p-4 bg-gray-50 rounded-md dark:bg-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">{budget.category}</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => editBudget(budget)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteBudget(budget.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-indigo-600 font-semibold dark:text-indigo-400">
                    ₹{(budget.amount || 0).toLocaleString()}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2 dark:bg-gray-600">
                    <div
                      className="bg-pink-600 rounded-full h-2"
                      style={{
                        width: `${Math.min(
                          (getSpentAmount(budget.category) / budget.amount) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 dark:text-gray-400">
                    Spent: ₹{(getSpentAmount(budget.category)|| 0).toLocaleString()} / ₹
                    {(budget.amount|| 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        {/* Wishes */}
        <div className="rounded-lg shadow-md p-6 bg-white dark:bg-gray-800 dark:text-white">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Wishes</h3>
              <button
                onClick={() => {
                  setEditingWish(null);
                  setNewWish({ title: '', amount: '', priority: 'Medium' });
                  setShowAddWish(true);
                }}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {userData.wishes.map((wish) => (
                <div
                  key={wish.id}
                  className="p-4 bg-gray-50 rounded-md dark:bg-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium">{wish.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Priority: {wish.priority}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => editWish(wish)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteWish(wish.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-indigo-600 font-semibold dark:text-indigo-400">
                    ₹{(wish.amount || 0).toLocaleString()}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status:{' '}
                      {userData.balance >= wish.amount ? (
                        <span className="text-green-600 dark:text-green-400">
                          Can afford! 🎉
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">
                          Need ₹
                          {((wish.amount - userData.balance)|| 0).toLocaleString()} more
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      </div>
  
          {/* Modal for Adding Transaction */}
          {showAddTransaction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
              } rounded-lg p-6 max-w-md w-full`}
            >
                <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
                <form onSubmit={addTransaction} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Type</label>
                    <select
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        isDarkMode 
                          ? 'bg-gray-900 text-white border-gray-700 focus:border-gray-500 focus:ring-gray-500' 
                          : 'bg-white text-black border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                  </select>

                  </div>
                  <div>
                    <label className="block text-sm font-medium">Amount</label>
                    <input
                      type="text"
                      required
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        isDarkMode 
                          ? 'bg-gray-900 text-white border-gray-700 focus:border-gray-500 focus:ring-gray-500' 
                          : 'bg-white text-black border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Category</label>
                    <input
                      type="text"
                      required
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        isDarkMode 
                          ? 'bg-gray-900 text-white border-gray-700 focus:border-gray-500 focus:ring-gray-500' 
                          : 'bg-white text-black border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Description</label>
                    <input
                      type="text"
                      required
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        isDarkMode 
                          ? 'bg-gray-900 text-white border-gray-700 focus:border-gray-500 focus:ring-gray-500' 
                          : 'bg-white text-black border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAddTransaction(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Add Transaction
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
  
          {/* Modal for Adding/Editing Wish */}
          {showAddWish && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`${
                  isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
                } rounded-lg p-6 max-w-md w-full`}
              >
                <h3 className="text-lg font-semibold mb-4">
                  {editingWish ? 'Edit Wish' : 'Add Wish'}
                </h3>
                <form onSubmit={addWish} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input
                      type="text"
                      required
                      value={newWish.title}
                      onChange={(e) => setNewWish({...newWish, title: e.target.value})}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        isDarkMode 
                          ? 'bg-gray-900 text-white border-gray-700 focus:border-gray-500 focus:ring-gray-500' 
                          : 'bg-white text-black border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Amount</label>
                    <input
                      type="text"
                      required
                      value={newWish.amount}
                      onChange={(e) => setNewWish({...newWish, amount: e.target.value})}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        isDarkMode 
                          ? 'bg-gray-900 text-white border-gray-700 focus:border-gray-500 focus:ring-gray-500' 
                          : 'bg-white text-black border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium ">Priority</label>
                    <select
                      value={newWish.priority}
                      onChange={(e) => setNewWish({...newWish, priority: e.target.value})}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        isDarkMode 
                          ? 'bg-gray-900 text-white border-gray-700 focus:border-gray-500 focus:ring-gray-500' 
                          : 'bg-white text-black border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddWish(false);
                        setEditingWish(null);
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      {editingWish ? 'Update Wish' : 'Add Wish'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
  
          {/* Modal for Adding/Editing Budget */}
          {showAddBudget && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`${
                  isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
                } rounded-lg p-6 max-w-md w-full`}
              >
                <h3 className="text-lg font-semibold mb-4">
                  {editingBudget ? 'Edit Budget' : 'Add Budget'}
                </h3>
                <form onSubmit={addBudget} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium ">Category</label>
                    <input
                      type="text"
                      required
                      value={newBudget.category}
                      onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        isDarkMode 
                          ? 'bg-gray-900 text-white border-gray-700 focus:border-gray-500 focus:ring-gray-500' 
                          : 'bg-white text-black border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium ">Amount</label>
                    <input
                      type="number"
                      required
                      value={newBudget.amount}
                      onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        isDarkMode 
                          ? 'bg-gray-900 text-white border-gray-700 focus:border-gray-500 focus:ring-gray-500' 
                          : 'bg-white text-black border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddBudget(false);
                        setEditingBudget(null);
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      {editingBudget ? 'Update Budget' : 'Add Budget'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    );
  }
  
  export default Dashboard;
