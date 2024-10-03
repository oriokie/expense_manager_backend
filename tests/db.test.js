const { MongoClient } = require('mongodb');
const DBClient = require('../src/config/db');

// Mocking MongoClient with the necessary methods
jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(true),
      db: jest.fn().mockReturnValue({
        collection: jest.fn(),
      }),
      isConnected: jest.fn().mockReturnValue(true),
    })),
  };
});

describe('DBClient', () => {
  let dbConnection;

  beforeEach(() => {
    dbConnection = new DBClient();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await dbConnection.close();
  });

  it('should connect to the MongoDB database', async () => {
    await dbConnection.connect();
    expect(dbConnection.client.connect).toHaveBeenCalledTimes(1);
    expect(dbConnection.client.db).toHaveBeenCalledWith('expenses');
  });

  it('should return true when connected', async () => {
    await dbConnection.connect();
    expect(dbConnection.isConnected()).toBe(true);
  });

  it('should return false when not connected', () => {
    dbConnection.client.isConnected.mockReturnValue(false);
    expect(dbConnection.isConnected()).toBe(false);
  });
});
