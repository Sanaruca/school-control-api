const { Schema, model, SchemaTypes } = require("mongoose");

const schedule = new Schema({
  time: Number,
  weekday: {
    type: String,
    enum: [
      "Monday, Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      " Satruday",
      "Sunday",
    ],
  },
  subject: { type: SchemaTypes.ObjectId, ref: "Subject" },
  teacher: { type: SchemaTypes.ObjectId, ref: "Teacher" },
  start: Date, //hour
});

const scheduleSchema = new Schema({
  classroom: { type: SchemaTypes.ObjectId, ref: "Classroom" },
  schedule: [schedule],
});

module.exports = model("Schedule", scheduleSchema);
