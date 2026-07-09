const { Sequelize } = require("sequelize");
const logger = require("../utils/logger");

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

const syncDB = async () => {
  try {
    // Import models so Sequelize knows about them
    require("../models/Job");
    require("../models/Application");

    await sequelize.sync({ alter: true });
    logger.info("MySQL tables synced successfully");
  } catch (err) {
    logger.error("MySQL sync failed:", err.message);
  }
};

module.exports = { sequelize, syncDB };
