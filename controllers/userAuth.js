const User = require('../model/userSchema');
const sendEmail = require('../Tools/sendEmail');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    message: "Too many registration attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});
exports.limiter = limiter;



const validateStudentNumber = (studentNumber) => {
  const studentNumberRegex = /^24\d{4,9}$/;
  return studentNumberRegex.test(studentNumber.toString());
};




exports.signUp = async (req, res) => {
  try {
    const { name, email, phoneNumber, studentNumber, branch, section, gender, residence } = req.body;
    // const { name, email, phoneNumber, studentNumber, branch, section, gender, residence, recaptchaValue } = req.body;

   
    
    // Enhanced input validation
    if (!name || !email || !phoneNumber || !studentNumber || !branch || !section || !gender || !residence) {
      return res.status(400).json({ success: false, message: "All details are required" });
    }

    // Name validation
    if (name.length < 3 || name.length > 50) {
      return res.status(400).json({ success: false, message: "Name must be between 3 and 50 characters" });
    }
    
    const expectedDomain = "@akgec.ac.in";

// Check if email contains student number and ends with @akgec.ac.in
if (!email.includes(studentNumber) || !email.endsWith(expectedDomain)) {
  return res.status(400).json({
    success: false,
    message: `Invalid Email`
  });
}


   
    // Phone number validation
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }

    // Student number validation
    if (!validateStudentNumber(studentNumber)) {
      return res.status(400).json({ success: false, message: "Invalid student number format" });
    }

      
    // reCAPTCHA validation
    if (!recaptchaValue) {
      return res.status(400).json({ success: false, message: "reCAPTCHA verification required" });
    }

    try {
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
      const secretKey = process.env.SECRET_KEY;
      
      if (!secretKey) {
        console.error('SECRET_KEY not configured');
        return res.status(500).json({ success: false, message: "Server configuration error" });
      }

      const recaptchaResponse = await axios.post(verifyUrl, null, {
        params: {
          secret: secretKey,
          response: recaptchaValue,
        },
        timeout: 5000, 
      });

      if (!recaptchaResponse.data.success) {
        return res.status(400).json({ success: false, message: "reCAPTCHA verification failed" });
      }
    } catch (recaptchaError) {
      console.error('reCAPTCHA verification error:', recaptchaError.message);
      return res.status(500).json({ success: false, message: "reCAPTCHA verification error" });
    }

    // Check for existing email
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Create user
    const userCreate = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber,
      studentNumber,
      branch: branch.toUpperCase(),
      section: section.toUpperCase(),
      gender: gender.toLowerCase(),
      residence: residence.trim(),
    });

    // Send welcome email
    try {
      const templatePath = path.join(__dirname, '../Templates/signup.html');
      if (!fs.existsSync(templatePath)) {
        console.error('Signup template not found');
        // Don't fail registration if email template is missing
      } else {
        const signupTemplate = fs.readFileSync(templatePath, 'utf8');
        const subject = "Welcome to Cloud Computing Cell!";
        const text = `Hi ${name}, Congratulations! Registration successful.`;
        const html = signupTemplate.replace(/{{\s*name\s*}}/g, name);

        await sendEmail(email, subject, text, html);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError.message);
      // Don't fail registration if email fails
    }

    res.status(200).json({
      success: true,
      message: "Registration successful for NIMBUS 2.0",
    });

  } catch (error) {
    console.error("Error during signUp:", error.message);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
};
