const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const { TermSchema } = require("./term");
const Schema = mongoose.Schema;
const Model = mongoose.model;

const CurriculumSchema = new Schema({
    curriculumName: { type: String, required: true },
    curriculumOwner: { type: String },   // user name
    curriculumOwnerId: { type: String }, // userId
    deptName: { type: String },
    credits: { type: Number, default: 0 },
    state: { type: Boolean, default: true },
    minDuration: { type: Number, default: 0 },
    maxDuration: { type: Number, default: 0 },
    totalTerms: { type: Number, default: 0 },
    startYear: { type: Number },
    endYear: { type: Number }
}, {
    timestamps: true,
    autoIndex: true
});

const Curriculum = Model("curriculum", CurriculumSchema);
module.exports = { Curriculum, CurriculumSchema };

/**
 * Curriculum Schema (Batch)
 * 
 * batchId
 * curriculumName
 * deptName
 * deptId
 * credits (total)
 * state (active/in-active) -> boolean
 * minDuration (years) -> number
 * maxDuration (years) -> number
 * totalTerms -> number
 * termsHashcode -> string[] => term id's
 * userIdHashcode -> string[]
 */

/**
 * Term Schema (semester)
 * 
 * _id
 * termName
 * termNumber
 * curriculumName
 * curriculumId
 * deptName
 * deptId
 * state
 * 
 */