const assessmentRoutes = require("express").Router();
const { Assessments } = require("./../models/assessments");

// Fetching All the assessment for particular course....
assessmentRoutes.get('/:courseId', async (req, res) => {
  const assessments = await Assessments.find({ 'courseId': req.params.courseId });
  return res.status(200).json({ assessments: assessments }).end();
});

// Fetching Assesssments For Importing Internal Marks: MST, Assignments, and Quizes...
assessmentRoutes.get('/:courseId/cia-marks', async (req, res) => {
  const assessments = await Assessments.find({ 'courseId': req.params.courseId }).where('assessmentType').ne('ESE');
  return res.status(200).json({ assessments: assessments }).end();
});

// Fetching Assesssments For Importing External Marks: End Semester Examination (ESE)......
assessmentRoutes.get('/:courseId/ese-marks', async (req, res) => {
  const assessments = await Assessments.find({ 'courseId': req.params.courseId, 'assessmentType': 'ESE' });
  return res.status(200).json({ assessments: assessments }).end();
});

assessmentRoutes.post('/add-assessment', async (req, res) => {
  const assessment = new Assessments({ ...req.body });

  assessment.save((error, message) => {
    if (error) {
      return res.status(500).json({ response: null, error: error, message: "Something Went Wrong!! Please Try Again..." }).end();
    } else {
      return res.status(200).json({ response: message, error: null, message: 'Assessment Added Successfully' }).end();
    }
  });
});

assessmentRoutes.delete("/delete-assessment/:co_Id", (req, res) => {
  Assessments.findByIdAndDelete(req.params.co_Id, (err, msg) => {
    if (err) {
      return res.status(500).json({ ...err, message: "Something Went Wrong!!" }).end();
    } else {
      return res.status(200).json({ date: new Date(), message: "Assessment Delete successfully" }).end();
    }
  })
});

assessmentRoutes.put("/update-assessment/:id", (req, res) => {
  let query = {};
  for (let key in req.body) {
    if (key !== "_id") query[key] = req.body[key];
  }

  Assessments.findByIdAndUpdate(req.params.id, {
    $set: { ...query }
  }, { new: true }, (error, response) => {
    if (error) {
      return res.status(500).json({ ...error, message: "Something Went Wrong!!" }).end();
    } else {
      return res.status(200).json({ response: response, message: "Assessment Updated successfully" }).end();
    }
  })
});

module.exports = { assessmentRoutes };