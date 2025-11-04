
const express = require('express');
const cors = require("cors");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const bcrypt = require('bcrypt');
require('dotenv').config();
const serverless = require("serverless-http");
// const csrf = require('csurf');

const app = express();


app.set('trust proxy', 1);



app.use(cors({
  origin: [
    "https://new-ccc.vercel.app",
    "https://www.cccakgec.live",
    "https://www.cccakgec.in",
    // "http://localhost:5173",
    // "http://localhost:5174"
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


app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());
app.use(cookieParser(process.env.COOKIE_SECRET || 'cccckey'));

// const csrfProtection = csrf({ cookie: {
//   httpOnly: false,
//   secure: true, 
//   sameSite: "None",
// }
//  });
// app.use(csrfProtection);
// app.get("/csrf-token", (req, res) => {
//   const token = req.csrfToken();
//   res.cookie("XSRF-TOKEN", token, {
//     // httpOnly: false,
//     // secure: true,
//     // sameSite: 'None' 
//     httpOnly: false,
//    secure: process.env.NODE_ENV === 'production',
//   sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
//   });
//   res.status(200).json({ csrfToken: token, message: "CSRF token sent successfully" });
// });



app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const routes = require("./routes/Routes");
app.use("/api/register",   routes);
// app.use("/api/register",  csrfProtection,  routes);


const database = require('./config/database');
database();

app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
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

