const { MongoClient } = require('mongodb');
const dbClient = require('../src/config/db');
// Mocking MongoClient with the necessary methods
jest.mock('mongodb', () => {
  const mClient = {
    connect: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    db: jest.fn().mockReturnValue({
      collection: jest.fn(),
    }),
    isConnected: jest.fn().mockReturnValue(true),
  };
  return {
    MongoClient: jest.fn(() => mClient),
  };
});

describe('DBClient', () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = new MongoClient();
    dbClient.client = mockClient; // Ensure client is always initialized
  });

  afterEach(async () => {
    if (dbClient.isConnected()) {
      await dbClient.close();
    }
  });

  it('should connect to the MongoDB database', async () => {
    await dbClient.connect();
    expect(dbClient.client.connect).toHaveBeenCalledTimes(1);
    expect(dbClient.db).toBeDefined();
  });

  it('should return true when connected', async () => {
    await dbClient.connect();
    expect(dbClient.isConnected()).toBe(true);
  });

  it('should return false when not connected', () => {
    dbClient.client.isConnected.mockReturnValue(false);
    expect(dbClient.isConnected()).toBe(false);
  });

  it('should close the MongoDB connection', async () => {
    await dbClient.connect();
    await dbClient.close();
    // Check if client is not null before accessing its methods
    if (dbClient.client) {
      expect(dbClient.client.close).toHaveBeenCalledTimes(1);
    }
    expect(dbClient.client).toBeNull();
    expect(dbClient.db).toBeNull();
  });
});
