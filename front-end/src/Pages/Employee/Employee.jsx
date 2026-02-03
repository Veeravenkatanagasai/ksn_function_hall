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

const Employees = () => {
  /* ================= STATES ================= */
  const [employees, setEmployees] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
    const payload = { ...editForm };

    if (!payload.password) delete payload.password;

    await updateEmployee(selectedEmployee.emp_id, payload);

    toast.success("Employee updated");
    setShowEdit(false);
    loadEmployees();
  } catch (err) {
    toast.error("Update failed");
  }
};


  const confirmDelete = async () => {
    try {
      await deleteEmployee(deleteId);
      toast.success("Employee removed");
      setShowDelete(false);
      loadEmployees();
    } catch { toast.error("Delete failed"); }
  };

  /* ================= STYLES ================= */
  const cardStyle = {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    transition: "transform 0.2s",
    cursor: "pointer"
  };

  const fixedBackBtn = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    borderRadius: '50px',
    padding: '10px 20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={2000} />

      {/* FIXED BACK BUTTON */}
      <Button variant="dark" style={fixedBackBtn} onClick={() => window.history.back()}>
        <FaArrowLeft className="me-2" /> Back
      </Button>

      <div className="mb-4">
        <h2 className="fw-bold text-primary">Employee Management</h2>
        <Button variant="primary" className="rounded-pill shadow" onClick={() => setShowAdd(true)}>
          <FaUserPlus className="me-2" /> Add New Employee
        </Button>
      </div>

      <hr />

      {/* GRID VIEW */}
      <Row>
        {employees.map(emp => (
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
                <ListGroup.Item><strong>Last Login:</strong> {selectedEmployee.last_login ? new Date(selectedEmployee.last_login).toLocaleString() : "Never"}</ListGroup.Item>
                <ListGroup.Item><strong>Last Logout:</strong> {selectedEmployee.last_logout ? new Date(selectedEmployee.last_logout).toLocaleString() : "N/A"}</ListGroup.Item>
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
  <Modal.Header closeButton>
    <Modal.Title>Update Profile</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form>

      <Form.Group className="mb-3">
        <Form.Label className="small fw-bold">EMP NAME</Form.Label>
        <Form.Control
          value={editForm.emp_name}
          onChange={(e) =>
            setEditForm({ ...editForm, emp_name: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small fw-bold">EMP EMAIL</Form.Label>
        <Form.Control
          value={editForm.emp_email}
          onChange={(e) =>
            setEditForm({ ...editForm, emp_email: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small fw-bold">EMP PHONE</Form.Label>
        <Form.Control
          value={editForm.emp_phone}
          onChange={(e) =>
            setEditForm({ ...editForm, emp_phone: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small fw-bold">EMP ROLE</Form.Label>
        <Form.Control
          value={editForm.emp_role}
          onChange={(e) =>
            setEditForm({ ...editForm, emp_role: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small fw-bold">USERNAME</Form.Label>
        <Form.Control
          value={editForm.username}
          onChange={(e) =>
            setEditForm({ ...editForm, username: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small fw-bold">PASSWORD</Form.Label>
        <Form.Control
          type="password"
          placeholder="Leave blank to keep current password"
          value={editForm.password}
          onChange={(e) =>
            setEditForm({ ...editForm, password: e.target.value })
          }
        />
      </Form.Group>

    </Form>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="light" onClick={() => setShowEdit(false)}>
      Close
    </Button>
    <Button variant="warning" onClick={handleUpdate}>
      Update Details
    </Button>
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
  );
};

export default Employees;
