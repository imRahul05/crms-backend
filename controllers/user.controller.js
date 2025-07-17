const candidateReferal = require("../models/candidateReferal.model");
const { userModel } = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/mailer");
require("dotenv").config();
const FRONTEND_URL = process.env.FRONTEND_URL;
const JWT_SECRET = process.env.JWT_SECRET
const nodemailer = require("nodemailer");
// const signup = async (req, res) => {
//   try {
//     const saltRounds = 10;
//     const { name,email, password ,role} = req.body;
//       const isUser = await userModel.findOne({ email: email })
//     if (isUser) {
//       return res.status(409).json({ message: "User already registered. Please sign in to continue." })
//     }
//     const hash = bcrypt.hash(password, saltRounds, async function (err, hash) {
//       if (err) res.status(500).json({ Error: "error in signup", err });
//       else {
//         await userModel.create({ ...req.body, password: hash });
//         console.log("signup successFull", hash);
//         await sendMail(
//           email,
//           "Welcome to Our App!",
//           `Hello ${name},\n\nThanks for registering as a ${role}. We're happy to have you!`
//         );
//         res.status(200).json({ message: "signup successFull" });
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ Error: "error in signup", error });
//     console.log(error);
//   }
// };
//Common function to handle user signup
const signup = async (req, res) => {
  try {
    const saltRounds = 10;
    const { name, email, password, role } = req.body;
    console.log(name,email,password,role)

    const isUser = await userModel.findOne({ email: email });
    if (isUser) {
      return res.status(409).json({ message: "User already registered. Please sign in to continue." });
    }

    const hash = await bcrypt.hash(password, saltRounds);

    await userModel.create({ ...req.body, password: hash });
    console.log("signup successful", hash);

   await sendMail(
  email,
  "Welcome to CRM Portal!",
  `Welcome ${name}!`, 
  name,
  role
);

    res.status(200).json({ message: "signup successful" });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ Error: "Error in signup", error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
  
    const user = await userModel.findOne({ email });
  console.log(user)
    if (!user) return res.status(404).json({ message: 'User not found' });


    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

   
    const resetLink = `${FRONTEND_URL}/change-password?token=${token}`;

    // 4. Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: user.email,
  subject: 'Reset Your Password',
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #007BFF;">Password Reset Request</h2>
      <p>Hi ${user.name || 'there'},</p>

      <p>We received a request to reset your password. Click the button below to set a new password:</p>

      <a href="${resetLink}" 
         style="display: inline-block; margin: 15px 0; padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>

      <p>If the button doesn't work, you can also use the following link:</p>
      <p style="word-break: break-all;">
        <a href="${resetLink}">${resetLink}</a>
      </p>

      <p>This link will expire in 15 minutes for your security.</p>

      <hr style="margin-top: 30px;" />
      <p style="font-size: 12px; color: #888;">
        If you didn't request a password reset, you can ignore this email.
      </p>
    </div>
  `
};

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Reset link sent to your email.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong.' ,error: err.message});
  }
}


// const requestPasswordChange = async(req, res) => {
//   const token = req.query.token;
//   const { newPassword } = req.body;
//   console.log(newPassword,token)
//   if (!token || !newPassword)
//     return res.status(400).json({ message: 'Token and new password are required.' });

//   try {

//     const decoded = jwt.verify(token, JWT_SECRET); 
//     const userId = decoded.id;

//     // 2. Find user by ID from token
//     const user = await userModel.findById(userId);
//     if (!user) return res.status(404).json({ message: 'User not found.' });

//     // 3. Hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // 4. Update user password in DB
//     user.password = hashedPassword;
//     await user.save();

//     return res.json({ message: 'Password has been reset successfully.' });
//   } catch (error) {
//     console.error('Reset token error:', error.message);
//     return res.status(400).json({ message: 'Invalid or expired token.',error: error.message });
//   }
// }




const requestPasswordChange = async (req, res) => {
  const token = req.query.token;
  const { newPassword } = req.body;

  if (!token || !newPassword)
    return res.status(400).json({ message: 'Token and new password are required.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Password Was Reset',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #28a745;">Password Reset Confirmation</h2>
          <p>Hi ${user.name || 'there'},</p>

          <p>Your password has been successfully changed.</p>

          <p><strong>New Password:</strong> ${newPassword}</p>

          <p>If you did not perform this action, please reset your password immediately or contact support.</p>

          <hr />
          <p style="font-size: 12px; color: #888;">If you did request this change, no further action is needed.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({ message: 'Password has been reset and email sent.' });
  } catch (error) {
    console.error('Reset token error:', error.message);
    return res.status(400).json({ message: 'Invalid or expired token.', error: error.message });
  }
};


const ProfileData = async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(401).json({ message: "Token is not valid" });
    }
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const submitReferral = async (req, res) => {
  try {
    const { name, email, phone, jobTitle, resume } = req.body;
    const userId = req.user.id;

    if (!name || !email || !phone || !jobTitle) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const newReferral = await candidateReferal.create({
      name,
      email,
      phone,
      jobTitle,
      resume,
      referredBy: userId,
    });

    await userModel.findByIdAndUpdate(userId, {
      $push: { referrals: newReferral._id },
    });

    res.status(201).json({
      message: "Referral submitted successfully",
      referral: newReferral,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong while submitting referral" });
    console.error("Referral submission error:", error);
  }
};

const myReferals = async (req, res) => {
  try {
    const referrals = await candidateReferal.find({ referredBy: req.user._id });
    res.status(200).json(referrals);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch referrals" });
  }
};

//ADMIN ROUTES
const fetchReferalsAdmin = async (req, res) => {
  try {
    const referrals = await candidateReferal
      .find()
      .populate("referredBy", "name email");
    res.status(200).json(referrals);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch referrals" });
  }
};

const statusUpdate = async (req, res) => {
  try {
    const { status } = req.body;

    const updatedReferral = await candidateReferal.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.status(200).json(updatedReferral);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

const bulkStatusUpdate = async (req, res) => {
  try {
    const { updates } = req.body;

    // Validate request body
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        message:
          "Please provide an array of updates with referralIds and status",
      });
    }

    // Validate structure of each update
    const isValidUpdate = updates.every(
      (update) => update.referralId && update.status
    );

    if (!isValidUpdate) {
      return res.status(400).json({
        message: "Each update must contain referralId and status",
      });
    }

    // Perform bulk update
    const bulkUpdatePromises = updates.map(async ({ referralId, status }) => {
      return candidateReferal.findByIdAndUpdate(
        referralId,
        { status },
        { new: true }
      );
    });

    const updatedReferrals = await Promise.all(bulkUpdatePromises);

    res.status(200).json({
      message: "Bulk status update successful",
      updatedReferrals,
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({
      message: "Failed to perform bulk status update",
      error: error.message,
    });
  }
};

const deleteReferral = async (req, res) => {
  try {
    const referralId = req.params.id;

    // Find the referral first
    const referral = await candidateReferal.findById(referralId);

    if (!referral) {
      return res.status(404).json({
        message: "Referral not found",
      });
    }

    // Remove referral from user's referrals array
    await userModel.findByIdAndUpdate(referral.referredBy, {
      $pull: { referrals: referralId },
    });

    // Delete the referral
    await candidateReferal.findByIdAndDelete(referralId);

    res.status(200).json({
      message: "Referral deleted successfully",
      deletedReferralId: referralId,
    });
  } catch (error) {
    console.error("Delete referral error:", error);
    res.status(500).json({
      message: "Failed to delete referral",
      error: error.message,
    });
  }
};

module.exports = {
  submitReferral,
  signup,
  login,
  ProfileData,
  myReferals,
  fetchReferalsAdmin,
  statusUpdate,
  bulkStatusUpdate,
  deleteReferral,
  resetPassword,
  requestPasswordChange
};
