const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const Schema = mongoose.Schema;
const Model = mongoose.model;

const curriculumPOSchema = new Schema({
    curriculumId: { type: String },
    curriculumName: { type: String },
    // termId: { type: String },
    // termName: { type: String },
    // termNo: { type: Number },
    // courseTitle: { type: String },
    // courseId: { type: String },
    poCode: { type: String },
    // coType: { type: Number, default: 0 },
    poCodeStatement: { type: String },
    // classHrs : {type: Number, default: 0, },
    // labHrs: {type: Number, default: 0},
    // deliveryMethod: { type: String },
    // cognitiveDomain: { type: [String] }
}, {
    timestamps: true,
    autoIndex: true
});

const CurriculumPO = Model("curriculumPO", curriculumPOSchema);
module.exports = { CurriculumPO };