/**
 * Tests for DatabaseConnection using MongoClient
 */
const { MongoClient } = require('mongodb');
const DBClient = require('../src/config/db');

// Mock mongodb to avoid connecting to a real database
jest.mock('mongodb');

describe('DBClient', () => {
  let dbConnection;
  const mockUri = 'mongodb://localhost:27017/testdb';

  beforeEach(() => {
    dbConnection = new DBClient(mockUri);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await dbConnection.close();
  });

  it('should create a new MongoClient', () => {
    expect(MongoClient).toHaveBeenCalledTimes(1);
    expect(MongoClient).toHaveBeenCalledWith(mockUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  it('should connect to the database', async () => {
    await dbConnection.connect();
    expect(dbConnection.client.connect).toHaveBeenCalledTimes(1);
  });

  it('should close the database connection', async () => {
    await dbConnection.close();
    expect(dbConnection.client.close).toHaveBeenCalledTimes(1);
  });
});
