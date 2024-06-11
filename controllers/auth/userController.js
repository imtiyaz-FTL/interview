const User = require("../../models/userModel");
const bcryptjs = require("bcryptjs");
// const ErrorHander=require("../../utils/errorHandler")
const catchAsync = require("../../middleware/catchAsyncErrors")
const { JWT_SECRET, EMAIL_PASSWORD, EMAIL_USER } = require("../../config");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { check, validationResult } = require("express-validator");
//send email
const sendResetPasswordMail = async (name, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      // requireTLS: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: `Password Reset OTP: ${otp}`,
      html: `<h1>Hi ${name},</h1><br/> <p>Below is your OTP: <strong>${otp}</strong> to reset your password. If you didn't request this, you may ignore this email.</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Mail has been sent:", info.response);
      }
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// password Hash
const securePassword = async (password) => {
  try {

    const passwordHash = await bcryptjs.hash(password, 10);

    return passwordHash;
  } catch (error) {
    res.status(400).send(error.message);
  }
};

//creat token 
const creat_token = async (id, role, email) => {
  try {
    const token = await jwt.sign({ _id: id, role: role, email }, JWT_SECRET);

    return token;
  } catch (error) {
    res.status(400).send(error.message);
  }
};
//register user
const register_user = (async (req, role, res) => {
  try {
console.log(req.body,"ddddddddd");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }
  


    const spassword = await securePassword(req.body.password);
    console.log(spassword, "ppppppppp")

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: spassword,
      // image: req.file.filename, // Assuming you handle image uploads
      role,
    });

    const userData = await User.findOne({ mobile: req.body.mobile });

    if (userData) {
      return res.status(400).send({ success: false, message: "This mobile is already in use" });
      // return next(new ErrorHander("mobile is already present", 400));
    } else {
      console.log("ttttttttt")
      const user_data = await user.save();
      const tokenData = await creat_token(
        user_data._id,
        user_data.role,
        user_data.email
      );

      console.log(tokenData, "ooooooooo")

      return res.status(200).send({
        success: true,
        data: user_data,
        token: `Bearer ${tokenData}`,
      });
    }
  } catch (error) {
    return res.status(400).send({ success: false, message: error.message });
  };
})

//register admin
const register_admin = async (req, role, res) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }
  
    const spassword = await securePassword(req.body.password);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      gender: req.body.gender,
      password: spassword,
      image: req.file.filename,
      role,
    });

    const userData = await User.findOne({ email: req.body.email });

    if (userData) {
      res
        .status(400)
        .send({ success: false, message: "This email is already exists" });
    } else {
      const user_data = await user.save();
      const tokenData = await creat_token(
        user_data._id,
        user_data.role,
        user_data.email
      );
      res.status(200).send({ success: true, data: user_data, token: `Bearer ${tokenData}`, });
    }
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

//login  
const login_user = (async (req, role, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      if (userData.blocked === true) {
        return res.status(403).json({
          success: false,
          message: `you are not allowed to access this page`,
        });
      }

      if (userData.role !== role) {
        return res.status(403).json({
          success: false,
          message: `you are not allowed to access this page`,
        });
      }

      const passwordMatch = await bcryptjs.compare(password, userData.password);
      console.log(passwordMatch, "kkkk")

      if (passwordMatch) {
        console.log(userData,"ffffffffffffff");
        const tokenData = await creat_token(
          userData._id,
          userData.role,
          userData.email
        );
        const userResult = {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          image: userData.image,
          role: userData.role,
          token: `Bearer ${tokenData}`,
        };
        const response = {
          success: true,
          message: "user details",
          data: userResult,
        };

        res.status(200).send(response);
      } else {
        res
          .status(200)
          .send({ success: false, message: "Login details are incorrect" });
      }
    } else {
      res
        .status(200)
        .send({ success: false, message: "Login details are incorrect" });
    }
  } catch (error) {
    return res.status(400).send({ success: false, message: error.message });
  }


});

//update_password
const update_password = async (req, res) => {
  try {
    console.log("kakaka")
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }
    const oldPassword = req.body.oldPassword;
    const password = req.body.newPassword;

    if (!oldPassword || !password) {
      return res.status(400).send({
        success: false,
        message: "Both user_id and password must be provided",
      });
    }

    const userId = req.user._id;
    let data = await User.findById(userId);

    if (data) {
      const passwordMatch = await bcryptjs.compare(oldPassword, data.password);
      if (passwordMatch) {
        const newpassword = await securePassword(password);

        const userData = await User.findByIdAndUpdate(
          { _id: userId },
          {
            $set: {
              password: newpassword,
            },
          }
        );

        res.status(200).json({
          success: true,
          message: "Password Updated Successfully!",
        });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Your password is wrong" });
      }
    } else {
      res.status(400).json({ success: false, message: "User Id not found" });
    }
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

//update_profile
const update_profile = async (req, role, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    // Find the user by their ID
    const userId = req.user._id;
    let userData = await User.findById(userId);

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "User with this ID does not exist",
      });
    }

    if (userData.role !== role) {
      return res.status(403).json({
        success: false,
        message: `you are not allowed to access this page`,
      });
    }

    // Update the user's information
    userData.name = req.body.name;
    userData.mobile = req.body.mobile;
    // userData.image = req.file.filename;

    // Save the updated user data
    const user_data = await userData.save();

    return res.status(200).json({
      success: true,
      message: "successfully update your profile",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//forgot_password
const forgot_password = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }
    const email = req.body.email;
    if (!email) {
      return res.status(400).send("email must be provided");
    }

    const userData = await User.findOne({ email: email });

    if (userData) {
      // Generate a 6-digit OTP
      const otp = Math.floor(Math.random() * 900000) + 100000;
      const data = await User.updateOne(
        { email: email },
        { $set: { otp: otp } }
      );

      sendResetPasswordMail(userData.name, userData.email, otp);

      res.status(200).send({
        success: true,
        message: "OTP has been sent to your registered Email",
      });
    } else {
      res.status(400).send({
        success: false,
        message: "No account associated with this email",
      });
    }
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

//reset_password
const reset_password = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { otp, password, email } = req.body;
    if (!password || !otp || !email) {
      return res.status(400).send({
        success: false,
        message: "Both otp, password, and email must be provided",
      });
    }

    const otpData = await User.findOne({ email });

    if (otpData && otpData.otp === otp) {
      const newPassword = await securePassword(password);
      const userData = await User.findByIdAndUpdate(
        { _id: otpData._id },
        { $set: { password: newPassword, otp: "" } },
        { new: true }
      );
      res
        .status(200)
        .send({ success: true, message: "Password has been reset." });
    } else {
      res
        .status(400)
        .send({ success: false, message: "Invalid OTP or email." });
    }
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

//resend_otp
const resend_otp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }
    const email = req.body.email;
    if (!email) {
      return res.status(400).send("email must be provided");
    }

    const userData = await User.findOne({ email: email });

    if (userData) {
      // Generate a 6-digit OTP
      const otp = Math.floor(Math.random() * 900000) + 100000;
      const data = await User.updateOne(
        { email: email },
        { $set: { otp: otp } }
      );

      sendResetPasswordMail(userData.name, userData.email, otp);

      res.status(200).send({
        success: true,
        message: "OTP has been sent to your registered Email",
      });
    } else {
      res.status(400).send({
        success: false,
        message: "No account associated with this email",
      });
    }
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

//get_all_user
const get_all_user = async (req,role, res) => {
  try {
    console.log("kkkkkkkkkkkkkkkkkkkkkk")
    const users = await User.find({ role: "user" }).select(
      "-password -role -otp"
    );
    res.status(200).send({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

const get_all_admin = async (req, res) => {
  try {
    console.log("kkkkkkkkkkkkkkkkkkkkkk")
    const users = await User.find({ role: "admin" }).select(
      "-password -role -otp"
    );
    res.status(200).send({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

//blocked user
const blocked = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.blocked = true;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

// Unblocking a user
const unBlocked = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.blocked = false;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "User unblocked successfully" });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

module.exports = {
  register_user,
  register_admin,
  login_user,
  update_password,
  update_profile,
  forgot_password,
  reset_password,
  resend_otp,
  get_all_user,
  get_all_admin,
  blocked,
  unBlocked,
};
