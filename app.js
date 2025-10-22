// Imports ----------------------------------------
import express from "express";
import database from "./database.js";

// Configure express app -------------------------
const app = new express();

// Controllers ------------------------------------

// USERS
const usersController = async (req, res) => {
  const id = req.params.uid; // undefined for /api/users
  // Build query ---------------------------------
  const table =
    "(Users LEFT JOIN UserTypes ON Users.userUserTypeID = UserTypes.userTypeID)";
  const whereField = "Users.userID";
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
  const extendedTable = `${table}`;
  const extendedFields = `${fields}`;

  let sql = `SELECT ${extendedFields} FROM ${extendedTable}`;
  if (id) sql += ` WHERE ${whereField} = ${id}`;

  // Execute query -------------------------------
  let isSuccess = false;
  let message = "";
  let result = null;

  try {
    [result] = await database.query(sql);
    if (result.length === 0) message = "No record(s) found.";
    else {
      isSuccess = true;
      message = "Record(s) retrieved successfully.";
    }
    isSuccess
      ? res.status(200).json(result)
      : res.status(400).json({ message });
  } catch (error) {
    message = `Error executing query: ${error.message}`;
    res.status(400).json({ message });
  }
};

// USER TYPES
const userTypesController = async (req, res) => {
  const id = req.params.tid;
  // Build query ---------------------------------
  const table = "UserTypes";
  const whereField = "userTypeID";
  const fields = ["userTypeID", "userTypeName"];
  const extendedTable = `${table}`;
  const extendedFields = `${fields}`;

  let sql = `SELECT ${extendedFields} FROM ${extendedTable}`;
  if (id) sql += ` WHERE ${whereField} = ${id}`;

  // Execute query -------------------------------
  let isSuccess = false;
  let message = "";
  let result = null;

  try {
    [result] = await database.query(sql);
    if (result.length === 0) message = "No record(s) found.";
    else {
      isSuccess = true;
      message = "Record(s) retrieved successfully.";
    }
    isSuccess
      ? res.status(200).json(result)
      : res.status(400).json({ message });
  } catch (error) {
    message = `Error executing query: ${error.message}`;
    res.status(400).json({ message });
  }
};

// STATUS
const statusController = async (req, res) => {
  const id = req.params.sid;
  // Build query ---------------------------------
  const table = "Status";
  const whereField = "statusID";
  const fields = ["statusID", "statusName"];
  const extendedTable = `${table}`;
  const extendedFields = `${fields}`;

  let sql = `SELECT ${extendedFields} FROM ${extendedTable}`;
  if (id) sql += ` WHERE ${whereField} = ${id}`;

  // Execute query -------------------------------
  let isSuccess = false;
  let message = "";
  let result = null;

  try {
    [result] = await database.query(sql);
    if (result.length === 0) message = "No record(s) found.";
    else {
      isSuccess = true;
      message = "Record(s) retrieved successfully.";
    }
    isSuccess
      ? res.status(200).json(result)
      : res.status(400).json({ message });
  } catch (error) {
    message = `Error executing query: ${error.message}`;
    res.status(400).json({ message });
  }
};

// ASSIGNMENTS
const assignmentsController = async (req, res) => {
  const id = req.params.aid;
  // Build query ---------------------------------
  const table = `(Assignments
    LEFT JOIN Users AS Therapist ON Assignments.assignmentTherapistID = Therapist.userID
    LEFT JOIN Users AS Patient ON Assignments.assignmentPatientID = Patient.userID
    LEFT JOIN Status ON Assignments.assignmentStatusID = Status.statusID)`;
  const whereField = "Assignments.assignmentID";
  const fields = [
    "Assignments.assignmentID",
    "Assignments.assignmentTherapistID",
    'CONCAT(Therapist.userFirstName, " ", Therapist.userLastName) AS therapistName',
    "Assignments.assignmentPatientID",
    'CONCAT(Patient.userFirstName, " ", Patient.userLastName) AS patientName',
    "Assignments.assignmentStatusID",
    "Statuses.statusName AS statusName",
    "Assignments.assignmentAssignedAt",
  ];
  const extendedTable = `${table}`;
  const extendedFields = `${fields}`;

  let sql = `SELECT ${extendedFields} FROM ${extendedTable}`;
  if (id) sql += ` WHERE ${whereField} = ${id}`;

  // Execute query -------------------------------
  let isSuccess = false;
  let message = "";
  let result = null;

  try {
    [result] = await database.query(sql);
    if (result.length === 0) message = "No record(s) found.";
    else {
      isSuccess = true;
      message = "Record(s) retrieved successfully.";
    }
    isSuccess
      ? res.status(200).json(result)
      : res.status(400).json({ message });
  } catch (error) {
    message = `Error executing query: ${error.message}`;
    res.status(400).json({ message });
  }
};

// ASSIGNMENTS by therapist -----------------------
const assignmentsByTherapistController = async (req, res) => {
  const id = req.params.uid;
  // Build query ---------------------------------
  const table = `(Assignments
    LEFT JOIN Users AS Therapist ON Assignments.assignmentTherapistID = Therapist.userID
    LEFT JOIN Users AS Patient ON Assignments.assignmentPatientID = Patient.userID
    LEFT JOIN Status ON Assignments.assignmentStatusID = Status.statusID)`;
  const whereField = "Assignments.assignmentTherapistID";
  const fields = [
    "Assignments.assignmentID",
    "Assignments.assignmentTherapistID",
    'CONCAT(Therapist.userFirstName, " ", Therapist.userLastName) AS therapistName',
    "Assignments.assignmentPatientID",
    'CONCAT(Patient.userFirstName, " ", Patient.userLastName) AS patientName',
    "Assignments.assignmentStatusID",
    "Statuses.statusName AS statusName",
    "Assignments.assignmentAssignedAt",
  ];
  const extendedTable = `${table}`;
  const extendedFields = `${fields}`;

  const sql = `SELECT ${extendedFields} FROM ${extendedTable} WHERE ${whereField} = ${id}`;

  // Execute query -------------------------------
  let isSuccess = false;
  let message = "";
  let result = null;

  try {
    [result] = await database.query(sql);
    if (result.length === 0) message = "No record(s) found.";
    else {
      isSuccess = true;
      message = "Record(s) retrieved successfully.";
    }
    isSuccess
      ? res.status(200).json(result)
      : res.status(400).json({ message });
  } catch (error) {
    message = `Error executing query: ${error.message}`;
    res.status(400).json({ message });
  }
};

// ASSIGNMENTS by patient -------------------------
const assignmentsByPatientController = async (req, res) => {
  const id = req.params.uid;
  // Build query ---------------------------------
  const table = `(Assignments
    LEFT JOIN Users AS Therapist ON Assignments.assignmentTherapistID = Therapist.userID
    LEFT JOIN Users AS Patient ON Assignments.assignmentPatientID = Patient.userID
    LEFT JOIN Status ON Assignments.assignmentStatusID = Status.statusID)`;
  const whereField = "Assignments.assignmentPatientID";
  const fields = [
    "Assignments.assignmentID",
    "Assignments.assignmentTherapistID",
    'CONCAT(Therapist.userFirstName, " ", Therapist.userLastName) AS therapistName',
    "Assignments.assignmentPatientID",
    'CONCAT(Patient.userFirstName, " ", Patient.userLastName) AS patientName',
    "Assignments.assignmentStatusID",
    "Status.statusName AS statusName",
    "Assignments.assignmentAssignedAt",
  ];
  const extendedTable = `${table}`;
  const extendedFields = `${fields}`;

  const sql = `SELECT ${extendedFields} FROM ${extendedTable} WHERE ${whereField} = ${id}`;

  // Execute query -------------------------------
  let isSuccess = false;
  let message = "";
  let result = null;

  try {
    [result] = await database.query(sql);
    if (result.length === 0) message = "No record(s) found.";
    else {
      isSuccess = true;
      message = "Record(s) retrieved successfully.";
    }
    isSuccess
      ? res.status(200).json(result)
      : res.status(400).json({ message });
  } catch (error) {
    message = `Error executing query: ${error.message}`;
    res.status(400).json({ message });
  }
};

// ASSIGNMENTS
const assignmentsByStatusController = async (req, res) => {
  const id = req.params.sid;
  // Build query ---------------------------------
  const table = `(Assignments
    LEFT JOIN Users AS Therapist ON Assignments.assignmentTherapistID = Therapist.userID
    LEFT JOIN Users AS Patient ON Assignments.assignmentPatientID = Patient.userID
    LEFT JOIN status ON Assignments.assignmentStatusID = Status.statusID)`;
  const whereField = "Assignments.assignmentStatusID";
  const fields = [
    "Assignments.assignmentID",
    "Assignments.assignmentTherapistID",
    'CONCAT(Therapist.userFirstName, " ", Therapist.userLastName) AS therapistName',
    "Assignments.assignmentPatientID",
    'CONCAT(Patient.userFirstName, " ", Patient.userLastName) AS patientName',
    "Assignments.assignmentStatusID",
    "Status.statusName AS statusName",
    "Assignments.assignmentAssignedAt",
  ];
  const extendedTable = `${table}`;
  const extendedFields = `${fields}`;

  const sql = `SELECT ${extendedFields} FROM ${extendedTable} WHERE ${whereField} = ${id}`;

  // Execute query -------------------------------
  let isSuccess = false;
  let message = "";
  let result = null;

  try {
    [result] = await database.query(sql);
    if (result.length === 0) message = "No record(s) found.";
    else {
      isSuccess = true;
      message = "Record(s) retrieved successfully.";
    }
    isSuccess
      ? res.status(200).json(result)
      : res.status(400).json({ message });
  } catch (error) {
    message = `Error executing query: ${error.message}`;
    res.status(400).json({ message });
  }
};

// Endpoints --------------------------------------
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

// Start server -----------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
