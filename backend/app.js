const express = require("express");
const sequelize = require("./utils/database");
const cookieParser = require("cookie-parser");

var app = express();

const PORT = 8001;

let cors = require("cors");
require("dotenv").config();

const userRouter = require("./routes/user");
const expenseRouter = require("./routes/expense");

//Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/user", userRouter);
app.use("/expense", expenseRouter);

//relations

const User = require("./models/user");
const Expense = require("./models/expense");

User.hasMany(Expense);
Expense.belongsTo(User);

sequelize
  .sync({ force: false })
  .then((result) => {
    app.listen(PORT, function () {
      console.log("Started application on port %d", PORT);
    });
  })
  .catch((errr) => console.log(errr));
