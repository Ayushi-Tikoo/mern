const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

//in most cases when we use async await we wrap it in the try catch block
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error("Error:=", err.message);
    //EXIT process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
