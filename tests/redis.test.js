import redis from 'redis';
import { promisify } from 'util';
import redisClient from '../src/config/redis';

jest.mock('redis', () => {
  const mClient = {
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };
  return { createClient: jest.fn(() => mClient) };
});

describe('RedisClient', () => {
  let client;

  beforeAll(() => {
    client = redis.createClient();
  });

  it('should initialize the Redis client', () => {
    expect(redis.createClient).toHaveBeenCalledTimes(2);
    expect(client.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('should get the value of a key', async () => {
    client.get.mockImplementation((key, callback) => {
      callback(null, 'value');
    });
    const value = await redisClient.get('key');
    expect(value).toBe('value');
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
