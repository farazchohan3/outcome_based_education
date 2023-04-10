const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const Schema = mongoose.Schema;
const Model = mongoose.model;

const UserSchema = new Schema({
  title: { type: String,  default: "Mr." },
  firstName: { type: String, required: [true, "First Name is Required"] },
  lastName: { type: String, required: true },
  email: { type: String, required: [true, "Email is Required"] },
  password: { type: String, required: [true, "Password is Required"], minlength: [6, "Minimum 6 Characters"] },
  department: { type: String, default: "Information Technology" },
  qualification: { type: String },
  superAdmin: { type: Boolean, default: false },
  designation: { type: String, default: "Assistant Professor" },
  expirence: { type: Number },
  dateOfJoining: { type: Date, default: null },
  dob: { type: Date, default: null },
  gender: { type: String },
  mobile: { type: String }
}, {
  timestamps: true,
  autoIndex: true,
});

const User = Model("users", UserSchema);
module.exports = { User };


// Math.random().toString(20).substr(2, 8)
/**
 * curriculumsHashcode
 * courses
 * coursesHashcode 
 */
