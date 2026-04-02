// PlatformSDN/backend/middleware/perffrance.js - API performance monitoring
const performanceData = new Map();

function performanceMiddleware(req, res, next) {
  const startTime = Date.now();
  const method = req.method;
  const path = req.path;

  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const key = `${method} ${path}`;

    if (!performanceData.has(key)) {
      performanceData.set(key, {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        avgTime: 0,
      });
    }

    const stats = performanceData.get(key);
    stats.count++;
    stats.totalTime += duration;
    stats.minTime = Math.min(stats.minTime, duration);
    stats.maxTime = Math.max(stats.maxTime, duration);
    stats.avgTime = Math.round(stats.totalTime / stats.count);

    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      console.warn(
        `[Perf Warn] ${key} took ${duration}ms (limit: 1000ms)`
      );
    }

    return originalJson(data);
  };

  next();
}

function getPerformanceStats() {
  const stats = {};

  for (const [endpoint, data] of performanceData.entries()) {
    stats[endpoint] = {
      requests: data.count,
      avgTime: data.avgTime,
      minTime: data.minTime === Infinity ? 0 : data.minTime,
      maxTime: data.maxTime,
    };
  }

  return stats;
}

function clearPerformanceStats() {
  performanceData.clear();
}

module.exports = {
  performanceMiddleware,
  getPerformanceStats,
  clearPerformanceStats,
};
