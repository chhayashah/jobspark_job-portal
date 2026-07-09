const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectMongo = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    // process.exit(1);
  }
};

mongoose.connection.on("disconnected", () =>
  logger.warn("MongoDB disconnected"),
);
mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));

module.exports = connectMongo;
