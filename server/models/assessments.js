const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const Schema = mongoose.Schema;
const Model = mongoose.model;

const QuestionSchema = new Schema({
  coCode: { type: String, required: true },               // CO1
  bloomLevel: { type: String, required: true },
  questionNo: { type: String, required: true },           // Q1
  questionStatement: { type: String, required: true },    // a...z
  maximumMarks: { type: Number, required: true },          // 2 / 4 / 8
  obtainedMarks: { type: Schema.Types.Mixed, default: 0 }
}, {
  _id: false,
  id: false
}); 

const assessmentSchema = new Schema({
  curriculumId: { type: String },
  curriculumName: { type: String },
  termId: { type: String },
  termName: { type: String },
  termNo: { type: Number },
  courseTitle: { type: String },
  courseCode: { type: String },
  courseId: { type: String },
  assessmentType: { type: String }, // Written Test / Assignments / Quiz
  assessmentName: { type: String, required: true },
  questions: [QuestionSchema],
  totalMarks: { type: Number }
}, {
  timestamps: true,
  autoIndex: true
});

const Assessments = Model("assessments", assessmentSchema);
module.exports = { Assessments, QuestionSchema };