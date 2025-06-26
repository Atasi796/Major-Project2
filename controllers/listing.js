const Listing = require("../models/listing.js");
const mbxGeocoding= require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken= process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

//index
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
 // Sanitize price values
  for (let listing of allListings) {
    if (listing.price === null || listing.price === undefined) {
      listing.price = 0;
    }
  }
 res.render("listings/index.ejs", { allListings });
};
//new 
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs", { listing: {} });
};
//show
module.exports.showListing =async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).
  populate({
    path:"reviews",
    populate:{
    path:"author",
    },
  })
  .populate("owner");
  if(!listing){
      req.flash("error","Listing you requested for does not exist!");
     return res.redirect("/listings");
    }
   if (listing.price === null || listing.price === undefined) {
    listing.price = 0;
    }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};
//create
module.exports.createListing =async (req, res,next) => {
 let response=await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
})
.send();


  let url =req.file.path;
   let filename=req.file.filename;
   console.log(url,"..",filename);
  const newListing = new Listing(req.body.listing);
  newListing.owner=req.user._id;
  newListing.image={url,filename};

  newListing.geometry=(response.body.features[0].geometry);
  
 let saveListing= await newListing.save();
 console.log("saveListing");
  req.flash("success","New Listing Created!");
  res.redirect("/listings");
};
//edit
module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  // Prepare resized image URL for preview
  let originalImageUrl = "";
  if (listing.image && listing.image.url) {
    originalImageUrl = listing.image.url.replace(
      "/upload",
      "/upload/h_300,w_250"
    );
  }

  // Ensure price is defined
  if (listing.price == null) {
    listing.price = 0;
  }

  // Pass originalImageUrl to template
  res.render("listings/edit", { listing, originalImageUrl });
};

//update
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  // Fetch existing listing
  const listing = await Listing.findById(id);

  // Update regular fields from form
  const { title, price, description, location } = req.body.listing;
  listing.title = title;
  listing.price = price;
  listing.description = description;
  listing.location = location;

  // If new image was uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await listing.save();

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

//delete
module.exports.deleteListing=async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
    req.flash("success","Listing Deleted!");
  res.redirect("/listings");
}