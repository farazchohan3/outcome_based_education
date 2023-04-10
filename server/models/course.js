const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const Schema = mongoose.Schema;
const Model = mongoose.model;

const courseSchema = new Schema({
    curriculumId: { type: String },
    curriculumName: { type: String },
    termId: { type: String },
    termName: { type: String },
    termNo: { type: Number },
    courseDomain: { type: String }, //, required: true
    typeOfCourse: { type: String }, //Theory, Theory with Lab, Lab/Project Works/Others //, required: true
    courseCode: { type: String }, //, required: true
    courseTitle: { type: String}, //, required: true 
    courseAcronym: { type: String }, //, required: true 
    theoryCredits: { type: Number, default: 0 }, //, required: true,
    tutorialCredits: { type: Number, default: 0 }, //, required: true
    practicalCredits: { type: Number, default: 0 }, //, required: true
    totalCredits: { type: Number, default: 0 },
    totalCiaWeightage: { type: Number },
    totalTeeWeightage: { type: Number },
    totalWeightage: { type: Number },
    ciaPassingMarks: { type: Number },
    prerequisiteCourses: { type: String },
    courseOwner: { type: String },
    courseOwnerId: { type: String },
    reviewerDepartment: { type: String, required: true },
    courseReviewer: { type: String }, //, required: true
    lastDateToReview: { type: Date}, //, required: true 
    totalCourseConatactHours: { type: Number }, //, required: true
    totalCiaMarks: { type: Number }, //, required: true
    totalMidTermMarks: { type: Number}, //, required: true 
    totalTeeMarks: { type: Number}, //, required: true 
    totalAttendanceMarks: { type: Number, default: 0 },
    totalMarks: { type: Number },
    teeDuration: { type: Number }, //, required: true
    blommsDomain: { type: String },
    state: { type: Boolean }, //, default: true
    poMapId: { type: String, default: null}
}, {
    timestamps: true,
    autoIndex: true,
    strict: false
});


const Course = Model("courses", courseSchema);

module.exports = { Course };