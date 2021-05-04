const { Schema, model, SchemaTypes } = require("mongoose");
const Student = require("./student");

const gradeSchema = new Schema({
  number: { type: Number, unique: true, required: true },
  students: [{ type: SchemaTypes.ObjectId, ref: "Student" }],
  teachers: { type: SchemaTypes.ObjectId, ref: "Teacher" },
});

let cache;

// check Student is found
gradeSchema.pre("save", async function () {
  try {
    console.log(this);
    if (!this.students.length) return;

    const studentId = this.students[0];

    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student id not found");

  } catch (error) {
    throw error;
  }
});

// check unique student in doc // for update
gradeSchema.pre("save", async function () {
  try {
    if (!this.students.length) return;

    const isFound = await Grade.findOne({ students: this.students[0] });
    if (isFound) throw new Error("Student is already on the list");

  } catch (error) {
    throw error;
  }
});

const Grade = model("Grade", gradeSchema);

module.exports = Grade;
