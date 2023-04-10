const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const Schema = mongoose.Schema;
const Model = mongoose.model;

const courseCOSchema = new Schema({
    curriculumId: { type: String },
    curriculumName: { type: String },
    termId: { type: String },
    termName: { type: String },
    termNo: { type: Number },
    courseTitle: { type: String },
    courseId: { type: String },
    coCode: { type: String, required: true },
    coType: { type: Number, default: 0 },
    coCodeStatement: { type: String, required: true },
    classHrs : {type: Number, default: 0, },
    labHrs: {type: Number, default: 0},
    deliveryMethod: { type: String },
    cognitiveDomain: { type: [String] }
}, {
    timestamps: true,
    autoIndex: true
});

const CourseCO = Model("coursesCO", courseCOSchema);
module.exports = { CourseCO };