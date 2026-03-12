const Redis = require('ioredis');
const logger = require('../utils/logger');

function createRedisClient(name = 'redis') {
  const client = new Redis({
    host:     process.env.REDIS_HOST     || 'localhost',
    port:     parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      if (times > 10) {
        logger.error(`${name}: max retries reached, giving up`);
        return null;
      }
      const delay = Math.min(times * 200, 3000);
      logger.warn(`${name}: reconnecting in ${delay}ms (attempt ${times})`);
      return delay;
    },
    lazyConnect: true,
  });

  client.on('connect',   () => logger.info(`${name}: connected`));
  client.on('error',  (err) => logger.error(`${name}: error`, { error: err.message }));

  return client;
}

// We need two separate clients for pub/sub
const pubClient  = createRedisClient('redis-pub');
const subClient  = createRedisClient('redis-sub');
const cacheClient = createRedisClient('redis-cache');

async function connectRedis() {
  await Promise.all([
    pubClient.connect(),
    subClient.connect(),
    cacheClient.connect(),
  ]);
}

module.exports = { pubClient, subClient, cacheClient, connectRedis };
