const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const { QuestionSchema } = require("./assessments");
const Schema = mongoose.Schema;
const Model = mongoose.model;

const MarksSchema = new Schema({
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
  assessmentId: { type: String },
  assessmentType: { type: String }, // Written Test / Assignments / Quiz
  assessmentName: { type: String, required: true },
  questions: [QuestionSchema],
  totalMarks: { type: Number },
  totalObtainedMarks: { type: Number }
}, {
  timestamps: true,
  autoIndex: true
});

MarksSchema.index("createdAt")

const CIA_Marks = Model("cia_marks", MarksSchema);
const ESE_Marks = Model("ese_marks", MarksSchema);

module.exports = { CIA_Marks, ESE_Marks };