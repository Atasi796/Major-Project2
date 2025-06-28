if(process.env.NODE_ENV != "production") { 
require('dotenv').config();
}
//console.log(process.env.SECRET);
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const Review =require("./models/review.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash =require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User = require("./models/user.js");


const listings =require("./routes/listing.js");//ew can use listingrouter
const reviews =require("./routes/review.js");
const user =require("./routes/user.js");
const { truncate } = require("fs");


//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;
console.log("DB URL:", dbUrl);

async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit if DB connection fails
  }
}

main();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static('public'));

const store =MongoStore.create({
  mongoUrl: dbUrl,
   crypto:{
    secret:process.env.SECRET,
   },
   touchAfter:24*3600,
});
store.on("error",()=>{
  console.log("Error in Mongo SESSION Store",error);
})

const sessionOptions ={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly:true,
  },
};



app.get("/", (req, res) => {
  res.redirect("/listings"); // or render a homepage
});







app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});





app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.use("/",user);





/*app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found")); // ✅ Correct spelling
});*/

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("listings/error.ejs",{err});
  //res.status(statusCode).send(message);
});

// Listen on dynamic port for Render
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});