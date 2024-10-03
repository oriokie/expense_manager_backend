import redisClient from '../src/config/redis';
import redis from 'redis';
import { promisify } from 'util';

// Mocking redis and promisify
jest.mock('redis', () => {
  const mClient = {
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };
  return {
    createClient: jest.fn(() => mClient),
  };
});

jest.mock('util', () => ({
  promisify: jest.fn((fn) => fn),
}));

describe('RedisClient', () => {
  let client;

  beforeEach(() => {
    jest.clearAllMocks();
    client = redisClient.client;
  });

  it('should initialize the Redis client', () => {
    expect(redis.createClient).toHaveBeenCalledTimes(1);
    expect(client.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('should return true when the client is connected', () => {
    expect(redisClient.isAlive()).toBe(true);
  });

  it('should return false when the client is not connected', () => {
    client.on.mockImplementationOnce((event, callback) => {
      if (event === 'error') {
        callback(new Error('Test error'));
      }
    });
    client.on('error', () => {});
    expect(redisClient.isAlive()).toBe(false);
  });

  it('should get the value of a key', async () => {
    client.get.mockImplementation((key, callback) => {
      callback(null, 'value');
    });
    const value = await redisClient.get('key');
    expect(value).toBe('value');
    expect(client.get).toHaveBeenCalledWith('key', expect.any(Function));
  });

  it('should set a key-value pair with expiration', async () => {
    client.set.mockImplementation((key, value, mode, duration, callback) => {
      callback(null, 'OK');
    });
    await redisClient.set('key', 'value', 10);
    expect(client.set).toHaveBeenCalledWith('key', 'value', 'EX', 10, expect.any(Function));
  });

  it('should delete a key', async () => {
    client.del.mockImplementation((key, callback) => {
      callback(null, 1);
    });
    await redisClient.del('key');
    expect(client.del).toHaveBeenCalledWith('key', expect.any(Function));
  });
});
