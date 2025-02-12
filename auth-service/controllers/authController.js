const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailSender');

// const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Convert role to lowercase to match schema
    const normalizedRole = role.toLowerCase();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ 
      email, 
      password, 
      role: normalizedRole 
    });
    await user.save();

    // Generate token for immediate login after registration
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send welcome email
    const subject = 'Welcome to Our Platform';
    const body = `<p>Hi,</p><p>Thank you for signing up!</p>`;
    await sendEmail(email, subject, body);

    // Return structure matching frontend expectations
    res.status(201).json({
      success: true,
      data: {
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error registering user' 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate an access token only (no refresh token)
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Short-lived token
    );

    // Return user data along with token
    res.json({
      success: true,
      data: {
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error logging in' 
    });
  }
};

// Add this function if you need token validation
exports.validateToken = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ valid: true, payload });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
};

