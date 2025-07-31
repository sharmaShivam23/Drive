

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

// Trust proxy for secure cookies behind Render/Vercel
app.set('trust proxy', 1);

// ✅ CORS middleware (must come before routes & csrf)
app.use(cors({
  origin: [
    "https://new-cccc.vercel.app",
    "https://www.cccakgec.live",
     "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With' , 'X-XSRF-TOKEN'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
}));

// app.options('*', cors()); 


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

//  Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//  Cookie parser (required for CSRF)
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));

//  CSRF protection (must come after cookieParser)
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});
app.use(csrfProtection);


app.get("/api/get-csrf-token", (req, res) => {
  const token = req.csrfToken();
  res.cookie("XSRF-TOKEN", token, {
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({  message: "CSRF token sent" });
});


app.use(fileUpload({ useTempFiles: true }));

//  Other security middlewares
app.use(mongoSanitize());
app.use(compression());
app.use(xss());
app.use(hpp());

//  Session config (if you’re using sessions)
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

//  Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

//  Main Routes
const routes = require("./routes/Routes");
app.use("/api/register", routes);

//  Database connect
const database = require('./config/database');
database();

// //  Global error handler
// app.use((err, req, res, next) => {
//   console.error('Global error:', err);
//   res.status(500).json({
//     success: false,
//     message: process.env.NODE_ENV === 'production'
//       ? 'Internal server error'
//       : err.message
//   });
// });

app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack); // logs full stack
  res.status(500).json({
    success: false,
    message: err.message,
    stack: err.stack
  });
});


//  Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

//  Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
