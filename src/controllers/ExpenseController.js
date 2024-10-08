/**
 * ExpenseController Module
 */
const dbClient = require('../config/db');
const { ObjectId } = require('mongodb');

/**
 * Class representing an expense controller
 */
class ExpenseController {
  /**
   * Method to create an expense
   */
  static async addExpense(req, res) {
    try {
      const { amount, description, date, categoryId } = req.body;
      if (!amount) {
        return res.status(400).json({ error: 'Missing amount' });
      }
      if (!description) {
        return res.status(400).json({ error: 'Missing description' });
      }
      if (!date) {
        return res.status(400).json({ error: 'Missing date' });
      }
      if (!categoryId) {
        return res.status(400).json({ error: 'Missing category ID' });
      }

      // Ensure categoryId is a valid ObjectId
      if (!ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      const categoriesCollection = await dbClient.getCategoriesCollection();

      // Check if the category exists in the database
      const categoryExists = await categoriesCollection.findOne({ _id: new ObjectId(categoryId) });
      if (!categoryExists) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const expensesCollection = await dbClient.getExpensesCollection();
      const newExpense = {
        userId: req.user._id,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        categoryId: new ObjectId(categoryId),
        createdAt: new Date(),
      };

      await expensesCollection.insertOne(newExpense);

      return res.status(201).json({ message: 'Expense created successfully', expense: newExpense });
    } catch (error) {
      console.error('Error creating expense:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  /**
   * Method to get expenses based on a query
   */
  static async getExpenses(req, res) {
    try {
      const { startDate, endDate, categoryId } = req.query;
      const expensesCollection = await dbClient.getExpensesCollection();

      let query = { userId: req.user._id };
      if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      if (categoryId) {
        query.categoryId = new ObjectId(categoryId);
      }

      const expenses = await expensesCollection.find(query).toArray();
      return res.status(200).json({ expenses });
    } catch (error) {
      console.error('Error getting expenses:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Method to update an expense
   */
  static async updateExpense(req, res) {
    try {
      const { id } = req.params;
      const { amount, description, date, categoryId } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Missing expense ID' });
      }
      if (!amount) {
        return res.status(400).json({ error: 'Missing amount' });
      }
      if (!description) {
        return res.status(400).json({ error: 'Missing description' });
      }
      if (!date) {
        return res.status(400).json({ error: 'Missing date' });
      }
      if (!categoryId) {
        return res.status(400).json({ error: 'Missing category ID' });
      }

      // Ensure categoryId is a valid ObjectId
      if (!ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      const categoriesCollection = await dbClient.getCategoriesCollection();

      // Check if the category exists in the database
      const categoryExists = await categoriesCollection.findOne({ _id: new ObjectId(categoryId) });
      if (!categoryExists) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const expensesCollection = await dbClient.getExpensesCollection();
      const updatedExpense = {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        categoryId: new ObjectId(categoryId),
        updatedAt: new Date(),
      };

      const result = await expensesCollection.updateOne(
        { _id: new ObjectId(id), userId: req.user._id },
        { $set: updatedExpense }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      return res
        .status(200)
        .json({ message: 'Expense updated successfully', expense: updatedExpense });
    } catch (error) {
      console.error('Error updating expense:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Method to delete an expense
   */
  static async deleteExpense(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Missing expense ID' });
      }

      const expensesCollection = await dbClient.getExpensesCollection();
      const result = await expensesCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.user._id,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      return res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (err) {
      console.error('Error deleting expense:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Method to get expenses by Category and its sum
   * per give period
   */
  static async getExpenseAnalytics(req, res) {
    try {
      const { startDate, endDate, categoryId } = req.query;
      const expensesCollection = await dbClient.getExpensesCollection();

      let matchQuery = { userId: req.user._id };
      if (startDate && endDate) {
        matchQuery.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      if (categoryId) {
        matchQuery.categoryId = new ObjectId(categoryId);
      }

      const pipeline = [
        { $match: matchQuery },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              categoryId: '$categoryId',
            },
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1 } },
      ];

      const analytics = await expensesCollection.aggregate(pipeline).toArray();
      return res.status(200).json({ analytics });
    } catch (error) {
      console.error('Error getting expenses analytics:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  static async getMonthlyExpenses(req, res) {
    try {
      const expensesCollection = await dbClient.getExpensesCollection();
      const { year: queryYear } = req.query;

      // Use current year if no year is provided
      const year = queryYear ? parseInt(queryYear, 10) : new Date().getFullYear();

      // Match expenses by the given year
      // Set the start and end of the year in UTC to avoid time zone issues
      const start = new Date(`${year}-01-01T00:00:00.000Z`); // January 1st of the specified year in UTC
      const end = new Date(`${year}-12-31T23:59:59.999Z`); // December 31st of the specified year in UTC

      // Generate array of months for the year
      const months = Array.from(
        { length: 12 },
        (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`
      );

      // Create a match query for the year
      const matchQuery = {
        userId: req.user._id,
        date: { $gte: start, $lt: end },
      };

      // Perform the aggregation
      const pipeline = [
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, // Group by year-month (YYYY-MM)
            totalAmount: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ];

      const results = await expensesCollection.aggregate(pipeline).toArray();
      console.log('Aggregation Results:', results); // Log results for debugging

      // Map results to a monthly total with zero for missing months
      const monthlyExpenses = months.map((month) => ({
        month,
        totalAmount: results.find((result) => result._id === month)?.totalAmount || 0,
      }));

      return res.status(200).json({ monthlyExpenses });
    } catch (error) {
      console.error('Error getting monthly expenses:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = ExpenseController;
