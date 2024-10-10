import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <div className='home-page'>
      <h1>Welcome to Expense Manager</h1>
      <p>Keep track of your expenses and manage your finances efficiently.</p>
      {!isAuthenticated ? (
        <div>
          <Link to='/login'>Login</Link>
          <Link to='/register'>Register</Link>
        </div>
      ) : (
        <Link to='/dashboard'>Go to Dashboard</Link>
      )}
    </div>
  );
};

export default HomePage;
