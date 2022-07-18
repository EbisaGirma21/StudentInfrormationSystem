const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/studentList", {
  useNewUrlParser: true,
});

const studentSchema = {
  firstName: String,
  lastName: String,
};



const Student = mongoose.model("Student", studentSchema);

const stud1 = new Student({
  firstName: "Melkamu",
  lastName: "Abraraw",
});
const stud2 = new Student({
  firstName: "Eyader",
  lastName: "Tsehayu",
});
const stud3 = new Student({
  firstName: "Eyob",
  lastName: "Kefale",
});

const defalutStudent = [stud1, stud2, stud3];

app.get("/", function (req, res) {
  Student.find({}, function (err, foundStudents) {
    if (foundStudents.length === 0) {
      Student.insertMany(defalutStudent, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default students to database ");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { newStudentList: foundStudents });
    }
  });
});

app.post("/", function (req, res) {
  const studFirstName = req.body.newFirstName;
  const studLastName = req.body.newLastName;
  const student = new Student({
    firstName: studFirstName,
    lastName: studLastName,
  });
  student.save();
  res.redirect("/");
});
app.post("/delete", function (req, res) {
  const checkedStudentId = req.body.deleteBtn;

  Student.findByIdAndRemove(checkedStudentId, function (err) {
    if (!err) {
      console.log("Successfully deleted checked student");
      res.redirect("/");
    }
  });
});
app.post("/update", function (req, res) {
  const checkedStudentId = req.body.updateBtn;
  const studFirstName = req.body.newFirstName;
  const studLastName = req.body.newLastName;
  Student.findByIdAndUpdate(
    checkedStudentId,
    { $set: { lastName: studLastName } },
    function (err) {
      if (!err) {
        console.log("Successfully updated checked student");
        res.redirect("/");
      }
    }
  );
});

app.listen(8080, function () {
  console.log("8080");
});
