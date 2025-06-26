
const Listing = require("./models/listing");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review =require("./models/review.js");


module.exports.isLoggedIn = (req,res,next) => {
  console.log(req.user);
    if(!req.isAuthenticated()){
      req.session.redirectUrl = req.originalUrl;
    req.flash("error","you must be logged in to create listing!");
   return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectedUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};


module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  // Fetch the listing
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Check ownership
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner");
    return res.redirect(`/listings/${id}`);
  }

  // Ownership verified
  next();
};


module.exports.validateListing = (req, res, next) => {
  let result = listingSchema.validate(req.body);
  if (result.error) {
    const msg = result.error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg); 
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let result =reviewSchema.validate(req.body);
  if (result.error) {
    const msg = result.error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg); 
  } else {
    next();
  }
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  // Fetch the listing
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Check ownership
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner");
    return res.redirect(`/listings/${id}`);
  }

  // Ownership verified
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;

  // Fetch the review
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }

  // Check authorship
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }

  // Authorship verified
  next();
};