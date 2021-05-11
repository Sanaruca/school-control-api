const { Schema, model, SchemaTypes, connection, Types } = require("mongoose"),
  { ObjectId } = Types;

const sectionSchema = new Schema({
  l: { type: String, minLength: 1, maxLength: 1, uppercase: true, trim: true },
  grade: { type: SchemaTypes.ObjectId, ref: "Grade" },
});

// check grade field is found
sectionSchema.pre("save", async function () {

  const isFoud = await connection
    .collection("grades")
    .findOne({ _id: ObjectId(this.grade) });

  if (!isFoud) throw new Error("'grade' field not foud");
});

// check field is already assigned
sectionSchema.pre("save", async function () {
  const isAssigned = await Section.findOne({ l: this.l, grade: this.grade });

  if (isAssigned)
    throw new Error("The 'l' field is already assigned to the 'grade' field");
});

const Section = model("Section", sectionSchema);

module.exports = Section;