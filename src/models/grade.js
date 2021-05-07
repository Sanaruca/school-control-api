const { Schema, model, SchemaTypes } = require("mongoose");
const Student = require("./student");
const Classroom = require("./classroom");

const gradeSchema = new Schema({
  number: { type: Number, unique: true, required: true },
  students: [{ type: SchemaTypes.ObjectId, ref: "Student" }],
  teachers: { type: SchemaTypes.ObjectId, ref: "Teacher" },
});

let cache;
let studentId;

// check Student is found // for addStudent
gradeSchema.pre("save", async function () {
  try {
    if (!this.students.length) return;

    studentId = this.students[0];

    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student id not found");
  } catch (error) {
    throw error;
  }
});

// check unique student in Model // for addStudent
gradeSchema.pre("save", async function () {
  try {
    if (!this.students.length) return;

    const isFound = await Grade.findOne({ students: this.students[0] });
    if (isFound) throw new Error("Student is already on the list");
  } catch (error) {
    throw error;
  }
});

//////////////////////////////////////////////////////////////////////

// delete student from classroom.students
gradeSchema.pre("update", async function (next) {
  console.log("-------------------------------------------")
  const studentId = this._update.$pull.students;
  console.log(studentId)
  console.log("-------------------------------------------")
  const classroom = await Classroom.findOne()
  console.log(classroom)
  next()
})

//////////////////////////////////////////////////////////////////////

// update curentGrade for Student
gradeSchema.post("save", async function (doc) {
  try {
    await Student.findByIdAndUpdate(studentId, {curentGrade: doc._id})
  } catch (error) {
    throw error;
  }
});

const Grade = model("Grade", gradeSchema);

module.exports = Grade;
