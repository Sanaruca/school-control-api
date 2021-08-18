const { Schema, model, SchemaTypes } = require("mongoose");

const studentSchema = new Schema({
  first_name: String,
  last_name: String,
  ci: {type: Number, unique: true},
  joined: Date,
  graduate: Date, //o no egresado en esta escuala
  notes: { type: SchemaTypes.ObjectId, ref: "Rating" },
  curentGrade: {type: SchemaTypes.ObjectId, ref: "Grade"}
});

studentSchema.virtual("fullname").get(function(){
  return `${this.first_name} ${this.last_name}`
})

module.exports = model("Student", studentSchema);
