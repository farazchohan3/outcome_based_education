const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
require("dotenv").config();

// const { routes } = require("./routes/demo");
const { authRoutes } = require("./routes/auth");
const { userRoutes } = require("./routes/userRoutes");
const { courseRoutes } = require("./routes/courseRoutes");
const { courseCORoutes } = require("./routes/courseCORoutes");
const { curriculumPORoutes } = require("./routes/curriculumPORoutes");
// const { curriculumPORoutes } = require("./routes/curriculumPORoutes")
const { curriculumRoutes } = require("./routes/curriculumRoutes");
const { termRoutes } = require("./routes/termRoutes");
const { assessmentRoutes } = require("./routes/assessmentRoutes");
const { attainmentRoutes } = require("./routes/attainmentRoutes");
const { surveyRoutes } = require("./routes/surveyRoutes");
const { totalCoAttainmentRoutes } = require("./routes/totalCoAttainmentRoutes");
const { poAttainmentRoutes } = require("./routes/poAttainment");
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors()); // Cross-Origin Resource Sharing (CORS) Middleware
app.use(morgan("dev")); // HTTP Request Logger Middleware for node.js
app.use(express.json()); // The express.json() function is a built-in middleware function in Express. It parses incoming requests with JSON payloads and is based on body-parser.
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use("/api", routes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/course-outcomes", courseCORoutes);
app.use("/program-outcomes", curriculumPORoutes);
app.use("/curriculums", curriculumRoutes);
app.use("/terms", termRoutes);
app.use("/assessments", assessmentRoutes);
app.use("/attainments", attainmentRoutes);
app.use("/surveys", surveyRoutes);
app.use("/totalcoattainments", totalCoAttainmentRoutes);
app.use("/co_po_mapping", poAttainmentRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_PROD_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("error", (err) => {
  console.log("err", err);
});

mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected");
});

// Base Route
app.get("/", (req, res) => {
  res.json({
    date: new Date(),
    port: PORT,
    dirName: __dirname,
  });
});

app.listen(PORT, () => console.log(`App Running On ${PORT}`));
