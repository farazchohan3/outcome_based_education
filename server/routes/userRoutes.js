const userRoutes = require("express").Router();
const { User } = require("./../models/user");
const bcrypt = require('bcrypt');

userRoutes.post("/add-user", async (req, res) => {
  let body = { ...req.body };

  let response = await User.find({ email: body.email });
  if (response.length === 0) {
    const user = new User({ ...body });
    if (body.password !== undefined) {
      user.password = await bcrypt.hash(body.password, 10);
    }
    // res.status(200).json({ ...user['_doc'] })
    user.save((error, message) => {
      if (error) {
        res.status(500).json({ ...error }).end();
      } else {
        res.status(200).json({ messgae: "User Added Successfully", res: message }).end();
      }
    });
  } else {
    res.status(500).json({
      message: "User already registered with this email address. Please use another emai.",
    }).end();
  }
});

userRoutes.put("/update-user/:_id", (req, res) => {
  let query = {};
  for (let key in req.body) {
    if (key !== "_id") query[key] = req.body[key];
  }

  User.findByIdAndUpdate(req.params._id, {
    $set: { ...query }
  }, { new: true }, (error, response) => {
    if (error) {
      return res.status(500).json({ ...error, message: "Something Went Wrong!!" }).end();
    } else {
      return res.status(200).json({ date: new Date(), message: "User Updated successfully", response: response }).end();
    }
  })
});

userRoutes.get("/", async (req, res) => {
  console.log(">>> Req Query Params: ", req.query);
  const users = await User.find({
    '_id': { $ne: req.query.userId },
    'department': req.query.department
  });
  return res.status(200).json({ response: users, dateTime: new Date() }).end();
});

userRoutes.delete("/delete-user/:userId", (req, res) => {
  User.findByIdAndDelete(req.params.userId, (error, msg) => {
    if (error) {
      return res.status(500).json({ ...error, message: "Something Went Wrong!!" }).end();
    } else {
      return res.status(200).json({ date: new Date(), message: "User Delete successfully" }).end();
    }
  })
})

module.exports = { userRoutes };