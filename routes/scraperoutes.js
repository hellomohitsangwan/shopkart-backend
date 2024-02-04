const express = require('express');
const router = express.Router();
const { scrapeWeb } = require('../controllers/scrapecontroller.js');


router.route("/").post(scrapeWeb)

module.exports = router;
