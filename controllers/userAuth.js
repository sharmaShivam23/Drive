const User = require('../model/userSchema');
const sendEmail = require('../Tools/sendEmail');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
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
  const studentNumberRegex = /^24\d{5,6}$/;
  return studentNumberRegex.test(studentNumber.toString());
};




exports.signUp = async (req, res) => {
  try {
    // const { name, email, phoneNumber, studentNumber, branch, section, gender, residence } = req.body;
    // const { name, email, phoneNumber, studentNumber, branch, unstopId, gender, residence} = req.body;
    const { name, email, phoneNumber, studentNumber, branch, unstopId, gender, residence, recaptchaValue} = req.body;



    if (!name || !email || !phoneNumber || !studentNumber || !branch  || !gender || !residence) {
      return res.status(400).json({ success: false, message: "All details are required" });
    }

    
 
 if (!name || name.trim().length < 3 || name.trim().length > 20 || !/^[a-zA-Z\s]+$/.test(name)) {
  return res.status(400).json({ 
    success: false, 
    message: "Invalid Name"
  });
}
    
    const expectedEnding = `${studentNumber}@akgec.ac.in`;

    // const startsWithAlphabets = /^[a-zA-Z]+/.test(email);
    const startsWithAlphabets = /^[a-zA-Z]{3,}/.test(email);

    
    if (!startsWithAlphabets || !email.endsWith(expectedEnding)) {
      return res.status(400).json({
        success: false,
        message: "Invalid College Email",
      });
    }
    

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }

    if (!validateStudentNumber(studentNumber)) {
      return res.status(400).json({ success: false, message: "Invalid student number format" });
    }


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

    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    
    const existStudentNumber = await User.findOne({ studentNumber });
    if (existStudentNumber) {
      return res.status(400).json({ success: false, message: "Student Number already registered" });
    }


    
    const userCreate = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber,
      studentNumber,
      branch: branch.toUpperCase(),
      unstopId: unstopId,
      gender: gender.toLowerCase(),
      residence: residence.trim(),
    });

  
   
    try {
  const templatePath = path.join(__dirname, '../Templates/signup.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('Signup template not found');
  }
  const signupTemplate = fs.readFileSync(templatePath, 'utf8');
  const subject = "Welcome to Testing!";
  const text = `Hi ${name}, Congratulations! Registration successful.`;
  const html = signupTemplate.replace(/{{\s*name\s*}}/g, name);
  await sendEmail(email, subject, text, html);
} catch (emailError) {
  console.error('Email sending error:', {
    message: emailError.message,
    stack: emailError.stack,
  });
}
    
    // const templatePath = path.join(__dirname, '../Templates/signup.html');

    // const signupTemplate = fs.readFileSync(templatePath, 'utf8');
    // const subject = "Welcome to Testing!";
    // const text = `Hi ${name}, Congratulations! Registration successful.`;
    // const html  = signupTemplate.replace(/{{\s*name\s*}}/g, name)

    // const isEmailSent = await sendEmail(email, subject, text, html);

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
}
