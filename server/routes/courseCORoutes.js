const courseCORoutes = require("express").Router();
const { CourseCO } = require("./../models/course-co");

courseCORoutes.get('/:courseId', async (req, res) => {
  const coursesCO = await CourseCO.find({ 'courseId': req.params.courseId });
  return res.status(200).json({ coursesCO: coursesCO }).end();
});

courseCORoutes.get('/:courseId/theory-cos', async (req, res) => {
  const coursesCO = await CourseCO.find({ 'courseId': req.params.courseId, 'coType': 0 });
  return res.status(200).json({ coursesCO: coursesCO }).end();
});

courseCORoutes.post('/add-co', async (req, res) => {
  const courseCO = new CourseCO({ ...req.body });

  courseCO.save((error, message) => {
    if (error) {
      return res.status(500).json({ response: null, error: error, message: "Something Went Wrong!! Please Try Again..." }).end();
    } else {
      return res.status(200).json({ response: message, error: null, message: 'Course Outcome Added Successfully' }).end();
    }
  });
});

courseCORoutes.delete("/delete-co/:co_Id", (req, res) => {
  CourseCO.findByIdAndDelete(req.params.co_Id, (err, msg) => {
    if (err) {
      return res.status(500).json({ ...err, message: "Something Went Wrong!!" }).end();
    } else {
      return res.status(200).json({ date: new Date(), message: "Course Outcome Delete successfully" }).end();
    }
  })
});

courseCORoutes.put("/update-co/:id", (req, res) => {
  let query = {};
  for (let key in req.body) {
    if (key !== "_id") query[key] = req.body[key];
  }

  CourseCO.findByIdAndUpdate(req.params.id, {
    $set: { ...query }
  }, { new: true }, (error, response) => {
    if (error) {
      return res.status(500).json({ ...error, message: "Something Went Wrong!!" }).end();
    } else {
      return res.status(200).json({ response: response, message: "Course Outcome Updated successfully" }).end();
    }
  })
});

module.exports = { courseCORoutes };