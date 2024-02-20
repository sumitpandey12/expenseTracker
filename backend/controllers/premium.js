const User = require("../models/user");
const Expense = require("../models/expense");
const sequelize = require("../utils/database");

exports.showLeaderboard = async (req, res) => {
  console.log("Controller");
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        [sequelize.fn("sum", sequelize.col("expenses.amount")), "total_cost"],
      ],
      include: [
        {
          model: Expense,
          attributes: [],
        },
      ],
      group: ["user.id"],
      order: [["total_cost", "DESC"]],
    });
    console.log(users);
    // const expenses = await Expense.findAll({
    //   attributes: [
    //     "userId",
    //     [sequelize.fn("sum", sequelize.col("amount")), "total_cost"],
    //   ],
    //   group: ["userId"],
    // });
    // const userLeaderboardDetails = users.map((user) => {
    //   const userExpense = expenses.find(
    //     (expense) => expense.userId === user.id
    //   );
    //   if (userExpense) console.log("Found!", userExpense.dataValues.total_cost);
    //   return {
    //     name: user.name,
    //     total_cost: userExpense ? userExpense.dataValues.total_cost : 0,
    //   };
    // });
    res.status(201).json(users);
  } catch (error) {
    console.log(error);
  }
};
