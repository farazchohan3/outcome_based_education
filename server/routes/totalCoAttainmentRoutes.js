const totalCoAttainmentRoutes = require("express").Router();
const { FinalCoAttainment } = require("./../models/totalCoAttainment");

totalCoAttainmentRoutes.get('/:courseId', async (req, res) => {
    const finalCoAttainment = await FinalCoAttainment.find({ 'courseId': req.params.courseId });
    return res.status(200).json({ finalCoAttainment: finalCoAttainment }).end();
});

totalCoAttainmentRoutes.post('/add-total-co-attainment', async (req, res) => {
    const totalCOAttain = new FinalCoAttainment({ ...req.body });

    totalCOAttain.save((error, message) => {
        if (error) {
            return res.status(500).json({ response: null, error: error, message: "Something Went Wrong!! Please Try Again..." }).end();
        } else {
            return res.status(200).json({ response: message, error: null, message: 'Total Co Attainment Added Successfully' }).end();
        }
    });
});

module.exports = { totalCoAttainmentRoutes };