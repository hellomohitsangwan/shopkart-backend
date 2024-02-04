const path = require("path");
const express = require("express");
const scrapeRoutes = require("./routes/scraperoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const uploadRoutes = require("./routes/uploadRoutes.js");
const productRoutes = require("./routes/productRoutes.js");

const cloudinary = require("cloudinary");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db.js");
const corsMiddleware = require("./cors/index.js");

const app = express();
const PORT = process.env.PORT || 8000; // Use environment variable or default to 8000

app.use(express.json());
app.use(morgan('dev'));
app.use(fileUpload());
app.use(corsMiddleware);

cloudinary.config({
  cloud_name: "djfh8ecu4",
  api_key: "329259279517943",
  api_secret: "SZ9Bp_Tln70t0lCJGv54PrX-lP0",
});

connectDB();

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Define your routes after setting up middleware and configurations
app.use("/api/scrape", scrapeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server started in production mode on port ${PORT}`);
});
