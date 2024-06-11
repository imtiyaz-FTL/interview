const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser=require("body-parser")
const { APP_PORT, DB_URL } = require("./config") ;
const mongoose = require("mongoose");
const passport = require("passport");
const axios = require("axios");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const cron = require("node-cron");
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use('/public', express.static('public'));
require("./middleware/passport")(passport);

app.get("/ping", (req, res) => {
    res.send("PONG");
  });
  app.get("/",(req,res)=>{
res.send("hiiiiiiiii from the server")
  })

  const user_routes = require("./routes/userRoute");

  const postRoute=require("./routes/postRoute")

  //user_routes
app.use("/api", user_routes);

app.use("/api",postRoute)


//   server connection 
  server.listen(APP_PORT, () => {
    console.log(`Server is running on port ${APP_PORT}`);
  });

//   databse connection 
  mongoose
  .connect(DB_URL, {
   
  })
  .then(() => {
    console.log("DB connected...");
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });


