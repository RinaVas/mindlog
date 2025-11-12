// Imports ----------------------------------------
import express from "express";
import cors from "cors";
import database from "./database.js";

// Configure express app -------------------------
const app = new express();

// Configure middleware -------------------------
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const buildSetFields = (fields) =>
  fields.reduce(
    (setSQL, field, index) =>
      setSQL + `${field}=:${field}` + (index === fields.length - 1 ? "" : ", "),
    "SET "
  );

const buildUsersInsertSql = (record) => {
  const table = "Users";
  const mutableFields = [
    "userFirstName",
    "userLastName",
    "userPhone",
    "userEmail",
    "userAddressLineOne",
    "userAddressLineTwo",
    "userPostcode",
    "userUserTypeID",
  ];
  return `INSERT INTO ${table} ` + buildSetFields(mutableFields);
};

const buildAssignmentsUpdateStatusSql = (record) => {
  const table = "Assignments";
  const mutableFields = ["assignmentStatusID"];
  return (
    `UPDATE ${table} ` +
    buildSetFields(mutableFields) +
    " WHERE assignmentID=:assignmentID"
  );
};

const createUsers = async (sql, record) => {
  try {
    const status = await database.query(sql, record);
    const insertId = status[0].insertId;

    const recoverRecordSql = buildUsersSelectSql(insertId, null);
    const { isSuccess, result, message } = await read(recoverRecordSql);

    return isSuccess
      ? { isSuccess: true, result, message: "Record successfully recovered" }
      : {
          isSuccess: false,
          result: null,
          message: `Failed to recover the inserted record: ${message}`,
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const updateAssignments = async (sql, record) => {
  try {
    const status = await database.query(sql, record);

    if (status[0].affectedRows === 0) {
      return {
        isSuccess: false,
        result: null,
        message: "Assignment not found",
      };
    }

    const recoverRecordSql = buildAssignmentsSelectSql(
      record.assignmentID,
      null
    );
    const { isSuccess, result, message } = await read(recoverRecordSql);

    return isSuccess
      ? { isSuccess: true, result, message: "Record successfully recovered" }
      : {
          isSuccess: false,
          result: null,
          message: `Failed to recover the updated record: ${message}`,
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const postUsersController = async (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    email,
    addressLineOne,
    addressLineTwo,
    postcode,
    userTypeId,
  } = req.body;

  const errors = [];
  if (!firstName) errors.push("firstName is required");
  if (!lastName) errors.push("lastName is required");
  if (!email) errors.push("email is required");
  if (!userTypeId) errors.push("userTypeId is required");

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  const record = {
    userFirstName: firstName,
    userLastName: lastName,
    userPhone: phone || "",
    userEmail: email,
    userAddressLineOne: addressLineOne || "",
    userAddressLineTwo: addressLineTwo || "",
    userPostcode: postcode || "",
    userUserTypeID: userTypeId,
  };

  const sql = buildUsersInsertSql(record);
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await createUsers(sql, record);

  if (!isSuccess) return res.status(400).json({ message: accessorMessage });

  res.status(201).json(result);
};

const deleteUsersController = async (res, id) => {
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const deleteSql = "DELETE FROM Users WHERE userID = ?";
  try {
    const [status] = await database.query(deleteSql, [id]);

    if (status.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(204).send(); // No content
  } catch (error) {
    return res.status(500).json({
      message: `Failed to delete user: ${error.message}`,
    });
  }
};

const patchAssignmentStatusController = async (req, res) => {
  const assignmentID = req.params.id;
  const { statusId } = req.body;

  if (!assignmentID || isNaN(Number(assignmentID))) {
    return res.status(400).json({ message: "Invalid assignment id" });
  }
  if (!statusId) {
    return res.status(400).json({ message: "statusId is required" });
  }

  const record = {
    assignmentID: Number(assignmentID),
    assignmentStatusID: Number(statusId),
  };

  const sql = buildAssignmentsUpdateStatusSql(record);
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await updateAssignments(sql, record);

  if (!isSuccess) return res.status(400).json({ message: accessorMessage });

  res.status(200).json(result);
};

const deleteAssignmentsController = async (res, id) => {
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Invalid assignment id" });
  }

  const deleteSql = "DELETE FROM Assignments WHERE assignmentID = ?";

  try {
    const [status] = await database.query(deleteSql, [id]);

    if (status.affectedRows === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    return res.status(204).send(); // No Content
  } catch (error) {
    return res.status(500).json({
      message: `Failed to delete assignment: ${error.message}`,
    });
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
  const id = req.params.id;
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

// USERS
app.get("/api/users", (req, res) => getUsersController(req, res, null));
app.get("/api/users/:id", (req, res) => getUsersController(req, res, null));
app.post("/api/users", postUsersController);
app.delete("/api/users/:id", (req, res) =>
  deleteUsersController(res, req.params.id)
);

// USER TYPES
app.get("/api/user-types", (req, res) =>
  getUserTypesController(req, res, null)
);
app.get("/api/user-types/:id", (req, res) =>
  getUserTypesController(req, res, null)
);

// STATUS
app.get("/api/status", (req, res) => getStatusController(req, res, null));
app.get("/api/status/:id", (req, res) => getStatusController(req, res, null));

// ASSIGNMENTS
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
app.delete("/api/assignments/:id", (req, res) =>
  deleteAssignmentsController(res, req.params.id)
);
app.patch("/api/assignments/:id/status", patchAssignmentStatusController);

// Start server -----------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
