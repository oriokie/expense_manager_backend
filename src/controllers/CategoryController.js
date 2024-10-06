/**
 * Module for creating categories
 */

const dbClient = require('../config/db');

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
      const existingCategories = await categoriesCollection.find().toArray();

      if (existingCategories.length > 0) {
        return res.status(400).json({ error: 'Categories already exist' });
      }

      // insert template categories
      await categoriesCollection.insertMany(CategoryController.templateCategories);

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
      const categories = await categoriesCollection.find().toArray();

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
      const existingCategory = await categoriesCollection.findOne({ name });

      if (existingCategory) {
        return res.status(400).json({ error: 'Category already exists' });
      }

      const newCategory = {
        name,
        description,
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
      const categoriesCollection = await dbClient.getCategoriesCollection();
      const deletedCategory = await categoriesCollection.findOneAndDelete({ _id: ObjectId(id) });

      if (!deletedCategory.value) {
        return res.status(404).json({ error: 'Category not found' });
      }

      return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error removing category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = CategoryController;
