const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Schema = mongoose.Schema;
const Model = mongoose.model;

const CommonSchemma = new Schema(
  {
    curriculumId: { type: String },
    curriculumName: { type: String },
    termId: { type: String },
    termName: { type: String },
    termNo: { type: Number },
    courseTitle: { type: String },
    courseCode: { type: String },
    courseId: { type: String },
  },
  {
    timeStamp: true,
    autoIndex: true,
    strict: false,
  }
);

CommonSchemma.index("createdAt");

const FinalCoAttainment = Model("total_Co_Attainment", CommonSchemma);
const CO_PO_Mapping = Model("co_po_mapping", CommonSchemma);

module.exports = { FinalCoAttainment, CO_PO_Mapping };
