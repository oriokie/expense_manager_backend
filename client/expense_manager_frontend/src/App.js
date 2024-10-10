import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import ExpensesPage from './pages/ExpensesPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className='App'>
          <Header />
          <Switch>
            <Route exact path='/' component={HomePage} />
            <Route path='/dashboard' component={DashboardPage} />
            <Route path='/categories' component={CategoriesPage} />
            <Route path='/expenses' component={ExpensesPage} />
            <Route path='/analytics' component={AnalyticsPage} />
          </Switch>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
