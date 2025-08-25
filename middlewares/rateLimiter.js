
const rateLimit = require('express-rate-limit');

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, 
  message: {
    success: false,
    message: "Too many registration attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skipFailedRequests: false, 
  keyGenerator: (req) => {
    return req.ip + ':' + (req.headers['user-agent'] || 'unknown');
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many registration attempts. Please try again after 15 minutes.",
      retryAfter: Math.ceil(15 * 60 / 60) 
    });
  }
});

// Stricter limiter for suspicious activity
const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 4, 
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
  windowMs: 24 * 60 * 60 * 1000, 
  max: 200, 
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
      retryAfter: Math.ceil(24 * 60 * 60 / 60) 
    });
  }
});

exports.registrationLimiter = registrationLimiter;
exports.strictLimiter = strictLimiter;
exports.dailyLimiter = dailyLimiter;

