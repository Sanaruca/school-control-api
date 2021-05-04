const { Schema, model, SchemaTypes } = require("mongoose");

const teacherSchema = new Schema({
  first_name: String,
	last_name: String,
	joined: Date,
	left: Date,
	ci: {type:Number, unique: true},
	assigned_subjects: [{type: SchemaTypes.ObjectId, ref:"Subject"}],
});

module.exports = model("Teacher", teacherSchema);