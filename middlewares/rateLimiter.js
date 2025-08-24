
const rateLimit = require('express-rate-limit');

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, //  50 attempts per 15min
  message: {
    success: false,
    message: "Too many registration attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, //  successful registrations
  skipFailedRequests: false, // Count failed attempts to prevent abuse
  keyGenerator: (req) => {
    // Use IP + User-Agent for better identification
    return req.ip + ':' + (req.headers['user-agent'] || 'unknown');
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many registration attempts. Please try again after 15 minutes.",
      retryAfter: Math.ceil(15 * 60 / 60) // minutes
    });
  }
});

// Stricter limiter for suspicious activity
const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1, 
  message: {
    success: false,
    message: "Suspicious activity detected. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Suspicious activity detected. Please try again after 5 minutes.",
      retryAfter: Math.ceil(5 * 60 / 60)
    });
  }
});

// Daily limit per IP to prevent mass registration attacks
const dailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 200, // 200 attempts per day per IP
  message: {
    success: false,
    message: "Daily registration limit exceeded. Please try again tomorrow."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Daily registration limit exceeded. Please try again tomorrow.",
      retryAfter: Math.ceil(24 * 60 * 60 / 60) // hours
    });
  }
});

exports.registrationLimiter = registrationLimiter;
exports.strictLimiter = strictLimiter;
exports.dailyLimiter = dailyLimiter;

