const courseRoutes = require("express").Router();
const { Course } = require("./../models/course");

courseRoutes.get('/', async (req, res) => {
  const courses = await Course.find();
  return res.status(200).json({ courses: courses }).end();
});

courseRoutes.post('/add-course', (req, res) => {
  const course = new Course({ ...req.body });

  course.save((error, message) => {
    // console.log(res,"Data coming is")
    // console.log("here is course data coming:", req.body)
    if (error) {
      return res.status(500).json({ response: null, error: error, message: "Something Went Wrong!! Please Try Again..." }).end();
    } else {
      return res.status(200).json({ response: message, error: null, message: 'Course Added Successfully' }).end();
    }
  });
});

courseRoutes.delete("/delete-course/:courseId", (req, res) => {
  Course.findByIdAndDelete(req.params.courseId, (err, msg) => {
    if (err) {
      return res.status(500).json({ ...err, message: "Something Went Wrong!!" }).end();
    } else {
      return res.status(200).json({ date: new Date(), message: "Course Delete successfully" }).end();
    }
  })
});

courseRoutes.put("/update-course/:_id", async (req, res) => {
  let query = {};
  for (let key in req.body) {
    if (key !== "_id") query[key] = req.body[key];
  }

  Course.findByIdAndUpdate(req.params._id, {
    $set: { ...query }
  }, { new: true }, (error, response) => {
    if (error) {
      return res.status(500).json({ ...error, message: "Something Went Wrong!!" }).end();
    } else {
      return res.status(200).json({ response: response, message: "User Updated successfully" }).end();
    }
  })
});

module.exports = { courseRoutes };