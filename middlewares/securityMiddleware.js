
// Security middleware to detect form-based attacks
const securityMiddleware = (req, res, next) => {
  const { body } = req;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  // Check request body for suspicious content
  const bodyString = JSON.stringify(body);
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(bodyString)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input detected"
      });
    }
  }

  // Check for excessive data
  if (bodyString.length > 10000) { // 10KB limit
    return res.status(413).json({
      success: false,
      message: "Request too large"
    });
  }

  // Check for rapid successive requests (additional protection)
  const clientKey = req.ip + ':' + (req.headers['user-agent'] || 'unknown');
  const now = Date.now();
  
  if (!req.session.lastRequest) {
    req.session.lastRequest = {};
  }
  
  if (req.session.lastRequest[clientKey] && 
      (now - req.session.lastRequest[clientKey]) < 1000) { // 1 second minimum
    return res.status(429).json({
      success: false,
      message: "Please wait before making another request"
    });
  }
  
  req.session.lastRequest[clientKey] = now;
  next();
};

exports.securityMiddleware = securityMiddleware;

