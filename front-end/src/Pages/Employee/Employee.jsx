import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Card, Badge, ListGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { FaUserPlus, FaArrowLeft, FaEdit, FaTrash, FaEye, FaUserCircle, FaPhone, FaEnvelope, FaUserTag } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee
} from "../../services/employee";
import "./Employee.css";

const Employees = () => {
  /* ================= STATES ================= */
  const [employees, setEmployees] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({ emp_name: "", emp_email: "", emp_phone: "", emp_role: "", username: "", password: "" });
  const [editForm, setEditForm] = useState({ emp_name: "", emp_email: "", emp_phone: "", emp_role: "", username: "", password: "" });

  /* ================= API CALLS ================= */
  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load employees");
    }
  };

  useEffect(() => { loadEmployees(); }, []);

  const handleAdd = async () => {
    try {
      await addEmployee(form);
      toast.success("Employee added successfully");
      setShowAdd(false);
      setForm({ emp_name: "", emp_email: "", emp_phone: "", emp_role: "", username: "", password: "" });
      loadEmployees();
    } catch (err) { toast.error("Action failed"); }
  };

  const openEditModal = (emp) => {
  setSelectedEmployee(emp);
  setEditForm({
    emp_name: emp.emp_name,
    emp_email: emp.emp_email,
    emp_phone: emp.emp_phone,
    emp_role: emp.emp_role,
    username: emp.username,
    password: "",
  });
  setShowEdit(true);
};


  const handleUpdate = async () => {
    try {
      await updateEmployee(selectedEmployee.emp_id, editForm);
      toast.success("Employee updated");
      setShowEdit(false);
      loadEmployees();
    } catch (err) { toast.error("Update failed"); }
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployee(deleteId);
      toast.success("Employee removed");
      setShowDelete(false);
      loadEmployees();
    } catch { toast.error("Delete failed"); }
  };

  const filteredEmployees = employees.filter(emp => {
  const matchesSearch =
    emp.emp_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.emp_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.username.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesRole =
    roleFilter === "all" || emp.emp_role === roleFilter;

  return matchesSearch && matchesRole;
});


  /* ================= STYLES ================= */
  const cardStyle = {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    transition: "transform 0.2s",
    cursor: "pointer"
  };

  const formatIST = (timestamp, emptyText = "First Login") => {
  if (!timestamp) return emptyText;

  return new Date(timestamp + "Z").toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
};

  return (
    <div className="employees-page">
  <ToastContainer position="top-right" autoClose={2000} />

  {/* FIXED HEADER */}
  <div className="employees-header">
    <h2 className="employees-title">Employee Management</h2>

    <button className="btn btn-outline-light" onClick={() => window.history.back()}>
     <FaArrowLeft /> Back To Dashboard
    </button>
  </div>

  {/* PAGE CONTENT */}
  <div className="employees-content">
    <Button
      variant="primary"
      className="rounded-pill shadow mb-4"
      onClick={() => setShowAdd(true)}
    >
      <FaUserPlus className="me-2" /> Add New Employee
    </Button>

    <Row className="align-items-center mb-4 g-3">
  <Col lg={2} md={2}>
    <Form.Control
      type="text"
      placeholder="🔍 Search by name, email or username..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="rounded-pill"
    />
  </Col>

  <Col lg={2} md={2}>
    <Form.Select
      value={roleFilter}
      onChange={(e) => setRoleFilter(e.target.value)}
      className="rounded-pill"
    >
      <option value="all">All Roles</option>
      {[...new Set(employees.map(emp => emp.emp_role))].map(role => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </Form.Select>
  </Col>

  <Col lg={1} md={1} className="text-end">
    <Badge bg="secondary" pill className="px-4 py-3">
      {filteredEmployees.length} Results
    </Badge>
  </Col>
</Row>
      <hr />

      {/* GRID VIEW */}
      <Row>
        {filteredEmployees.map(emp => (
          <Col key={emp.emp_id} xs={12} md={6} lg={4} xl={3} className="mb-4">
            <Card 
              style={cardStyle} 
              className="h-100 employee-card"
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <Card.Body onClick={() => { setSelectedEmployee(emp); setShowDetails(true); }}>
                <div className="text-center mb-3">
                  <FaUserCircle size={50} className="text-secondary mb-2" />
                  <Card.Title className="fw-bold">{emp.emp_name}</Card.Title>
                  <Badge bg="info" className="rounded-pill">{emp.emp_role}</Badge>
                </div>
                <div className="small text-muted">
                   <p className="mb-1"><FaEnvelope className="me-2"/> {emp.emp_email}</p>
                   <p className="mb-1"><FaPhone className="me-2"/> {emp.emp_phone || "N/A"}</p>
                </div>
              </Card.Body>
              <Card.Footer className="bg-white border-0 d-flex justify-content-around pb-3">
                <Button variant="outline-warning" size="sm" className="rounded-pill" onClick={(e) => { e.stopPropagation(); openEditModal(emp); }}>
                  <FaEdit /> Edit
                </Button>
                <Button variant="outline-danger" size="sm" className="rounded-pill" onClick={(e) => { e.stopPropagation(); setDeleteId(emp.emp_id); setShowDelete(true); }}>
                  <FaTrash /> Delete
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ================= MODALS ================= */}

      {/* FULL DETAILS MODAL */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} centered size="md">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Employee Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <div className="p-2">
              <div className="text-center mb-4">
                <FaUserCircle size={80} className="text-primary mb-2" />
                <h3>{selectedEmployee.emp_name}</h3>
                <Badge bg="secondary">{selectedEmployee.emp_role}</Badge>
              </div>
              <ListGroup variant="flush">
                <ListGroup.Item><strong>Email:</strong> {selectedEmployee.emp_email}</ListGroup.Item>
                <ListGroup.Item><strong>Phone:</strong> {selectedEmployee.emp_phone}</ListGroup.Item>
                <ListGroup.Item><strong>Username:</strong> {selectedEmployee.username}</ListGroup.Item>
                <ListGroup.Item><strong>Login Count:</strong> <Badge bg="success">{selectedEmployee.login_count}</Badge></ListGroup.Item>
                <ListGroup.Item>
                      <strong>Last Login:</strong>{" "}
                      {formatIST(selectedEmployee.last_login, "First Login")}
                    </ListGroup.Item>
                    
                    <ListGroup.Item>
                      <strong>Last Logout:</strong>{" "}
                      {formatIST(selectedEmployee.last_logout, "Currently Logged In")}
                </ListGroup.Item>
              </ListGroup>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* ADD EMPLOYEE MODAL */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton><Modal.Title>Register Employee</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            {Object.keys(form).map((f) => (
              <Form.Group className="mb-3" key={f}>
                <Form.Label className="small fw-bold">{f.replace("_", " ").toUpperCase()}</Form.Label>
                <Form.Control
                  type={f === "password" ? "password" : "text"}
                  placeholder={`Enter ${f.replace("_", " ")}`}
                  value={form[f]}
                  onChange={e => setForm({ ...form, [f]: e.target.value })}
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}>Save Member</Button>
        </Modal.Footer>
      </Modal>

      {/* EDIT MODAL */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton><Modal.Title>Update Profile</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            {Object.keys(editForm).map((f) => (
              <Form.Group className="mb-3" key={f}>
                <Form.Label className="small fw-bold">{f.replace("_", " ").toUpperCase()}</Form.Label>
                <Form.Control
                  type={f === "password" ? "password" : "text"}
                  value={editForm[f]}
                  onChange={e => setEditForm({ ...editForm, [f]: e.target.value })}
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowEdit(false)}>Close</Button>
          <Button variant="warning" onClick={handleUpdate}>Update Details</Button>
        </Modal.Footer>
      </Modal>

      {/* DELETE MODAL */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered size="sm">
        <Modal.Body className="text-center p-4">
          <FaTrash size={40} className="text-danger mb-3" />
          <h5>Confirm Delete?</h5>
          <p className="text-muted small">This will permanently remove the employee.</p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="secondary" onClick={() => setShowDelete(false)}>No</Button>
            <Button variant="danger" onClick={confirmDelete}>Yes, Delete</Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
    </div>
  );
};


export default Employees;
