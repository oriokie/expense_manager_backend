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
      const { amount, description, date, categoryId, isRecurring, recurringPeriod } = req.body;
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
        isRecurring: isRecurring || false,
        recurringPeriod: recurringPeriod || null,
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
}

module.exports = ExpenseController;
