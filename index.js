

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
// const path = require("path");

// const app = express();

// // Trust proxy for secure cookies behind Render/Vercel
// app.set('trust proxy', 1);

// // CORS middleware (must come before routes & csrf)
// app.use(cors({
//   origin: [
//     "https://new-cccc.vercel.app",
//     "https://www.cccakgec.live",
//     "http://localhost:5173",
//     "http://localhost:5174"
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-XSRF-TOKEN'],
//   exposedHeaders: ['Content-Range', 'X-Content-Range'],
//   maxAge: 86400,
// }));

// // Security headers
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https:"],
//       scriptSrc: ["'self'", "https://www.google.com"],
//       imgSrc: ["'self'", "data:", "https:"],
//       connectSrc: ["'self'", "https://www.google.com"],
//       fontSrc: ["'self'", "https:"],
//       objectSrc: ["'none'"],
//       mediaSrc: ["'self'"],
//       frameSrc: ["'none'"],
//     },
//   },
//   crossOriginEmbedderPolicy: false,
// }));

// // Request body parsers
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Cookie parser (required for CSRF)
// app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));

// // Session config (required for CSRF)
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'your-session-secret',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000,
//     sameSite: 'lax' // Changed from 'strict' to 'lax' for better compatibility
//   }
// }));

// // CSRF protection configuration
// // const csrfProtection = csrf({
// //   cookie: {
// //     httpOnly: true,
// //     secure: process.env.NODE_ENV == 'production',
// //     sameSite: 'lax' // Changed from 'strict' to 'lax'
// //   }
// // });

// // // Public route to get CSRF token (before applying CSRF protection to all routes)
// // app.get("/api/get-csrf-token", (req, res) => {
// //   try {
// //     const token = req.csrfToken();
// //     res.cookie("XSRF-TOKEN", token, {
// //       sameSite: "lax", // Changed from 'strict' to 'lax'
// //       secure: process.env.NODE_ENV === "production",
// //       httpOnly: false // Must be accessible from frontend JS
// //     });
// //     res.status(200).json({ 
// //       success: true,
// //       message: "CSRF token sent", 
// //       csrfToken: token 
// //     });
// //   } catch (error) {
// //     console.error('CSRF token generation error:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: "Failed to generate CSRF token" 
// //     });
// //   }
// // });

// // // Apply CSRF protection to all other routes
// // app.use(csrfProtection);

// // // File upload middleware
// app.use(fileUpload({ useTempFiles: true }));

// // // Other security middlewares
// // app.use(mongoSanitize());
// // app.use(compression());
// app.use(xss());
// app.use(hpp());

// // Health check route
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime()
//   });
// });

// // Main Routes
// const routes = require("./routes/Routes");
// app.use("/api/register", routes);

// // Database connect
// const database = require('./config/database');
// database();

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Global error:', err);
  
//   // Handle CSRF token errors specifically
//   if (err.code === 'EBADCSRFTOKEN') {
//     return res.status(403).json({
//       success: false,
//       message: 'CSRF token validation failed. Please refresh the page and try again.'
//     });
//   }
  
//   res.status(err.status || 500).json({
//     success: false,
//     message: process.env.NODE_ENV === 'production'
//       ? 'Internal server error'
//       : err.message,
//     ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
//   });
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM received, shutting down gracefully');
//   process.exit(0);
// });
// process.on('SIGINT', () => {
//   console.log('SIGINT received, shutting down gracefully');
//   process.exit(0);
// });

// // Start the server
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
// });


const express = require('express');
const cors = require("cors");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
require('dotenv').config();
const path = require("path");
const csrf = require('csurf');


const app = express();


app.set('trust proxy', 1);


app.use(cors({
  origin: [
    "https://new-ccc.vercel.app",
    "https://www.cccakgec.live",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With' , 'X-CSRF-Token'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
}));


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


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  }
}));
app.use(fileUpload({ useTempFiles: true }));

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());
app.use(cookieParser(process.env.COOKIE_SECRET || 'cccckey'));

//csrf
// const csrfProtection = csrf({ cookie: true  , secure: true , sameSite: 'strict'});
// const csrfProtection = csrf({
//   cookie: {
//     httpOnly: false, //js cant read
//     secure: true,   //only for https
//     // secure: process.env.NODE_ENV === 'production',   //only for https
//     // sameSite: 'strict' 
//      sameSite: 'None'
//   }
// });
// // app.get('/csrf-token', csrfProtection, (req, res) => {
// //   res.json({ csrfToken: req.csrfToken() , message : "CSRF token getting successfully" });
// app.use(csrfProtection);

const csrfProtection = csrf({ cookie: {
  httpOnly: false,
  secure: true, 
  sameSite: "None",
}
 });
app.use(csrfProtection);
app.get("/csrf-token", (req, res) => {
  const token = req.csrfToken();
  res.cookie("XSRF-TOKEN", token, {
    httpOnly: false,
    secure: true,
    sameSite: 'None' 
  });
  res.status(200).json({ csrfToken: token, message: "CSRF token sent successfully" });
});






app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const routes = require("./routes/Routes");
app.use("/api/register", csrfProtection, routes);


const database = require('./config/database');
database();

app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    // message: process.env.NODE_ENV === 'production'
    //   ? 'Internal server error'
    //   : err.message,
    // ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    message : err.message
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
