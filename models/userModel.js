const mongoose = require("mongoose");

const user = mongoose.Schema(
  {
    name: {
      type: String,
     
    },
    email: {
      type: String,
      required: true,
      unique: true,
            match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "Password should be greater than 6 characters"],
    },
    // image: {
    //   type: String,
    //   required: true,
    // },
    mobile: {
      type: String,
   
    },
    role: {
      type: String,
      // enum: ["user", "admin"],
      enum: ["user", "admin", "superAdmin", "master", "agent"], // Define all possible roles here
      default: "user", // Default role is "user"
    },
    otp: {
      type: String,
      default: "",
    },
    blocked:{
      type : Boolean,
      default : false,
    }
  },
  { versionKey: false }
);

module.exports = mongoose.model("User", user);
