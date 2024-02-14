const User = require("../models/user");

exports.registerUser = (req, res) => {
  const { name, email, password } = req.body;
  User.create({ name, email, password })
    .then((result) => {
      console.log(result);
      return res.send(result);
    })
    .catch((err) => res.send(err));
};

exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ where: { email: email } })
    .then((result) => {
      if (result == null) {
        return res.status(404).send({
          message: "User not found",
        });
      }
      if (result.dataValues.password == password) {
        return res.status(200).send(result);
      }
      return res.status(401).send({
        message: "Password is incorrect",
      });
    })
    .catch((err) => res.send(err));
};
