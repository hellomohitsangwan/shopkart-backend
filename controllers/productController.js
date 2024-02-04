const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel.js");
const User = require("../models/userModel.js");
const cloudinary = require("cloudinary");

// @desc  Fetch all products
// @route Get /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};
  const product = await Product.find({ ...keyword });
  res.json(product);
});

// @desc  Fetch single products
// @route Get /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    const user = await User.findById(product.user).select("-password");
    if (user) {
      res.json({ product, user });
    } else {
      res.json(product);
    }
  } else {
    res.status(404).json({ message: "product not found" });
  }
});

// @desc  Fetch all products Admin created
// @route Get /api/products/myproducts
// @access Private and only Admin
const getProductsOfAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  res.json(products);
});

// @desc  Fetch all reviews for particular Admin's product
// @route Get /api/products/myreviews
// @access Private and only Admin
const getReviewOfAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.id);
  if (product) {
    res.json(product.reviews);
  } else {
    res.status(404);
    throw new Error("product not found");
  }
});

// @desc  Fetch single products
// @route Get /api/products/:id
// @access Admin protected
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.remove();
    res.json({ message: "product removed successfully" });
  } else {
    res.status(404);
    throw new Error("product not found");
  }
});

// @desc  Edit single product
// @route PUT /api/products/:id
// @access Admin protected
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    for (let i = 0; i < product.images.length; i++) {
      const result = await cloudinary.v2.uploader.destroy(
        product.images[i].public_id
      );
    }

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// @desc  Create single product
// @route PUT /api/products
// @access Admin protected
const createProduct = asyncHandler(async (req, res, next) => {
  let images = [];
  console.log(res);
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  let imagesLinks = [];

  for (let i = 0; i < images?.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user._id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

// module.exports = {
//   getProducts,
//   getProductById,
//   deleteProduct,
//   updateProduct,
//   createProduct,
//   getProductsOfAdmin,
//   getReviewOfAdmin,
// };

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("You've already posted a review for this product");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Get top-rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.json(products);
});

// module.exports = {
//   createProductReview,
//   getTopProducts,
// };



module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  createProduct,
  getProductsOfAdmin,
  getReviewOfAdmin,
  createProductReview,
  getTopProducts,
};