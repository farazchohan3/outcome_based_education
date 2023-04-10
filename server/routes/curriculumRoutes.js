const curriculumRoutes = require("express").Router();
const { Curriculum } = require("./../models/curriculum");
const { Term } = require("./../models/term");

curriculumRoutes.get('/', async (req, res) => {
    let curriculums = await Curriculum.find();
    curriculums = await Promise.all(curriculums.map(async (ele) => {
        const terms = await Term.find().where('curriculumId').equals(ele._id.toString());
        ele['_doc']['terms'] = terms || [];
        return ele;
    }));
    return res.status(200).json({ curriculums: curriculums }).end();
});

curriculumRoutes.post('/add-curriculum', async (req, res) => {
    const curriculum = new Curriculum({ ...req.body });
    curriculum.save((error, response) => {
        if(error) {
            return res.status(500).json({ response: null, error: error, message: "Unable To Add Curriculum" }).end();
        } else {
            return res.status(200).json({ response: response, error: null, message: "Curriculum Added Successfully" }).end();
        }
    })
});

curriculumRoutes.delete("/delete/:curriculumId", (req, res) => {
    Curriculum.findByIdAndDelete(req.params.curriculumId, (err, msg) => {
        if(err) {
            return res.status(500).json({ ...err, message: "Something Went Wrong!!" }).end();
        } else {
            return res.status(200).json({ date: new Date(), message: "Curriculum Delete successfully" }).end();
        }
    })
});


curriculumRoutes.put("/update-curriculum/:curriculumId", async (req, res) => {
    let query = {};
    for (let key in req.body) {
      if (key !== "curriculumId") query[key] = req.body[key];
    }
  
    Curriculum.findByIdAndUpdate(req.params.curriculumId, {
      $set: { ...query }
    }, { new: true }, (error, response) => {
      if (error) {
        return res.status(500).json({ ...error, message: "Something Went Wrong!!" }).end();
      } else {
        return res.status(200).json({ response: response, message: "Batch Updated successfully" }).end();
      }
    })
  });




module.exports = { curriculumRoutes };