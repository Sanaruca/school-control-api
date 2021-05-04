const { Schema, model, SchemaTypes } = require("mongoose");

const subjectSchema = new Schema({
  teachers: [{type: SchemaTypes.ObjectId, ref: "Teacher"}],
	name: String,
	// Que classroom las ve
});

module.exports = model("Subject", subjectSchema);