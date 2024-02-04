const asyncHandler = require("express-async-handler");
const scrapperUtils = require("../utils/scrapper.js");
const scrapeAmazon = scrapperUtils.scrapeAmazon;
const scrapeFlipkart = scrapperUtils.scrapeFlipkart;
const scrapeNykaa = scrapperUtils.scrapeNykaa;
const scrapeShopclues = scrapperUtils.scrapeShopclues;
const scrapeSnapdeal = scrapperUtils.scrapeSnapdeal;
const ScrapedProduct = require("../models/scrapedProductModel.js");

exports.scrapeWeb = asyncHandler(async (req, res) => {
  try {
    const { searchTerm, filter, topN, comparisonWebsites } = req.body;

    const websiteScrapingFunctions = {
      amazon: scrapeAmazon,
      flipkart: scrapeFlipkart,
      shopclues: scrapeShopclues,
      snapdeal: scrapeSnapdeal,
      nykaa: scrapeNykaa,
    };

    const websitePromises = comparisonWebsites.map(async (website) => {
      if (websiteScrapingFunctions[website]) {
        const websiteData = await websiteScrapingFunctions[website](searchTerm, topN);

        const filteredData = websiteData.filter((item) => item.name);
        // Save data to MongoDB
        await ScrapedProduct.insertMany(filteredData);

        return filteredData.map((item) => ({ ...item, website }));
      }
      return [];
    });

    const websiteDataArrays = await Promise.all(websitePromises);

    const allData = websiteDataArrays.flat();

    // Apply filtering if specified
    let filteredData = allData;
    if (filter === "highestPrice") {
      filteredData = allData.sort((a, b) => b.discountedPrice - a.discountedPrice);
    } else if (filter === "lowestPrice") {
      filteredData = allData.sort((a, b) => a.discountedPrice - b.discountedPrice);
    } else if (filter === "highestRating") {
      filteredData = allData.sort((a, b) => b.rating - a.rating);
    }

    // Take the top N results
    const topResults = filteredData.slice(0, topN);

    // Prepare response array
    const responseArray = topResults.map((item) => ({
      url: item.productUrl,
      title: item.name,
      reviewCount: item.totalReviews,
      rating: item.rating,
      currentPrice: item.discountedPrice,
      website: item.website,
    }));

    res.json(responseArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
