
const mongoose = require("mongoose");
const { reviewSchema } = require("../schema");
const Schema = mongoose.Schema;
const Review = require("./review"); 

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: {
      type: String,
      default: "defaultimage"
    },
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    }
  },
 price: {
  type: Number,
  default: 0,
  required: true,
},
  location: String,
  country: String,
   reviews:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Review",
    },
   ],
   owner:{
    type:mongoose.Schema.Types.ObjectId,
      ref:"User",
   },
  geometry: {
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates:{
 type:[Number],
 required:true,
  }
},
});

listingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    console.log("Deleted listing:", doc._id);
    console.log("Deleting associated reviews:", doc.reviews);
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
