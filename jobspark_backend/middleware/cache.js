/**
 * Redis caching middleware
 * Gracefully disabled if Redis is not running — no repeated warnings
 */
const logger = require("../utils/logger");
let redisClient = null;
let redisAttempted = false;

const initRedis = async () => {
  if (redisAttempted) return;
  redisAttempted = true;
  try {
    const { createClient } = require("redis");
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: { connectTimeout: 2000, reconnectStrategy: false },
    });
    redisClient.on("error", () => {}); // silent
    await redisClient.connect();
    logger.info("Redis connected — caching enabled");
  } catch (e) {
    redisClient = null; // caching disabled silently
  }
};

initRedis();

const cache =
  (ttlSeconds = 60) =>
  async (req, res, next) => {
    if (!redisClient?.isOpen) return next();
    const key = `cache:${req.originalUrl}`;
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cached));
      }
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        redisClient
          .setEx(key, ttlSeconds, JSON.stringify(data))
          .catch(() => {});
        return originalJson(data);
      };
      next();
    } catch (e) {
      next();
    }
  };

const invalidate = async (pattern) => {
  if (!redisClient?.isOpen) return;
  try {
    const keys = await redisClient.keys(`cache:${pattern}*`);
    if (keys.length) await redisClient.del(keys);
  } catch (e) {}
};

module.exports = { cache, invalidate };
