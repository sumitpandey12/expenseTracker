const express = require("express");

const fs = require("fs");
const path = require("path");
let cors = require("cors");
require("dotenv").config();

const sequelize = require("./utils/database");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");

var app = express();

const PORT = 3000;

const userRouter = require("./routes/user");
const expenseRouter = require("./routes/expense");
const paymentRouter = require("./routes/payment");
const premiumRouter = require("./routes/premium");
const passwordRouter = require("./routes/password");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  }
);

//Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "data:", "blob:"],

      fontSrc: ["'self'", "https:", "data:"],

      scriptSrc: ["'self'", "unsafe-inline"],

      scriptSrc: ["'self'", "https://*.cloudflare.com"],

      scriptSrcElem: ["'self'", "https:", "https://*.cloudflare.com"],

      styleSrc: ["'self'", "https:", "unsafe-inline"],

      connectSrc: ["'self'", "data", "https://*.cloudflare.com"],
    },
  })
);
// app.use(morgan("common", { stream: accessLogStream }));

//Routes
app.use("/user", userRouter);
app.use("/expense", expenseRouter);
app.use("/payment", paymentRouter);
app.use("/premium", premiumRouter);
app.use("/password", passwordRouter);

app.use((req, res) => {
  const urlWithoutQuery = req.url.split("?")[0];
  console.log(urlWithoutQuery);
  res.sendFile(path.join(__dirname, `frontend/${urlWithoutQuery}`));
});

//relations

const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");
const ForgotPasswordRequests = require("./models/ForgotPasswordRequests");

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);

sequelize
  .sync({ force: false })
  .then((result) => {
    app.listen(PORT, function () {
      console.log("Started application on port %d", PORT);
    });
  })
  .catch((errr) => console.log(errr));
