// Imports ----------------------------------------
import express from "express";
import database from "./database.js";

// Configure express app -------------------------
const app = new express();

// Controllers ------------------------------------

const read = async (selectSql) => {
  try {
    const [result] = await database.query(selectSql);
    return result.length === 0
      ? { isSuccess: false, result: null, message: "No record(s) found" }
      : {
          isSuccess: true,
          result: result,
          message: "Record(s) successfully recovered",
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const buildUsersSelectSql = (id, variant) => {
  let sql = "";
  let table =
    "(Users LEFT JOIN UserTypes ON Users.userUserTypeID = UserTypes.userTypeID)";
  let fields = [
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
  switch (variant) {
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE Users.UserID = ${id}`;
  }
  return sql;
};

const buildUserTypesSelectSql = (id, variant) => {
  let sql = "";
  const table = "UserTypes";
  const fields = ["userTypeID", "userTypeName"];

  switch (variant) {
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE userTypeID = ${id}`;
  }

  return sql;
};

const buildStatusSelectSql = (id, variant) => {
  let sql = "";
  const table = "Status";
  const fields = ["statusID", "statusName"];

  switch (variant) {
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE statusID = ${id}`;
  }

  return sql;
};

const buildAssignmentsSelectSql = (id, variant) => {
  let sql = "";
  const table = `(Assignments
    LEFT JOIN Users AS Therapist ON Assignments.assignmentTherapistID = Therapist.userID
    LEFT JOIN Users AS Patient ON Assignments.assignmentPatientID = Patient.userID
    LEFT JOIN Status ON Assignments.assignmentStatusID = Status.statusID)`;
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

  switch (variant) {
    case "therapist":
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE Assignments.assignmentTherapistID = ${id}`;
      break;

    case "patient":
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE Assignments.assignmentPatientID = ${id}`;
      break;

    case "status":
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE Assignments.assignmentStatusID = ${id}`;
      break;

    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE Assignments.assignmentID = ${id}`;
  }

  return sql;
};

// USERS
const getUsersController = async (req, res, variant) => {
  const id = req.params.id; // undefined for /api/users
  // Build query ---------------------------------
  const sql = buildUsersSelectSql(id, variant);
  // Access data -------------------------------
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(404).json({ message });
  // Response to request
  res.status(200).json(result);
};

// USER TYPES
const getUserTypesController = async (req, res, variant) => {
  const id = req.params.id;
  // Build query ---------------------------------
  const sql = buildUserTypesSelectSql(id, variant);
  // Access data -------------------------------
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(404).json({ message });
  // Response to request
  res.status(200).json(result);
};

// STATUS
const getStatusController = async (req, res, variant) => {
  const id = req.params.id;
  // Build query ---------------------------------
  const sql = buildStatusSelectSql(id, variant);
  // Access data -------------------------------
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(404).json({ message });
  // Response to request
  res.status(200).json(result);
};

// ASSIGNMENTS
const getAssignmentsController = async (req, res, variant) => {
  const id = req.params.id;
  // Build query ---------------------------------
  const sql = buildAssignmentsSelectSql(id, variant);
  // Access data -------------------------------
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(404).json({ message });
  // Response to request
  res.status(200).json(result);
};

// Endpoints --------------------------------------
app.get("/api/users", (req, res) => getUsersController(req, res, null));
app.get("/api/users/:id", (req, res) => getUsersController(req, res, null));

app.get("/api/user-types", (req, res) =>
  getUserTypesController(req, res, null)
);
app.get("/api/user-types/:id", (req, res) =>
  getUserTypesController(req, res, null)
);

app.get("/api/status", (req, res) => getStatusController(req, res, null));
app.get("/api/status/:id", (req, res) => getStatusController(req, res, null));

app.get("/api/assignments", (req, res) =>
  getAssignmentsController(req, res, null)
);
app.get("/api/assignments/:id", (req, res) =>
  getAssignmentsController(req, res, null)
);

app.get("/api/assignments/therapist/:id", (req, res) =>
  getAssignmentsController(req, res, "therapist")
);
app.get("/api/assignments/patient/:id", (req, res) =>
  getAssignmentsController(req, res, "patient")
);
app.get("/api/assignments/status/:id", (req, res) =>
  getAssignmentsController(req, res, "status")
);

// Start server -----------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
