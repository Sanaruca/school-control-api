const { ObjectId } = require("mongoose").Types;
const DateScalar = require("./dateScalar");
const Grade = require("../models/grade");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Section = require("../models/section");
const Classroom = require("../models/classroom");

const findGrade = async (id) => {
  try {
    const grade = await Grade.findById(id);
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
    sections: async (_, { id }) =>
      await Section.find(id ? { _id: id } : {}).populate("grade"),
    classrooms: async (_, { id }) =>
      await Classroom.find(id ? { _id: id } : {})
        .populate({
          path: "section",
          populate: { path: "grade", populate: { path: "students" } },
        })
        .populate("students"),

    ///////////////////////////////////////////////////////////////

        getGrade: async (_,{number}) => await Grade.findOne({number}).populate("students"),
        getStudent: async (_,{ci}) => await Student.findOne({ci}).populate("currentGrade"),
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

    createSection: async (_, { input: data }) => {
      // --------
      const section = new Section(data);
      await section.save();
      const savedSection = await Section.findOne(section).populate("grade");
      return savedSection;
    },

    createClassroom: async (_, { sectionId: section }) => {
      const classroom = new Classroom({ section });
      const savedClassroom = await classroom.save();
      return await savedClassroom.populate("section").execPopulate();
    },

    ///////////////////////////////////////////////////////////////

    addStudentToGrade: async (_, { gradeId, studentId }) => {
      try {
        const grade = await findGrade(gradeId);
        grade.students.unshift(studentId);
        await grade.save();

        return await grade.populate("students").execPopulate();
      } catch (error) {
        throw error;
      }
    },

    addStudentToClassroom: async (_, { classroomId, studentId }) => {
      try {
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) throw new Error("'classroom' id not found");

        classroom.students.unshift(studentId);
        await classroom.save();

        return await classroom
          .populate("students")
          .populate("section")
          .execPopulate();
      } catch (error) {
        throw error;
      }
    },

    ///////////////////////////////////////////////////////////////

    removeStudentFromGrade: async (_, { gradeId, studentId }) => {
      try {
        const grade = await findGrade(gradeId);

        //? may be this is not necesary
        if (!grade.students.includes(studentId))
          throw new Error(
            "The 'student' ID is not found on list 'grade.students'"
          );

        await grade.update({ $pull: { students: studentId } });
        const student = await Student.findByIdAndUpdate(
          studentId,
          { $unset: { curentGrade: "" } },
          { new: true }
        );

        return student;
      } catch (error) {
        throw error;
      }
    },

    ///////////////////////////////////////////////////////////////
  },
};

module.exports = resolvers;
