const { Schema, model, SchemaTypes, Types, connection } = require("mongoose"),
  { ObjectId } = Types;
const Student = require("./student");

const classroomSchema = new Schema({
  grade: { type: SchemaTypes.ObjectId, ref: "Grade" },
  students: [{ type: SchemaTypes.ObjectId, ref: "Student" }],
  schedule: { type: SchemaTypes.ObjectId, ref: "Schedule" },
  section: {
    type: String,
    minLength: 1,
    maxLength: 1,
    uppercase: true,
    trim: true,
  },
  //isFavorite: Boolean,
});

let cache;
let studentId;

// verify if section's letter will not to duplicate for a grade
classroomSchema.pre("save", async function () {
  try {
    const willDuplicate = await Classroom.findOne({
      grade: this.grade,
      section: this.section,
    });

    if (willDuplicate)
      throw new Error(
        "section's letter cannot be duplicate for a grade, " +
          "section's letter must be unique for a grade"
      );
  } catch (error) {
    throw error;
  }
});

// check if classroom exist and if the student is already asigned in a some classroom
classroomSchema.pre("findOneAndUpdate", async function () {
  try {
    const { _update, _conditions } = this;
    // this is for this be omited when the update begin from "removeStudenfromGrade"
    if (_update.hasOwnProperty("$pull")) return;
    const { students } = _update.$addToSet;
    studentId = students;
    const classroom = (cache = await Classroom.findOne(_conditions)),
      isAsigned = await Classroom.findOne({ students }).populate(
        "grade",
        "number"
      );

    if (!classroom) throw new Error("classroom not found");
    if (isAsigned)
      throw new Error(
        "Student is already asigned in grade " +
          isAsigned.grade.number +
          ` section '${isAsigned.section}'`
      );
  } catch (error) {
    throw error;
  }
});

// verify if student is on the gade.students to be added in this list of students by classroom.students
classroomSchema.pre("findOneAndUpdate", async function () {
  try {
    const { _update } = this;
    // this is for this be omited when the update begin from "removeStudenfromGrade"
    if (_update.hasOwnProperty("$pull")) return;

    const grade = await connection
      .collection("grades")
      .findOne({ _id: ObjectId(cache.grade) });
    if (!grade.students.length)
      throw new Error("There are not students in this grade");

    // includes the grade the studentId?
    const isIncludes = grade.students.some((id) => id.toString() === studentId);
    if (!isIncludes)
      throw new Error("Student is not included in grade " + grade.number);
  } catch (error) {
    throw error;
  }
});

const Classroom = model("Classroom", classroomSchema);
module.exports = Classroom;
