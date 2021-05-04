const { Schema, model, SchemaTypes } = require("mongoose");
const Secction = require("./secction");
const Student = require("./student");
const Grade = require("./grade");

const classroomSchema = new Schema({
  secction: { type: SchemaTypes.ObjectId, ref: "Secction", unique: true },
  students: [{ type: SchemaTypes.ObjectId, ref: "Student" }],
  schedule: { type: SchemaTypes.ObjectId, ref: "Schedule" },
  //isFavorite: Boolean,
});

let cache;
// check secction ID is foud
classroomSchema.pre("save", async function () {
  const secctionIsFound = (cache = await Secction.findById(this.secction));
  if (!secctionIsFound) throw new Error("The 'secction' ID is not found");
});

let studentId;
// check student exist
classroomSchema.pre("save", async function () {
  try {
    if (!this.students.length) return;

    studentId = this.students[0];
    const isFoud = await Student.findById(studentId);
    
    if (!isFoud) throw new Error("'student' ID not foud");
  } catch (error) {
    throw error;
  }
});

// check student is already on the list of grade.students
classroomSchema.pre("save", async function () {
  if (!this.students.length) return;
  
  const isOnGradeList = (await Grade.findById(cache.grade)).students.includes(studentId);

  if(!isOnGradeList) throw new Error("'student' ID is not on 'Grade List'");

});

const Classroom = model("Classroom", classroomSchema);
module.exports = Classroom;
