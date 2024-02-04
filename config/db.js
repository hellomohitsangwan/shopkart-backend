const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://mohit-dev:mohit@procommerce.qdoweio.mongodb.net/", {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log(`mongo DB connected:${conn.connection.host}`.cyan.underline);
  } catch (err) {
    console.error(err.message.red.underline.bold);
    // exit the whole process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
