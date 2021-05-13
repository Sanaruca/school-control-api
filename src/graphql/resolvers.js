const { ObjectId } = require("mongoose").Types;
const DateScalar = require("./dateScalar");
const Grade = require("../models/grade");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Classroom = require("../models/classroom");

const findGrade = async (number) => {
  try {
    const grade = await Grade.findOne({ number });
    if (!grade) throw new Error("Grade not found");
    return grade;
  } catch (error) {
    throw error;
  }
};

const resolvers = {
  Date: DateScalar,
  Query: {
    grades: async (_, { id }) => {
      try {
        const grades = await Grade.find().populate("students");
        if (id) return await Grade.findById(id).populate("students");

        return grades;
      } catch (error) {
        throw new Error(error);
      }
    },
    students: async (_, { id }) =>
      await Student.find(id ? { _id: id } : {}).populate("curentGrade"),
    teachers: async (_, { id }) => await Teacher.find(id ? { _id: id } : {}),
    classrooms: async (_, { id }) =>
      await Classroom.find(id ? { _id: id } : {})
        .populate({ path: "grade", populate: { path: "students" } })
        .populate("students"),

    ///////////////////////////////////////////////////////////////

    getGrade: async (_, { number }) =>
      await Grade.findOne({ number }).populate("students"),
    getStudent: async (_, { ci }) =>
      await Student.findOne({ ci }).populate("currentGrade"),
    // getClassroom: async (_,{ci}) => await Student.findOne({ci}).populate("currentGrade")
  },

  Mutation: {
    createGrade: async (_, { number }) => {
      const grade = new Grade({ number });
      const dataSaved = await grade.save();
      return dataSaved;
    },

    createStudent: async (_, { input: data }) => {
      const student = new Student(data);
      const savedStudent = await student.save();
      return savedStudent;
    },

    createTeacher: async (_, { input: data }) => {
      const teacher = new Teacher(data);
      return await teacher.save();
    },

    createClassroom: async (_, { gradeNumber, section }) => {
      //-----------------------
      try {
        const grade = await Grade.findOne({ number: gradeNumber });
        if (!grade) throw new Error("grade not found");

        const classroom = new Classroom({ section, grade: grade.id });
        const savedClassroom = await classroom.save();
        return await savedClassroom;
      } catch (error) {
        throw error;
      }
    },

    ///////////////////////////////////////////////////////////////

    addStudentToGrade: async (_, { gradeNumber, studentCI }) => {
      //------------------------------------
      try {
        const student = await Student.findOne({ ci: studentCI });
        if (!student) throw new Error("Student not found");
        const grade = await findGrade(gradeNumber);
        grade.students.unshift(student.id);
        await grade.save();

        return await grade.populate("students").execPopulate();
      } catch (error) {
        throw error;
      }
    },

    addStudentToClassroom: async (_, { gradeNumber, section, studentCI }) => {
      try {
        const grade = await findGrade(gradeNumber),
          student = await Student.findOne({ ci: studentCI });
        if (!student) throw new Error("student not found");
        const classroom = await Classroom.findOneAndUpdate(
          { grade: grade.id, section },
          { $addToSet: { students: student.id } },
          { new: true }
        );

        return await classroom.populate("students").execPopulate();
      } catch (error) {
        throw error;
      }
    },

    ///////////////////////////////////////////////////////////////

    removeStudentFromGrade: async (_, { gradeNumber, studentCI }) => {
      try {
        const grade = await findGrade(gradeNumber);
        const student = await Student.findOne({ ci: studentCI });

        if (!student) throw new Error("Student not found");
        if(!grade.students.includes(student.id)) throw new Error("The estudent is not in grade "+ gradeNumber);

        await grade.update({ $pull: { students: student.id } });

        await student.update({ $unset: { curentGrade: "" } });

        return { ...student._doc, curentGrade: { number: -1 } };
      } catch (error) {
        throw error;
      }
    },

    ///////////////////////////////////////////////////////////////
  },
};

module.exports = resolvers;
