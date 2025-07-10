const candidateReferal = require('../models/candidateReferal.model');
const { userModel } = require('../models/user.model');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const signup = async (req,res) => {
    
    try {
        const saltRounds=10
        const {email,password}= req.body
        const hash = bcrypt.hash(password, saltRounds, async function(err,hash){
            if(err)
                res.status(500).json({Error:"error in signup",err})
            else{
                 await  userModel.create({...req.body,password:hash})
                console.log("signup successFull",hash)
                res.status(200).json({message:"signup successFull"})
            }
        });

    } catch (error) {
        res.status(500).json({Error:"error in signup",error})
        console.log(error)
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role:user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}


const ProfileData= async (req, res) => {
    try {
        
        const token = req.header('x-auth-token');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.json(user);
        } catch (error) {
            res.status(401).json({ message: 'Token is not valid' });
        }
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}
const submitReferral = async (req, res) => {
  try {
    const { name, email, phone, jobTitle, resume } = req.body;
    const userId = req.user.id; 

    if (!name || !email || !phone || !jobTitle) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const newReferral = await candidateReferal.create({
      name,
      email,
      phone,
      jobTitle,
      resume,
      referredBy: userId
    });

    await userModel.findByIdAndUpdate(userId, {
      $push: { referrals: newReferral._id }
    });

    res.status(201).json({
      message: 'Referral submitted successfully',
      referral: newReferral
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while submitting referral' });
     console.error("Referral submission error:", error);
  }
};



const myReferals = async (req, res) => {
  try {
    
    const referrals = await candidateReferal.find({ referredBy: req.user._id });
    res.status(200).json(referrals);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch referrals' });
  }
}

//ADMIN ROUTES
const fetchReferalsAdmin = async (req, res) => {
  try {
    const referrals = await candidateReferal.find().populate('referredBy', 'name email');
    res.status(200).json(referrals);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch referrals' });
  }
}


const statusUpdate = async (req, res) => {
  try {
    const { status }=req.body;

    const updatedReferral = await candidateReferal.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.status(200).json(updatedReferral);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' });
  }
}
module.exports={submitReferral,signup,login,ProfileData, myReferals,fetchReferalsAdmin,statusUpdate}