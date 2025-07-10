require('dotenv').config()
const jwt = require("jsonwebtoken");
const { userModel } = require('../models/user.model');


//protect
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
 // console.log(authHeader)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    const user = await userModel.findById(decoded.id).select('-password');
   // console.log(user)
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    //req.user = { id: user._id };
    req.user = user;

    next(); 
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports={protect}