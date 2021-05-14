const { Schema, model, SchemaTypes, connection } = require("mongoose");
const Student = require("./student");
const Classroom = require("./classroom");

const gradeSchema = new Schema({
  number: { type: Number, unique: true, required: true },
  students: [{ type: SchemaTypes.ObjectId, ref: "Student" }],
  teachers: { type: SchemaTypes.ObjectId, ref: "Teacher" },
});

let cache;
let studentId;


// check unique student in this Model // for addStudent
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
  const update = this._update;
  const studentId = update.$pull.students;
  const classroom = await Classroom.findOneAndUpdate(
    { students: studentId },
    update
  );
  console.log(classroom);
  next();
});

//////////////////////////////////////////////////////////////////////

// update curentGrade for Student
gradeSchema.post("save", async function (doc) {
  try {
    studentId = doc.students[0]
    await Student.findByIdAndUpdate(studentId, { curentGrade: doc._id });
  } catch (error) {
    throw error;
  }
});

const Grade = model("Grade", gradeSchema);

module.exports = Grade;
