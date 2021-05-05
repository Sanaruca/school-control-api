const { ObjectId } = require("mongoose").Types;
const DateScalar = require("./dateScalar");
const Grade = require("../models/grade");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Secction = require("../models/secction");
const Classroom = require("../models/classroom");

module.exports = {
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
    students: async (_, { id }) => await Student.find(id ? { _id: id } : {}).populate("curentGrade"),
    teachers: async (_, { id }) => await Teacher.find(id ? { _id: id } : {}),
    secctions: async (_, { id }) =>
      await Secction.find(id ? { _id: id } : {}).populate("grade"),
    classrooms: async (_, { id }) =>
      await Classroom.find(id ? { _id: id } : {})
        .populate({
          path: "secction",
          populate: { path: "grade", populate: { path: "students" } },
        })
        .populate("students"),
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

    createSecction: async (_, { input: data }) => {
      // --------
      const secction = new Secction(data);
      await secction.save();
      const savedSecction = await Secction.findOne(secction).populate("grade");
      return savedSecction;
    },

    createClassroom: async (_, { secctionId: secction }) => {
      const classroom = new Classroom({ secction });
      const savedClassroom = await classroom.save();
      return await savedClassroom.populate("secction").execPopulate();
    },

    ///////////////////////////////////////////////////////////////

    addStudentToGrade: async (_, { gradeId, studentId }) => {
      try {
        const grade = await Grade.findById(gradeId);
        if (!grade) throw new Error("Grade not found");
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
          .populate("secction")
          .execPopulate();
      } catch (error) {
        throw error;
      }
    },
  },
};
