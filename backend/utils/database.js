const Sequelize = require("sequelize");

const sequelize = new Sequelize("expense", "root", "password", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
