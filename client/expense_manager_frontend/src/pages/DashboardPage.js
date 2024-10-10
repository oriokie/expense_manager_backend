import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExpenses } from '../store/expenseSlice';
import { getCategories } from '../store/categorySlice';
import ExpenseList from '../components/Expenses/ExpenseList';
import ExpenseForm from '../components/Expenses/ExpenseForm';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { expenses, loading: expensesLoading } = useSelector((state) => state.expenses);
  const { categories, loading: categoriesLoading } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(getExpenses());
    dispatch(getCategories());
  }, [dispatch]);

  if (expensesLoading || categoriesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='dashboard-page'>
      <h1>Dashboard</h1>
      <ExpenseForm categories={categories} />
      <ExpenseList expenses={expenses} categories={categories} />
    </div>
  );
};

export default DashboardPage;
