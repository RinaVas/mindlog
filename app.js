// Imports -------------------------------------------
import express from "express";
import database from "./database.js";

// Configure express app -----------------------------
const app = new express();

// Query Handler ------------------------------------
const handleQuery = async (res, sql, params = []) => {
  try {
    const [result] = await database.query(sql, params);
    if (!result || result.length === 0)
      return res.status(400).json({ message: "No record(s) found." });
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Error executing query: ${error.message}` });
  }
};

const usersController = async (req, res) => {
  const uid = req.params.uid;
  const table = `Users LEFT JOIN UserTypes ON Users.userUserTypeID = UserTypes.userTypeID`;
  const fields = [
    "Users.userID",
    "Users.userFirstName",
    "Users.userLastName",
    "Users.userPhone",
    "Users.userEmail",
    "Users.userAddressLineOne",
    "Users.userAddressLineTwo",
    "Users.userPostcode",
    "Users.userUserTypeID",
    "UserTypes.userTypeName AS userTypeName",
  ];
  const whereField = "Users.userID = ?";

  let sql = `SELECT ${fields} FROM ${table}`;
  const params = [];
  if (uid) {
    sql += ` WHERE ${whereField}`;
    params.push(uid);
  }
  return handleQuery(res, sql, params);
};

const userTypesController = async (req, res) => {
  const tid = req.params.tid;
  const table = `UserTypes`;
  const fields = ["userTypeID", "userTypeName"];
  const whereField = "userTypeID = ?";

  let sql = `SELECT ${fields} FROM ${table}`;
  const params = [];
  if (tid) {
    sql += ` WHERE ${whereField}`;
    params.push(tid);
  }
  return handleQuery(res, sql, params);
};

const statusController = async (req, res) => {
  const sid = req.params.sid;
  const table = `Status`;
  const fields = ["statusID", "statusName"];
  const whereField = "statusID = ?";

  let sql = `SELECT ${fields} FROM ${table}`;
  const params = [];
  if (sid) {
    sql += ` WHERE ${whereField}`;
    params.push(sid);
  }
  return handleQuery(res, sql, params);
};

const assignmentBase = {
  table: `
    (Assignments
      LEFT JOIN Users AS Therapist ON Assignments.assignmentTherapistID = Therapist.userID
      LEFT JOIN Users AS Patient   ON Assignments.assignmentPatientID   = Patient.userID
      LEFT JOIN Status           ON Assignments.assignmentStatusID    = Status.statusID)
  `,
  fields: [
    "Assignments.assignmentID",
    "Assignments.assignmentTherapistID",
    'CONCAT(Therapist.userFirstName, " ", Therapist.userLastName) AS therapistName',
    "Assignments.assignmentPatientID",
    'CONCAT(Patient.userFirstName, " ", Patient.userLastName) AS patientName',
    "Assignments.assignmentStatusID",
    "Status.statusName AS statusName",
    "Assignments.assignmentAssignedAt",
  ],
};

const assignmentsController = async (req, res) => {
  const aid = req.params.aid;
  const { table, fields } = assignmentBase;
  const whereField = "Assignments.assignmentID = ?";

  let sql = `SELECT ${fields} FROM ${table}`;
  const params = [];
  if (aid) {
    sql += ` WHERE ${whereField}`;
    params.push(aid);
  }
  return handleQuery(res, sql, params);
};

const assignmentsByTherapistController = async (req, res) => {
  const uid = req.params.uid;
  const { table, fields } = assignmentBase;
  const whereField = "Assignments.assignmentTherapistID = ?";
  const sql = `SELECT ${fields} FROM ${table} WHERE ${whereField}`;
  return handleQuery(res, sql, [uid]);
};

const assignmentsByPatientController = async (req, res) => {
  const uid = req.params.uid;
  const { table, fields } = assignmentBase;
  const whereField = "Assignments.assignmentPatientID = ?";
  const sql = `SELECT ${fields} FROM ${table} WHERE ${whereField}`;
  return handleQuery(res, sql, [uid]);
};

const assignmentsByStatusController = async (req, res) => {
  const sid = req.params.sid;
  const { table, fields } = assignmentBase;
  const whereField = "Assignments.assignmentStatusID = ?";
  const sql = `SELECT ${fields} FROM ${table} WHERE ${whereField}`;
  return handleQuery(res, sql, [sid]);
};

// Endpoints ---------------------------------------
app.get("/api/users", usersController);
app.get("/api/users/:uid", usersController);

app.get("/api/user-types", userTypesController);
app.get("/api/user-types/:tid", userTypesController);

app.get("/api/status", statusController);
app.get("/api/status/:sid", statusController);

app.get("/api/assignments", assignmentsController);
app.get("/api/assignments/:aid", assignmentsController);

app.get("/api/assignments/therapist/:uid", assignmentsByTherapistController);
app.get("/api/assignments/patient/:uid", assignmentsByPatientController);
app.get("/api/assignments/status/:sid", assignmentsByStatusController);

// Start server ---------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
