const express = require("express");
const userRouter = express.Router();

const {
  submitReferral,
  signup,
  login,
  ProfileData,
  myReferals,
  fetchReferalsAdmin,
  statusUpdate,
  bulkStatusUpdate,
  deleteReferral,
} = require("../controllers/user.controller");
const { isAdmin } = require("../middlewares/admin.middleware");
const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/middlewares.upload");

userRouter.post("/signup", signup);

userRouter.post("/login", login);

userRouter.get("/profile", ProfileData);

userRouter.post("/referal-submit",protect,upload.single('resume') ,submitReferral);


userRouter.get('/my-referrals',protect, myReferals);


// admins side
userRouter.get('/admin/referrals',protect,isAdmin, fetchReferalsAdmin);


userRouter.put('/admin/referrals/:id/status',protect, isAdmin, statusUpdate);

userRouter.put('/admin/referrals/bulk-status-update', protect, isAdmin, bulkStatusUpdate);


userRouter.delete('/admin/referrals/:id', protect, isAdmin, deleteReferral);

module.exports = userRouter;
