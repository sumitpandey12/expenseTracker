const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../utils/database");
const AWS = require("aws-sdk");

exports.postExpense = async (req, res) => {
  const { amount, description, category } = req.body;
  const t = await sequelize.transaction();
  try {
    const expenseAmount = parseFloat(amount);

    const expense = await req.user.createExpense(
      {
        amount: expenseAmount,
        description,
        category,
      },
      { transaction: t }
    );

    await req.user
      .update(
        {
          total_expense:
            parseFloat(req.user.dataValues.total_expense) + expenseAmount,
        },
        { transaction: t }
      )
      .catch(async (err) => {
        console.log(err);
        await t.rollback();
      });
    await t.commit();

    res.status(201).json(expense);
  } catch (error) {
    await t.rollback();
    console.log(error);
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await req.user.getExpenses();
    res.status(201).json(expenses);
  } catch (error) {
    console.log(error);
  }
};

exports.deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();
  const { id } = req.params;

  try {
    const expense = await Expense.findOne(
      { where: { id } },
      { transaction: t }
    ).catch(async (err) => {
      console.log(err);
      await t.rollback();
    });
    const remainingExpense =
      Number(req.user.dataValues.total_expense) - expense.amount;
    await User.update(
      {
        total_expense: remainingExpense,
      },
      { where: { id: req.user.dataValues.id } },
      {
        transaction: t,
      }
    ).catch(async (err) => {
      console.log(err);
      await t.rollback();
    });
    await expense
      .destroy()
      .then(async (result) => {
        t.commit();
        res.status(201).json(result);
      })
      .catch(async (err) => {
        console.log(err);
        await t.rollback();
      });
  } catch (error) {
    console.log(error);
    await t.rollback();
  }
};

function uploadToS3(data, fileName) {
  return new Promise(function (resolve, reject) {
    let s3 = new AWS.S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });

    s3.upload(
      {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: data,
        ACL: "public-read",
      },
      (err, response) => {
        if (err) {
          console.log("AWS Error: ", err);
          reject(err);
        } else {
          console.log("Success : ", response);
          resolve(response.Location);
        }
      }
    );
  });
}

exports.downloadExpense = async (req, res) => {
  //get Data
  const expenses = await req.user.getExpenses();
  console.log(expenses);
  const stringifiedExpenses = JSON.stringify(expenses);
  const userId = req.user.id;
  const fileName = `expenses-${userId}-${new Date()}.txt`;
  await uploadToS3(stringifiedExpenses, fileName)
    .then((loaction) => {
      res.status(200).json({
        success: true,
        loaction,
      });
    })
    .catch((err) => {
      res.status(401).json({
        success: true,
        err,
      });
    });
};
