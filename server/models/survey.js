const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const Schema = mongoose.Schema;
const Model = mongoose.model;

const RatingSchema = new Schema({
  coCode: { type: String, required: true },               // CO1
  coStatement: { type: String },    // a...z
  value: { type: Number, default: 0 },
  index: { type: Number, default: 0 }
}, {
  _id: false,
  id: false
}); 

const SurveySchema = new Schema({
  studentName: { type: String },
  urn: { type: Number },
  crn: { type: Number },
  curriculumId: { type: String },
  curriculumName: { type: String },
  termId: { type: String },
  termName: { type: String },
  termNo: { type: Number },
  courseTitle: { type: String },
  courseCode: { type: String },
  courseId: { type: String },
  rating: [RatingSchema],
}, {
  timestamps: true,
  autoIndex: true
});

const Survey = Model("surveys", SurveySchema);
module.exports = { Survey };