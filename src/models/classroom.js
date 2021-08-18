const { Schema, model, SchemaTypes, Types, connection } = require("mongoose"),
  { ObjectId } = Types,
  schedule = require("./schedule");
const Student = require("./student");

const classroomSchema = new Schema({
  grade: { type: SchemaTypes.ObjectId, ref: "Grade" },
  students: [{ type: SchemaTypes.ObjectId, ref: "Student" }],
  section: {
    type: String,
    minLength: 1,
    maxLength: 1,
    uppercase: true,
    trim: true,
  },
  schedule: { type: schedule, default: () => ({}) },
  //isFavorite: Boolean,
});

let cache;
let studentId;

classroomSchema.pre("update", async function () {
  try {
    const { _update } = this,
      { weekday } = _update,
      content = _update.schedule[weekday],
      added = content.shift(),
      doc = await this.exec("findOne");

    console.log("----------update middelware-------1111111---------");
    console.log(weekday + ":", content);
    console.log("---------update middelware--------2222222----------");
    console.log(added);
    console.log("---------update middelware--------33333333---------");
    console.log(content);

    content.forEach((classBlock) => {
      const { duration, start } = classBlock,
        timeStartAsArray = toggleHourFormat(start).split(":"),
        hourStart = timeStartAsArray[0],
        minuteStart = timeStartAsArray[1],
        startTimeAsNumber = Number(hourStart + "." + minuteStart);

      const timeStartForAddedAsArray = toggleHourFormat(added.start).split(":"),
        hourStartForAdded = timeStartForAddedAsArray[0],
        minuteStartForAdded = timeStartForAddedAsArray[1],
        startTimeForAddedAsNumber = Number(hourStartForAdded + "." + minuteStartForAdded);

      /////
      let h = `${Number(duration.substr(0, 2)) + Number(start.substr(0, 2))}`,
        m = `${Number(start.substr(3, 2)) + Number(duration.substr(-2))}`;
      h = h.length < 2 ? "0" + h : h;
      m = m.lengtm < 2 ? "0" + m : m;

      /////
      let h2 = `${Number(added.duration.substr(0, 2)) + Number(added.start.substr(0, 2))}`,
      m2 = `${Number(added.start.substr(3, 2)) + Number(added.duration.substr(-2))}`;
      h2 = h2.length < 2 ? "0" + h2 : h2;
      m2 = m2.lengtm < 2 ? "0" + m2 : m2;
      /////
      let endingTimeForAdedd = toggleHourFormat(`${h2}:${m2}${added.start.substr(-2)}`);
      // console.log("-------------",endingTimeForAdedd)
      // endingTimeForAdedd = toggleHourFormat(endingTimeForAdedd);
      // endingTimeForAdedd = endingTimeForAdedd.replace(/[\s.]/g, "").toUpperCase();

      let endingTimeForAdeddAsArray =  endingTimeForAdedd.split(":"),
      endingHourForAdedd = endingTimeForAdeddAsArray[0],
      endingMinutesForAdedd = endingTimeForAdeddAsArray[1],
      endingTimeForAdeddAsNumber = Number(endingHourForAdedd+"."+endingMinutesForAdedd);
      /////

      let endingTime = toggleHourFormat(`${h}:${m}${start.substr(-2)}`);
      // endingTime = toggleHourFormat(endingTime);
      // endingTime = endingTime.replace(/[\s.]/g, "").toUpperCase();

      let endingTimeAsArray =  endingTime.split(":"),
      endingHour = endingTimeAsArray[0],
      endingMinutes = endingTimeAsArray[1],
      endingTimeAsNumber = Number(endingHour+"."+endingMinutes);

      const test = startTimeForAddedAsNumber >= endingTimeAsNumber || startTimeAsNumber >= endingTimeForAdeddAsNumber;

      console.log("added:",added.start,endingTimeForAdedd);
      console.log("added:",startTimeForAddedAsNumber, endingTimeForAdeddAsNumber);

      console.log(start,endingTime);
      console.log(startTimeAsNumber, endingTimeAsNumber);

      if(!test) throw new Error("This class block cannot be added");
    });
    
    content.unshift(added)
    
    // throw new Error("---------");
    
  } catch (error) {
    throw error;
  }
});

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

// logicg
////////////////////////////////////////////////////////////////////////////////////////////////

function replaceStringBetween(origin, startIndex, endIndex, insertion) {
  return (
    origin.substring(0, startIndex) + insertion + origin.substring(endIndex)
  );
}

function toggleHourFormat(hours) {
  if (hours.length === 7) {
    let meridiem = hours.substr(-2);
    switch (meridiem) {
      case "AM":
        return new Date(
          0,
          0,
          0,
          Number(hours.substr(0, 2)),
          Number(hours.substr(3, 2))
        )
          .toTimeString()
          .substr(0, 5);
        break;

      case "PM":
        return new Date(
          0,
          0,
          0,
          Number(hours.substr(0, 2)) + 12,
          Number(hours.substr(3, 2))
        )
          .toTimeString()
          .substr(0, 5);
        break;
    }
  } else {
    let hhmm = hours.split(":");
    let h = new Date(
      0,
      0,
      0,
      Number(hhmm[0]),
      Number(hhmm[1])
    ).toLocaleTimeString();
    let test = h.split(":")[0].length < 2 ? "0" + h : h;
    return replaceStringBetween(test, 5, 9, "");
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////

const Classroom = model("Classroom", classroomSchema);
module.exports = Classroom;
