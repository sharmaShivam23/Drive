
// const express = require('express');
// const cors = require("cors");
// const session = require('express-session');
// const cookieParser = require('cookie-parser');
// require('dotenv').config();
// const fileUpload = require('express-fileupload');
// const xss = require("xss-clean");
// const helmet = require("helmet");
// const hpp = require("hpp");
// const mongoSanitize = require('express-mongo-sanitize');
// const compression = require('compression');
// const csrf = require("csurf");

// const app = express();


// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrc: ["'self'", "https://www.google.com"],
//       imgSrc: ["'self'", "data:", "https:"],
//       connectSrc: ["'self'"],
//       fontSrc: ["'self'"],
//       objectSrc: ["'none'"],
//       mediaSrc: ["'self'"],
//       frameSrc: ["'none'"],
//     },
//   },
//   crossOriginEmbedderPolicy: false,
// }));

// // Trust proxy for proper IP detection
// app.set('trust proxy', 1);

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));
// const csrfProtection = csrf({
//   cookie: {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production', // true in production
//     sameSite: 'strict'
//   }
// });

// // Apply CSRF middleware AFTER cookie-parser and body-parser
// app.use(csrfProtection);


// app.get("/api/get-csrf-token", (req, res) => {
//   res.cookie("XSRF-TOKEN", req.csrfToken(), {
//     sameSite: "strict",
//     secure: process.env.NODE_ENV === "production",
//   });
//   res.status(200).json({ message: "CSRF token sent" });
// });

// // Cookie parser with security options
// app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));

// // Security middleware
// app.use(mongoSanitize());
// app.use(compression());
// app.use(xss());
// app.use(hpp());

// // CORS configuration with enhanced security
// app.use(cors({
//   origin: [
//     "https://new-cccc.vercel.app",
//     "https://www.cccakgec.live"
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   exposedHeaders: ['Content-Range', 'X-Content-Range'],
//   maxAge: 86400, 
// }));


// app.use(session({
//   secret: process.env.SESSION_SECRET || 'your-session-secret',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000, 
//     sameSite: 'strict'
//   }
// }));


// app.use((err, req, res, next) => {
//   console.error('Global error:', err);
//   res.status(500).json({
//     success: false,
//     message: process.env.NODE_ENV === 'production' 
//       ? 'Internal server error' 
//       : err.message
//   });
// });


// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'OK', 
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime()
//   });
// });

// // Routes
// const routes = require("./routes/Routes");
// app.use("/api/register", routes);

// // Database connection
// const database = require('./config/database');
// database();

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM received, shutting down gracefully');
//   process.exit(0);
// });

// process.on('SIGINT', () => {
//   console.log('SIGINT received, shutting down gracefully');
//   process.exit(0);
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
// });



const express = require('express');
const cors = require("cors");
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const xss = require("xss-clean");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const csrf = require("csurf");
const path = require("path");

const app = express();

// Trust proxy for secure cookies when behind a proxy (like on Vercel)
app.set('trust proxy', 1);

// Security: Helmet CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https://www.google.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://www.google.com"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));

// CSRF protection (should come after cookieParser & bodyParser)
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});
app.use(csrfProtection);

// CSRF token endpoint (frontend fetches token from here)
app.get("/api/get-csrf-token", (req, res) => {
  res.cookie("XSRF-TOKEN", req.csrfToken(), {
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "CSRF token sent" });
});

// File upload middleware (optional)
app.use(fileUpload({ useTempFiles: true }));

// Security middlewares
app.use(mongoSanitize());
app.use(compression());
app.use(xss());
app.use(hpp());

// CORS setup for frontend origins
app.use(cors({
  origin: [
    "https://new-cccc.vercel.app",
    "https://www.cccakgec.live"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'strict'
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Main Routes
const routes = require("./routes/Routes");
app.use("/api/register", routes);

// Database connection
const database = require('./config/database');
database();

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
