/**
 * Module for creating categories
 */

const dbClient = require('../config/db');
const { ObjectId } = require('mongodb');

/**
 * Class representing a category controller
 */
class CategoryController {
  // template categories
  static templateCategories = [
    { name: 'Food', description: 'Expenses related to food and dining.' },
    { name: 'Transportation', description: 'Expenses related to transport.' },
    { name: 'Housing', description: 'Expenses for housing or rent.' },
    { name: 'Utilities', description: 'Expenses for utilities such as water and electricity' },
    { name: 'Health', description: 'Medical expenses and health-related costs.' },
    { name: 'Entertainment', description: 'Expenses for entertainment and leisure' },
    { name: 'Groceries', description: 'Expenses for purchasing groceries.' },
    { name: 'Education', description: 'Expenses for educational purposes.' },
    { name: 'Clothing', description: 'Expenses for clothing and personal items.' },
    { name: 'Miscellaneous', description: 'Other miscellaneous expenses.' },
  ];

  /**
   * Method to create the default categories
   */
  static async seedCategories(req, res) {
    try {
      const categoriesCollection = await dbClient.getCategoriesCollection();

      // check if categories exist
      const existingCategories = await categoriesCollection
        .find({ userId: req.user._id })
        .toArray();

      if (existingCategories.length > 0) {
        return res.status(400).json({ error: 'Categories already exist' });
      }

      const userCategories = CategoryController.templateCategories.map((category) => ({
        ...category,
        userId: req.user._id,
      }));

      // insert template categories
      await categoriesCollection.insertMany(userCategories);

      return res.status(201).json({ message: 'Categories created successfully' });
    } catch (error) {
      console.error('Error seeding categories:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Method to get all categories
   */
  static async getCategories(req, res) {
    try {
      const categoriesCollection = await dbClient.getCategoriesCollection();
      const categories = await categoriesCollection.find({ userId: req.user._id }).toArray();
      return res.status(200).json({ categories });
    } catch (error) {
      console.error('Error getting categories:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Method to add a new category
   */
  static async addCategory(req, res) {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }
      if (!description) {
        return res.status(400).json({ error: 'Missing description' });
      }

      const categoriesCollection = await dbClient.getCategoriesCollection();
      const existingCategory = await categoriesCollection.findOne({ name, userId: req.user._id });

      if (existingCategory) {
        return res.status(400).json({ error: 'Category already exists' });
      }

      const newCategory = {
        name,
        description,
        userId: req.user._id,
      };

      await categoriesCollection.insertOne(newCategory);

      return res.status(201).json({ message: 'Category created successfully' });
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Method to remove a category
   */
  static async removeCategory(req, res) {
    const { id } = req.params;

    try {
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      const categoriesCollection = await dbClient.getCategoriesCollection();
      const deletedCategory = await categoriesCollection.findOneAndDelete({
        _id: new ObjectId(id),
        userId: req.user._id,
      });

      if (!deletedCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }

      return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error removing category:', error.message, error.stack);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Method to update a category
   */
  static async updateCategory(req, res) {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!description) {
      return res.status(400).json({ error: 'Missing description' });
    }

    try {
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      const categoriesCollection = await dbClient.getCategoriesCollection();
      const result = await categoriesCollection.updateOne(
        { _id: new ObjectId(id), userId: req.user._id },
        { $set: { name, description } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      return res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
      console.error('Error updating category:', error.message, error.stack);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = CategoryController;
