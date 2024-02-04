const cheerio = require("cheerio");
const fetch = require("node-fetch");

const parsePrice = (price) => {
    const numericPrice = parseInt(String(price).replace(/[^\d]/g, ""), 10);
    return isNaN(numericPrice) ? null : numericPrice;
};

const parseRating = (rating) => {
    const numericRating = parseFloat(rating);
    return isNaN(numericRating) ? null : numericRating;
};

const parseDiscount = (discount) => {
    const numericDiscount = parseInt(discount.replace(/[^\d]/g, ""), 10);
    return isNaN(numericDiscount) ? null : numericDiscount;
};

const calculateDiscount = (originalPrice, discountedPrice) => {
    if (originalPrice && discountedPrice) {
        const discountPercentage =
            ((originalPrice - discountedPrice) / originalPrice) * 100;
        return Math.round(discountPercentage);
    }
    return null;
};

const scrapeAmazon = async (product, no_of_products) => {
    const headers = {
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
    };

    const resp = await fetch(`https://www.amazon.in/s?k=${product}`, {
        headers,
    });
    const text = await resp.text();
    console.log(text);

    const $ = cheerio.load(text);
    const divsWithClassX = $(".s-widget-spacing-small");

    const resultArray = [];
    divsWithClassX.each((index, element) => {
        if (resultArray.length >= no_of_products) return resultArray;
        const ele = $(element).html();
        const $element = cheerio.load(ele);

        const name = $element("h2 a span").text().trim();

        const priceContainer = $element(".a-price");
        const discountedPricest = priceContainer.find(".a-offscreen").text().trim();
        const match = discountedPricest.match(/₹([^₹]+)/);

        const discountedPrice = match ? parseFloat(match[1].replace(/,/g, "")) : 0;

        const originalPrice =
            priceContainer.find(".a-price-symbol + .a-price-whole").text().trim() ||
            discountedPrice;

        const rating = $element(".a-icon-star-small .a-icon-alt").text().trim();

        const url = $element("h2 a").attr("href");
        const productUrl = `https://www.amazon.in${url}`;

        const totalReviewsContainer = $element(
            ".a-section .a-row.a-size-small span.a-size-base"
        );
        const totalReviews = totalReviewsContainer.text().trim();

        resultArray.push({
            name,
            discountedPrice: parsePrice(discountedPrice),
            originalPrice: parsePrice(originalPrice),
            rating: parseRating(rating),
            productUrl,
            totalReviews: parseInt(totalReviews.replace(/[^\d]/g, ""), 10) || null,
            discount: calculateDiscount(
                parsePrice(originalPrice),
                parsePrice(discountedPrice)
            ),
        });
    });

    return resultArray;
};

const scrapeFlipkart = async (product, no_of_products) => {
    const headers = {
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
    };

    const resp = await fetch(`https://www.flipkart.com/search?q=${product}.com`, {
        headers,
    });
    const text = await resp.text();

    const $ = cheerio.load(text);
    const divsWithClassX = $("._13oc-S");

    const resultArray = [];
    divsWithClassX.each((index, element) => {
        if (resultArray.length >= no_of_products) return;
        const name = $(element).find("._4rR01T").text().trim();

        const rating = $(element).find("._1lRcqv").text().trim();

        const totalReviews = $(element).find("span._2_R_DZ").text().trim();

        const features = [];
        $(element)
            .find("div.fMghEO ul._1xgFaf li")
            .each((_, featureElement) => {
                features.push($(featureElement).text().trim());
            });
        const discountedPrice = $(element).find("div._30jeq3").text().trim();
        const originalPrice = $(element).find("div._3I9_wc").text().trim();
        const discount = $(element).find("div._3Ay6Sb span").text().trim();

        resultArray.push({
            name,
            discountedPrice: parsePrice(discountedPrice),
            originalPrice: parsePrice(originalPrice),
            rating: parseRating(rating),
            totalReviews: parseInt(totalReviews.replace(/[^\d]/g, ""), 10) || null,
            discount: parseDiscount(discount),
        });
    });

    return resultArray;
};

const scrapeShopclues = async (product, no_of_products) => {
    const headers = {
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
    };

    const resp = await fetch(`https://www.shopclues.com/search?q=${product}`, {
        headers,
    });
    const text = await resp.text();

    const $ = cheerio.load(text);
    const productBlocks = $(".column.col3.search_blocks");

    const resultArray = [];
    productBlocks.each((index, element) => {
        if (resultArray.length >= no_of_products) return;
        const name = $(element).find("h2").text().trim();
        const imageSrc = $(element).find("div.img_section img").attr("src");
        const productUrl = $(element).find("a").attr("href");
        const price = $(element).find("div.p_price").text().trim();
        const discountedPrice = $(element)
            .find("span.old_prices span")
            .text()
            .trim();
        const discount = $(element).find("span.prd_discount").text().trim();
        const refurbishedBadge = $(element).find("div.refurbished_i").text().trim();

        resultArray.push({
            name,
            imageSrc,
            productUrl,
            discountedPrice: parsePrice(discountedPrice),
            discount: parseDiscount(discount),

            refurbishedBadge,
        });
    });

    return resultArray;
};

const scrapeSnapdeal = async (product, no_of_products) => {
    const headers = {
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
    };

    const resp = await fetch(
        `https://www.snapdeal.com/search?keyword=${product}`,
        {
            headers,
        }
    );
    const text = await resp.text();
    // return text

    const $ = cheerio.load(text);
    const productTuples = $("div.col-xs-6.favDp.product-tuple-listing.js-tuple");

    const resultArray = [];
    productTuples.each((index, element) => {
        if (resultArray.length >= no_of_products) return;

        const name = $(element).find("p.product-title").attr("title");
        const imageSrc = $(element)
            .find("div.product-tuple-image img.product-image")
            .attr("src");
        const productUrl = $(element)
            .find("a.dp-widget-link.hashAdded")
            .attr("href");
        const originalPrice = $(element)
            .find("span.product-desc-price.strike")
            .text()
            .trim();
        const discountedPrice = $(element).find("span.product-price").text().trim();
        const discount = $(element).find("div.product-discount span").text().trim();
        const ratingPercentage =
            parseFloat($(element).find("div.filled-stars").css("width")) / 20;
        const rating = ratingPercentage.toFixed(1);
        const numRatings = $(element).find("p.product-rating-count").text().trim();
        resultArray.push({
            name,
            imageSrc,
            productUrl,
            originalPrice: parsePrice(originalPrice),
            discountedPrice: parsePrice(discountedPrice),
            discount: parseDiscount(discount),

            rating: parseRating(rating),
            numRatings: parseInt(numRatings.replace(/[^\d]/g, ""), 10) || null,
        });
    });

    return resultArray;
};

const scrapeNykaa = async (product, no_of_products) => {
    const headers = {
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
    };

    const resp = await fetch(`https://www.nykaa.com/search/result/?q=apple`, {
        headers,
    });
    const text = await resp.text();
    // return text

    const $ = cheerio.load(text);
    const productWrappers = $("div.productWrapper.css-17nge1h");

    const resultArray = [];
    productWrappers.each((index, element) => {
        if (resultArray.length >= no_of_products) return;

        const name = $(element).find("div.css-xrzmfa").text().trim();
        const productUrl =
            "https://www.nykaa.com" + $(element).find("a.css-qlopj4").attr("href");
        const originalPrice = $(element)
            .find("span.css-17x46n5 span")
            .text()
            .trim();
        const discountedPrice = $(element).find("span.css-111z9ua").text().trim();
        const discount = $(element).find("span.css-cjd9an").text().trim();
        const totalReviews = $(element)
            .find("span.css-1qbvrhp")
            .text()
            .replace(/[^\d]/g, "");

        resultArray.push({
            name,
            productUrl,
            originalPrice: parsePrice(originalPrice),
            discountedPrice: parsePrice(discountedPrice),
            discount: parseDiscount(discount),

            totalReviews: parseInt(totalReviews.replace(/[^\d]/g, ""), 10) || null,
            rating: 4,
        });
    });

    return resultArray;
};

module.exports = {
    scrapeAmazon,
    scrapeFlipkart,
    scrapeShopclues,
    scrapeSnapdeal,
    scrapeNykaa,
};
