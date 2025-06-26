require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

// Load your MAPBOX token
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => {
    console.log("✅ Connected to MongoDB");
    fixListings();
  })
  .catch(err => {
    console.error("❌ DB connection error:", err);
  });

async function fixListings() {
  const listings = await Listing.find({
    $or: [
      { geometry: { $exists: false } },
      { "geometry.coordinates": { $size: 0 } }
    ]
  });

  console.log(`🔍 Found ${listings.length} listings to update`);

  for (let listing of listings) {
    try {
      const geoRes = await geocodingClient.forwardGeocode({
        query: listing.location,
        limit: 1
      }).send();

      const geometry = geoRes.body.features[0]?.geometry;

      if (!geometry || !geometry.coordinates || geometry.coordinates.length !== 2) {
        console.warn(`⚠️ Skipped "${listing.title}" — Invalid location: ${listing.location}`);
        continue;
      }

      listing.geometry = geometry;
      await listing.save();
      console.log(`✅ Updated listing: ${listing.title}`);
    } catch (e) {
      console.error(`❌ Error updating ${listing.title}:`, e.message);
    }
  }

  console.log("🎉 Done updating listings!");
  mongoose.connection.close();
}
