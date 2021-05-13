const $studentsTable = document.querySelector(".students-table"),
  $btnGetStudents = document.querySelector("button.get-students");
///////////////////////////////////////////////////////////////////
const $gradesTable = document.querySelector(".grades-table"),
  $btnGetGrades = document.querySelector("button.get-grades");
///////////////////////////////////////////////////////////////////
const $classroomsTable = document.querySelector(".classrooms-table"),
  $btnGetClassrooms = document.querySelector("button.get-classrooms");

// fetch students and print on the table
$btnGetStudents.onclick = async () => await printStudnetsTable();
$btnGetGrades.onclick = async () => await printGradesTable();
$btnGetClassrooms.onclick = async () => await printClassroomsTable();

async function printClassroomsTable() {
  clearTableData($classroomsTable);
  const classrooms = await getClassrooms();
  console.log(classrooms);
  classrooms.forEach((classroom) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
    <td>${classroom.grade.number}</td>
    <td>${classroom.section}</td>
    `;
    classroom.students.forEach((student) => {
      console.log(student);
      newRow.innerHTML+= `<td>${student.first_name} ${student.last_name}</td>`;
    });

    $classroomsTable.appendChild(newRow);
  });
}

async function printStudnetsTable() {
  clearTableData($studentsTable);
  const students = await getStudents();
  console.log(students);
  students.forEach((student) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
    <td>${student.ci}</td>
    <td>${student.first_name} ${student.last_name}</td>
    <td>${student.curentGrade ? student.curentGrade.number : "not asigned"}</td>
    `;
    $studentsTable.appendChild(newRow);
  });
}

async function printGradesTable() {
  clearTableData($gradesTable);
  const grades = await getGrades();
  console.log(grades);
  grades.forEach((grade) => {
    const $gradeNumberTr = document.createElement("tr");
    $gradeNumberTr.innerHTML = `<td>${grade.number}</td>`;

    grade.students.forEach((student) => {
      $gradeNumberTr.innerHTML += `<td>${student.first_name} ${student.last_name}</td>`;
    });
    $gradesTable.appendChild($gradeNumberTr);
  });
}

function clearTableData(table) {
  const condition = table.children.length === 1;
  if (condition) return;
  table.deleteRow(1);
  clearTableData(table);
}

async function getStudents() {
  try {
    const students = await fetch("http://localhost:4000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
        query{
          students{
            ci
            first_name
            last_name
            curentGrade{
              number
            }
          }
        }
        `,
      }),
    });

    return (await students.json()).data.students;
  } catch (error) {
    console.error(error);
  }
}

async function getGrades() {
  try {
    const grades = await fetch("http://localhost:4000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
        query{
          grades {
            number
            students {
              first_name
              last_name
            }
          }
        }        
        `,
      }),
    });

    return (await grades.json()).data.grades;
  } catch (error) {
    console.error(error);
  }
}

async function getClassrooms() {
  try {
    const classrooms = await fetch("http://localhost:4000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
        query{
          classrooms{
            grade{
              number
            }
            section
            students{
              first_name
              last_name
            }
          }
        }        
        `,
      }),
    });

    return (await classrooms.json()).data.classrooms;
  } catch (error) {
    console.error(error);
  }
}
