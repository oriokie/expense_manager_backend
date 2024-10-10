import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExpenses } from '../store/expenseSlice';
import { getCategories } from '../store/categorySlice';
import ExpenseList from '../components/Expenses/ExpenseList';
import ExpenseForm from '../components/Expenses/ExpenseForm';

const ExpensesPage = () => {
  const dispatch = useDispatch();
  const [filterCategory, setFilterCategory] = useState('');
  const { expenses, loading: expensesLoading } = useSelector((state) => state.expenses);
  const { categories, loading: categoriesLoading } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(getExpenses());
    dispatch(getCategories());
  }, [dispatch]);

  if (expensesLoading || categoriesLoading) {
    return <div>Loading...</div>;
  }

  const filteredExpenses = filterCategory
    ? expenses.filter((expense) => expense.categoryId === filterCategory)
    : expenses;

  return (
    <div className='expenses-page'>
      <h1>Expenses</h1>
      <ExpenseForm categories={categories} />
      <select onChange={(e) => setFilterCategory(e.target.value)} value={filterCategory}>
        <option value=''>All Categories</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
      <ExpenseList expenses={filteredExpenses} categories={categories} />
    </div>
  );
};

export default ExpensesPage;
