const express = require("express");
const router =express.Router({mergeParams:true});
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const { saveRedirectedUrl } = require("../middleware");
const userController=require("../controllers/users.js")


router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderloginForm)
.post(saveRedirectedUrl,passport.authenticate("local", { 
  failureRedirect:'/login',
  failureFlash:true}),userController.login);

 router.get("/logout",userController.logout);
module.exports=router;