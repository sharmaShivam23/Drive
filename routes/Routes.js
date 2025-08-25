const express = require('express');
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { signUp } = require("../controllers/userAuth");
const {limiter} = require("../controllers/userAuth");
const { securityMiddleware } =  require('../middlewares/securityMiddleware');
const { dailyLimiter , strictLimiter , registrationLimiter } =  require('../middlewares/rateLimiter');


router.post("/Drive", 
  // dailyLimiter,        
  // strictLimiter,      
  // registrationLimiter, 
  limiter,
  securityMiddleware,  
  signUp
);

module.exports = router
