const Model = require("mongoose").model;
mongoose.set('strictQuery', false);
const Schema = require("mongoose").Schema;
const Model = require("mongoose").model;

const studentSchema = new Schema({
  name: String,
  email: String,
  mobile: String,
  age: Number,
  tagline: String,
  student: Boolean,
});

const StudentModel = Model("students", studentSchema);

module.exports = { StudentModel };
