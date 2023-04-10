const termRoutes = require("express").Router();
const { Term } = require("./../models/term");

termRoutes.get('/', async (req, res) => {
    const terms = await Term.find();
    return res.status(200).json({ terms: terms }).end();
});

termRoutes.post('/addTerm', async (req, res) => {
    const term = new Term({ ...req.body });
    term.save((error, response) => {
        if(error) {
            return res.status(500).json({ response: null, error: error, message: "Unable To Add Term" }).end();
        } else {
            return res.status(200).json({ response: response, error: null, message: "Term Added Successfully" }).end();
        }
    })
});

termRoutes.delete("/delete-term/:termId", (req, res) => {
    Term.findByIdAndDelete(req.params.termId, (err, msg) => {
        if(err) {
            return res.status(500).json({ ...err, message: "Something Went Wrong!!" }).end();
        } else {
            return res.status(200).json({ date: new Date(), message: "Term Delete successfully" }).end();
        }
    })
});

termRoutes.put("/update-term/:_id", async (req, res) => {
    let query = {};
    for (let key in req.body) {
      if (key !== "_id") query[key] = req.body[key];
    }
  
    Term.findByIdAndUpdate(req.params._id, {
      $set: { ...query }
    }, { new: true }, (error, response) => {
      if (error) {
        return res.status(500).json({ ...error, message: "Something Went Wrong!!" }).end();
      } else {
        return res.status(200).json({ response: response, message: "Term Updated successfully" }).end();
      }
    })
  });

module.exports = { termRoutes };