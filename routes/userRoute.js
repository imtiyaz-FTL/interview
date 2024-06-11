
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport"); 
const {
  register_user,
  login_user,
  register_admin,
  update_password,
  update_profile,
  forgot_password,
  reset_password,
  resend_otp,
  get_all_user,
  get_all_admin,
  blocked,
  unBlocked,
} = require("../controllers/auth/userController");
const {
  registerValidator,
  loginValidator,
  updatePassword,
  updateProfile,
  resetPassword,
  forgetPassword,
} = require("../helpers/index");
const auth = require("../middleware/auth");
const { user_auth, serializeUser, checkRole } = require("../utils/authUtils");

const userRoute = express.Router();

userRoute.use(bodyParser.urlencoded({ extended: true }));
userRoute.use(bodyParser.json());
userRoute.use(express.static("public"));

// const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      path.join(__dirname, "../public/userImages"),
      function (error, sucess) {
        if (error) throw error;
      }
    );
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "_" + file.originalname;
    cb(null, name, function (error1, sucess1) {
      if (error1) throw error1;
    });
  },
});

const upload = multer({ storage: storage });


userRoute.get('/', (req, res) => {
  res.send('Products API running. New deploy.');
});

userRoute.get('/ping', (req, res) => {
  res.send('PONG');
});

//register user
// upload.single("image"),
userRoute.post("/register",registerValidator,(req, res) => register_user(req, "user", res));



//login user
userRoute.post("/login", loginValidator,  (req, res) => login_user(req, "user", res));





//profile route
userRoute.get("/profile", user_auth, (req, res) => res.status(200).json(serializeUser(req.user)));
// Add more routes here...

//update-password
userRoute.post("/update-password", user_auth, updatePassword, (req, res) =>
  update_password(req, res)
);

//update-profile-user

userRoute.post(
  "/update-profile-user",
  user_auth,
  upload.single("image"),
  updateProfile,
  (req, res) => update_profile(req, "user", res)
);



//forget password
userRoute.post("/forget-password",forgetPassword, (req, res) =>
  forgot_password(req, res)
);

//reset password
userRoute.post("/reset-password", resetPassword, async (req, res) =>
  reset_password(req, res)
);











module.exports = userRoute;
