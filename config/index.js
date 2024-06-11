const dotenv = require("dotenv");
dotenv.config();

const {
  APP_PORT,
  DB_URL,
  JWT_SECRET,
  REFRESH_SECRET,
  EMAIL_USER,
  EMAIL_PASSWORD
//   BASE_URL,
} = process.env;
module.exports = {
  APP_PORT,
  DB_URL,
  JWT_SECRET,
  REFRESH_SECRET,
  EMAIL_USER,
  EMAIL_PASSWORD,
//   BASE_URL,
};