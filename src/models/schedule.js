const { Schema, SchemaTypes } = require("mongoose");

function isTimeHHMM(value) {
  return /^\d{2}:[0-5]\d$/.test(value);
}

const classSchema = new Schema(
  {
    subject: String, //{ type: SchemaTypes.ObjectId, ref: "Subject" },
    teacher: Number, //{ type: SchemaTypes.ObjectId, ref: "Teacher" },
    duration: {
      type: String,
      uppercase: true,
      trim: true,
      validate: {
        validator: isTimeHHMM,
        message: ({ value }) => `${value} is not a valid time`,
      },
      default: "01:30",
    },
    start: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      validate: {
        validator: function (value) {
          if (isTimeHHMM(value.slice(0, -2))) {
            return /^[AP]M$/.test(value.slice(-2));
          }
          return false;
        },
        message: ({ value }) => `${value} is not a valid time`,
      },
    },
  },
  { _id: false }
);

///////////////////////////////////////////////////////////////////////////

// classSchema.pre("save", function(){
//   console.log(this)
//   console.log("---------------------------here---------------------------")
// })

///////////////////////////////////////////////////////////////////////////

const schedule = new Schema({
  monday: [{ type: classSchema, default: () => ({}) }],
  tuesday: [{ type: classSchema, default: () => ({}) }],
  wednesday: [{ type: classSchema, default: () => ({}) }],
  thursday: [{ type: classSchema, default: () => ({}) }],
  friday: [{ type: classSchema, default: () => ({}) }],
  satruday: [{ type: classSchema, default: () => ({}) }],
  sunday: [{ type: classSchema, default: () => ({}) }],
});

///////////////////////////////////////////////////////////////////////////

// check 
schedule.pre("save", async function(){
  try {
    console.log("---------------------------one---------------------------")
    console.log(this)

    throw new Error("aaaaaaaaaaaaaaaaaa")
    
  } catch (error) {
    throw error
  }
  next()
})

schedule.pre("update", async function(){
  try {
    console.log("---------------------------one---------------------------")
    console.log(this)

    throw new Error("bbbbbbbbbbb")
    
  } catch (error) {
    throw error
  }
  next()
})

///////////////////////////////////////////////////////////////////////////

module.exports = schedule;
