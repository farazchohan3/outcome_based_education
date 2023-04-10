const attainmentRoutes = require("express").Router();
const { CIA_Marks, ESE_Marks } = require("./../models/attainment");

// Fetching All Marks of Internal and External
attainmentRoutes.get('/:courseId', async (req, res) => {
  const ciaMarks = await CIA_Marks.find({ 'courseId': req.params.courseId });
  const eseMarks = await ESE_Marks.find({ 'courseId': req.params.courseId });
  return res.status(200).json({ ciaMarks: ciaMarks, eseMarks: eseMarks }).end();
});

// For Viewing Marks of Student of Particular Assessment
attainmentRoutes.get('/:courseId/:assessmentId', async (req, res) => {
  const attainment = await ((req.query?.ciaBool === 'true') ? CIA_Marks : ESE_Marks).find({ 
    'courseId': req.params.courseId,
    'assessmentId': req.params.assessmentId
  });
  return res.status(200).json({ attainments: attainment }).end();
});
  
attainmentRoutes.post('/add-student-marks', async (req, res) => {
  const { data } = { ...req.body };
  ((req.query?.ciaBool === 'true') ? CIA_Marks : ESE_Marks).insertMany([ ...data ]) 
    .then((response) => {
      return res.status(200).json({ response: response, error: null, message: 'Student Marks Imported Successfully' }).end();
    })
    .catch((error) => {
      return res.status(500).json({ response: null, error: error, message: "Something Went Wrong!! Please Try Again..." }).end();
    })
  
  // return res.status(200).json({ date: new Date() }).end();
});

module.exports = { attainmentRoutes }