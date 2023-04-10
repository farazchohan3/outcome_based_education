const curriculumPORoutes = require("express").Router();
const { CurriculumPO } = require("../models/curriculum-po");

curriculumPORoutes.get('/:curriculumId', async (req, res) => {
  const curriculumsCO = await CurriculumPO.find({ 'curriculumId': req.params.curriculumId });
  return res.status(200).json({ curriculumPO: curriculumsCO }).end();
});

// batchBORoutes.get('/:courseId/theory-cos', async (req, res) => {
//   const batchesBO = await CourseCO.find({ 'courseId': req.params.courseId, 'coType': 0 });
//   return res.status(200).json({ batchesBO: batchesBO }).end();
// });

curriculumPORoutes.post('/add-po', async (req, res) => {
  const curriculumCO = new CurriculumPO({ ...req.body });

  curriculumCO.save((error, message) => {
    if (error) {
      return res.status(500).json({ response: null, error: error, message: "Something Went Wrong!! Please Try Again..." }).end();
    } else {
      return res.status(200).json({ response: message, error: null, message: 'Course Outcome Added Successfully' }).end();
    }
  });
});

curriculumPORoutes.delete("/delete-po/:po_Id", (req, res) => {
  CurriculumPO.findByIdAndDelete(req.params.po_Id, (err, msg) => {
    if (err) {
      return res.status(500).json({ ...err, message: "Something Went Wrong!!" }).end();
    } else {
      return res.status(200).json({ date: new Date(), message: "Course Outcome Delete successfully" }).end();
    }
  })
});

curriculumPORoutes.put("/update-po/:id", (req, res) => {
  let query = {};
  for (let key in req.body) {
    if (key !== "_id") query[key] = req.body[key];
  }

  CurriculumPO.findByIdAndUpdate(req.params.id, {
    $set: { ...query }
  }, { new: true }, (error, response) => {
    if (error) {
      return res.status(500).json({ ...error, message: "Something Went Wrong!!" }).end();
    } else {
      return res.status(200).json({ response: response, message: "Course Outcome Updated successfully" }).end();
    }
  })
});

module.exports = { curriculumPORoutes };