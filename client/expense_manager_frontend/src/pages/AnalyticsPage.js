import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExpenseAnalytics, getMonthlyExpenses } from '../store/expenseSlice';
import ExpenseAnalytics from '../components/Expenses/ExpenseAnalytics';

const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const [year, setYear] = useState(new Date().getFullYear());
  const { analytics, monthlyExpenses, loading } = useSelector((state) => state.expenses);

  useEffect(() => {
    dispatch(getExpenseAnalytics());
    dispatch(getMonthlyExpenses(year));
  }, [dispatch, year]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='analytics-page'>
      <h1>Expense Analytics</h1>
      <select onChange={(e) => setYear(parseInt(e.target.value))} value={year}>
        {[...Array(5)].map((_, i) => {
          const yearOption = new Date().getFullYear() - i;
          return (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          );
        })}
      </select>
      <ExpenseAnalytics analytics={analytics} monthlyExpenses={monthlyExpenses} />
    </div>
  );
};

export default AnalyticsPage;
