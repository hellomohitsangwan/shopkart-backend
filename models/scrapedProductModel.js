const mongoose = require('mongoose');


const scrapedProductSchema = new mongoose.Schema({
    name: String,
    productUrl: String,
    totalReviews: Number,
    rating: Number,
    discountedPrice: Number,
    website: String,
});

module.exports = mongoose.model('scrapedProductSchema', scrapedProductSchema);


