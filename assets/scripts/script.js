// ==================== DATA MODELS ====================
const DataStore = {
  // Initialize data structure
  init() {
    if (!localStorage.getItem("vidyasetu_data")) {
      const initialData = {
        departments: [
          {
            id: "comp-dept",
            name: "Computer Department",
            batches: [],
          },
        ],
        students: [],
        faculty: [],
        lectures: [],
        attendance: [],
        marks: [],
        currentUser: {
          role: "admin",
          name: "Admin User",
          email: "admin@vidyasetu.com",
        },
      };
      this.save(initialData);
    }
  },

  // Get all data
  getData() {
    return JSON.parse(localStorage.getItem("vidyasetu_data"));
  },

  // Save all data
  save(data) {
    localStorage.setItem("vidyasetu_data", JSON.stringify(data));
  },

  // Get specific entity
  get(entity) {
    const data = this.getData();
    return data[entity] || [];
  },

  // Update specific entity
  update(entity, value) {
    const data = this.getData();
    data[entity] = value;
    this.save(data);
  },

  // Add item to entity
  add(entity, item) {
    const data = this.getData();
    if (!data[entity]) data[entity] = [];
    data[entity].push(item);
    this.save(data);
  },

  // Delete item from entity
  delete(entity, id) {
    const data = this.getData();
    data[entity] = data[entity].filter((item) => item.id !== id);
    this.save(data);
  },

  // Update single item
  updateItem(entity, id, updates) {
    const data = this.getData();
    const index = data[entity].findIndex((item) => item.id === id);
    if (index !== -1) {
      data[entity][index] = { ...data[entity][index], ...updates };
      this.save(data);
    }
  },
};

// Initialize data store
DataStore.init();

// ==================== UTILITY FUNCTIONS ====================
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

// Close sidebar when navigation item is clicked on mobile
function closeSidebarOnMobile() {
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function showAlert(message, type = "success") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  const mainContent = document.getElementById("mainContent");
  mainContent.insertBefore(alertDiv, mainContent.firstChild);

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// ==================== NAVIGATION ====================
let currentPage = "dashboard";
let currentContext = {};

function navigateTo(page, context = {}) {
  currentPage = page;
  currentContext = context;

  // Update active nav item
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Close sidebar on mobile
  closeSidebarOnMobile();

  // Render page
  renderPage(page, context);
}

function renderPage(page, context = {}) {
  const mainContent = document.getElementById("mainContent");

  switch (page) {
    case "dashboard":
      renderDashboard();
      break;
    case "structure":
      renderStructure();
      break;
    case "students":
      renderStudents(context);
      break;
    case "faculty":
      renderFaculty(context);
      break;
    case "lectures":
      renderLectures(context);
      break;
    case "attendance":
      renderAttendance(context);
      break;
    case "marks":
      renderMarks(context);
      break;
    case "performance":
      renderPerformance(context);
      break;
    case "settings":
      renderSettings();
      break;
    default:
      renderDashboard();
  }
}

// ==================== DASHBOARD ====================
function renderDashboard() {
  const students = DataStore.get("students");
  const faculty = DataStore.get("faculty");
  const attendance = DataStore.get("attendance");
  const marks = DataStore.get("marks");

  // Calculate statistics
  const totalStudents = students.length;
  const totalFaculty = faculty.length;

  // Calculate average attendance
  const avgAttendance =
    attendance.length > 0
      ? (
          (attendance.filter((a) => a.status === "present").length /
            attendance.length) *
          100
        ).toFixed(1)
      : 0;

  // Low attendance students
  const studentAttendance = {};
  attendance.forEach((record) => {
    if (!studentAttendance[record.studentId]) {
      studentAttendance[record.studentId] = { present: 0, total: 0 };
    }
    studentAttendance[record.studentId].total++;
    if (record.status === "present") {
      studentAttendance[record.studentId].present++;
    }
  });

  const lowAttendance = Object.entries(studentAttendance).filter(
    ([id, data]) => (data.present / data.total) * 100 < 75,
  ).length;

  const content = `
                <div class="top-bar">
                    <div>
                        <h1 class="page-title">Dashboard</h1>
                        <div class="breadcrumb">
                            <span>Home</span>
                            <span>/</span>
                            <span>Dashboard</span>
                        </div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="stat-card" onclick="navigateTo('students')">
                        <div class="stat-card-header">
                            <div class="stat-icon" style="background: #dbeafe; color: #1e40af;">👥</div>
                        </div>
                        <div class="stat-value">${totalStudents}</div>
                        <div class="stat-label">Total Students</div>
                    </div>

                    <div class="stat-card" onclick="navigateTo('faculty')">
                        <div class="stat-card-header">
                            <div class="stat-icon" style="background: #d1fae5; color: #065f46;">👨‍🏫</div>
                        </div>
                        <div class="stat-value">${totalFaculty}</div>
                        <div class="stat-label">Faculty Members</div>
                    </div>

                    <div class="stat-card" onclick="navigateTo('attendance')">
                        <div class="stat-card-header">
                            <div class="stat-icon" style="background: #fef3c7; color: #92400e;">📊</div>
                        </div>
                        <div class="stat-value">${avgAttendance}%</div>
                        <div class="stat-label">Avg Attendance</div>
                    </div>

                    <div class="stat-card" onclick="navigateTo('performance')">
                        <div class="stat-card-header">
                            <div class="stat-icon" style="background: #fee2e2; color: #991b1b;">⚠️</div>
                        </div>
                        <div class="stat-value">${lowAttendance}</div>
                        <div class="stat-label">Low Attendance</div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h2 class="card-title">Quick Actions</h2>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="navigateTo('students')">
                            👥 Manage Students
                        </button>
                        <button class="btn btn-primary" onclick="navigateTo('attendance')">
                            ✅ Mark Attendance
                        </button>
                        <button class="btn btn-primary" onclick="navigateTo('marks')">
                            📝 Enter Marks
                        </button>
                        <button class="btn btn-primary" onclick="navigateTo('lectures')">
                            📅 Schedule Lectures
                        </button>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h2 class="card-title">Recent Activity</h2>
                    </div>
                    <p style="color: var(--text-secondary);">Activity log will appear here as you use the system.</p>
                </div>
            `;

  document.getElementById("mainContent").innerHTML = content;
}

// ==================== DEPARTMENT STRUCTURE ====================
function renderStructure() {
  const data = DataStore.getData();
  const departments = data.departments || [];

  let batchesHTML = "";

  if (departments.length > 0 && departments[0].batches) {
    departments[0].batches.forEach((batch) => {
      const coursesHTML = batch.courses
        .map(
          (course) => `
                        <div class="course-card" onclick="navigateTo('students', {batch: '${batch.year}', course: '${course.name}', semester: ${course.semester}})">
                            <div class="course-name">${course.name}</div>
                            <div style="color: var(--text-secondary); font-size: 0.875rem;">Semester ${course.semester}</div>
                        </div>
                    `,
        )
        .join("");

      batchesHTML += `
                        <div class="batch-item">
                            <div class="batch-header" onclick="toggleBatch('batch-${batch.year}')">
                                <span><strong>${batch.year} Batch</strong></span>
                                <span id="batch-${batch.year}-icon">▼</span>
                            </div>
                            <div class="batch-content" id="batch-${batch.year}">
                                <div class="course-grid">
                                    ${coursesHTML}
                                </div>
                            </div>
                        </div>
                    `;
    });
  }

  const content = `
                <div class="top-bar">
                    <div>
                        <h1 class="page-title">Department Structure</h1>
                        <div class="breadcrumb">
                            <span>Home</span>
                            <span>/</span>
                            <span>Department Structure</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="openAddBatchModal()">
                        ➕ Add Batch
                    </button>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h2 class="card-title">Computer Department</h2>
                    </div>
                    <div class="batch-tree">
                        ${batchesHTML || '<p style="color: var(--text-secondary);">No batches added yet. Click "Add Batch" to get started.</p>'}
                    </div>
                </div>

                <!-- Add Batch Modal -->
                <div class="modal" id="addBatchModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title">Add New Batch</h2>
                            <button class="close-modal" onclick="closeModal('addBatchModal')">×</button>
                        </div>
                        <form onsubmit="addBatch(event)">
                            <div class="form-group">
                                <label class="form-label">Batch Year</label>
                                <input type="number" class="form-input" name="year" required min="2020" max="2030" placeholder="e.g., 2025">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Courses (Select Multiple)</label>
                                <div style="display: grid; gap: 0.5rem;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox" name="course" value="BCA-1"> BCA Semester 1
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox" name="course" value="BCA-3"> BCA Semester 3
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox" name="course" value="MCA-1"> MCA Semester 1
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox" name="course" value="MCA-3"> MCA Semester 3
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox" name="course" value="PGCA-1"> PGCA
                                    </label>
                                </div>
                            </div>
                            <div class="btn-group">
                                <button type="submit" class="btn btn-primary">Add Batch</button>
                                <button type="button" class="btn btn-outline" onclick="closeModal('addBatchModal')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

  document.getElementById("mainContent").innerHTML = content;
}

function toggleBatch(batchId) {
  const content = document.getElementById(batchId);
  const icon = document.getElementById(batchId + "-icon");

  if (content.classList.contains("active")) {
    content.classList.remove("active");
    icon.textContent = "▼";
  } else {
    content.classList.add("active");
    icon.textContent = "▲";
  }
}

function openAddBatchModal() {
  openModal("addBatchModal");
}

function addBatch(event) {
  event.preventDefault();
  const form = event.target;
  const year = form.year.value;
  const selectedCourses = Array.from(
    form.querySelectorAll('input[name="course"]:checked'),
  ).map((cb) => cb.value);

  if (selectedCourses.length === 0) {
    showAlert("Please select at least one course", "danger");
    return;
  }

  const courses = selectedCourses.map((course) => {
    const [name, semester] = course.split("-");
    return {
      name: name,
      semester: parseInt(semester),
    };
  });

  const data = DataStore.getData();
  if (!data.departments[0].batches) {
    data.departments[0].batches = [];
  }

  // Check if batch already exists
  const existingBatch = data.departments[0].batches.find(
    (b) => b.year === year,
  );
  if (existingBatch) {
    showAlert("Batch year already exists", "danger");
    return;
  }

  data.departments[0].batches.push({
    id: generateId(),
    year: year,
    courses: courses,
  });

  DataStore.save(data);
  closeModal("addBatchModal");
  showAlert("Batch added successfully", "success");
  renderStructure();
}

// ==================== STUDENT MANAGEMENT ====================
function renderStudents(context = {}) {
  const students = DataStore.get("students");
  let filteredStudents = students;

  if (context.batch && context.course && context.semester) {
    filteredStudents = students.filter(
      (s) =>
        s.batch === context.batch &&
        s.course === context.course &&
        s.semester === context.semester,
    );
  }

  const studentsHTML = filteredStudents
    .map(
      (student) => `
                <tr>
                    <td>${student.rollNumber}</td>
                    <td>${student.firstName} ${student.surname}</td>
                    <td>${student.course} - Sem ${student.semester}</td>
                    <td>${student.batch}</td>
                    <td>${student.gender}</td>
                    <td>${student.category}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn action-btn-edit" onclick="editStudent('${student.id}')">Edit</button>
                            <button class="action-btn action-btn-delete" onclick="deleteStudent('${student.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `,
    )
    .join("");

  const contextInfo = context.batch
    ? `
                <div class="badge badge-info">
                    ${context.batch} Batch - ${context.course} Semester ${context.semester}
                </div>
            `
    : "";

  const content = `
                <div class="top-bar">
                    <div>
                        <h1 class="page-title">Student Management</h1>
                        <div class="breadcrumb">
                            <span>Home</span>
                            <span>/</span>
                            <span>Students</span>
                        </div>
                        ${contextInfo}
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="openAddStudentModal()">
                            ➕ Add Student
                        </button>
                        <button class="btn btn-secondary" onclick="openImportModal()">
                            📥 Import
                        </button>
                        <button class="btn btn-success" onclick="exportStudents()">
                            📤 Export
                        </button>
                    </div>
                </div>

                <div class="content-card">
                    <div class="search-bar">
                        <span class="search-icon">🔍</span>
                        <input type="text" class="search-input" placeholder="Search students..." onkeyup="searchStudents(this.value)">
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Course</th>
                                    <th>Batch</th>
                                    <th>Gender</th>
                                    <th>Category</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="studentTableBody">
                                ${studentsHTML || '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">No students found</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Add Student Modal -->
                <div class="modal" id="addStudentModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title" id="studentModalTitle">Add New Student</h2>
                            <button class="close-modal" onclick="closeModal('addStudentModal')">×</button>
                        </div>
                        <form onsubmit="saveStudent(event)">
                            <input type="hidden" name="studentId" id="studentId">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Roll Number *</label>
                                    <input type="text" class="form-input" name="rollNumber" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">First Name *</label>
                                    <input type="text" class="form-input" name="firstName" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Surname *</label>
                                    <input type="text" class="form-input" name="surname" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Father Name</label>
                                    <input type="text" class="form-input" name="fatherName">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Batch *</label>
                                    <input type="text" class="form-input" name="batch" required placeholder="e.g., 2025">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Course *</label>
                                    <select class="form-select" name="course" required>
                                        <option value="">Select Course</option>
                                        <option value="BCA">BCA</option>
                                        <option value="MCA">MCA</option>
                                        <option value="PGCA">PGCA</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Semester *</label>
                                    <select class="form-select" name="semester" required>
                                        <option value="">Select Semester</option>
                                        <option value="1">Semester 1</option>
                                        <option value="2">Semester 2</option>
                                        <option value="3">Semester 3</option>
                                        <option value="4">Semester 4</option>
                                        <option value="5">Semester 5</option>
                                        <option value="6">Semester 6</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Date of Birth</label>
                                    <input type="date" class="form-input" name="dob">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Gender *</label>
                                    <select class="form-select" name="gender" required>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Category *</label>
                                    <select class="form-select" name="category" required>
                                        <option value="">Select Category</option>
                                        <option value="General">General</option>
                                        <option value="OBC">OBC</option>
                                        <option value="SC">SC</option>
                                        <option value="ST">ST</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Address</label>
                                <textarea class="form-textarea" name="address" rows="2"></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Contact Number</label>
                                    <input type="tel" class="form-input" name="contact">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" name="email">
                                </div>
                            </div>
                            <div class="btn-group">
                                <button type="submit" class="btn btn-primary">Save Student</button>
                                <button type="button" class="btn btn-outline" onclick="closeModal('addStudentModal')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Import Modal -->
                <div class="modal" id="importModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title">Import Students</h2>
                            <button class="close-modal" onclick="closeModal('importModal')">×</button>
                        </div>
                        <div class="file-upload" onclick="document.getElementById('importFile').click()">
                            <input type="file" id="importFile" accept=".csv,.json" onchange="handleImport(event)">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">📁</div>
                            <div style="font-weight: 600; margin-bottom: 0.5rem;">Click to upload file</div>
                            <div style="color: var(--text-secondary); font-size: 0.875rem;">Supports CSV and JSON formats</div>
                        </div>
                        <div style="margin-top: 1rem; padding: 1rem; background: #f0f9ff; border-radius: 8px; font-size: 0.875rem;">
                            <strong>CSV Format:</strong> rollNumber, firstName, surname, fatherName, batch, course, semester, dob, gender, category, address, contact, email
                        </div>
                    </div>
                </div>
            `;

  document.getElementById("mainContent").innerHTML = content;
}

function openAddStudentModal() {
  document.getElementById("studentModalTitle").textContent = "Add New Student";
  document.getElementById("addStudentModal").querySelector("form").reset();
  document.getElementById("studentId").value = "";
  openModal("addStudentModal");
}

function saveStudent(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const studentId = formData.get("studentId");

  const student = {
    id: studentId || generateId(),
    rollNumber: formData.get("rollNumber"),
    firstName: formData.get("firstName"),
    surname: formData.get("surname"),
    fatherName: formData.get("fatherName"),
    batch: formData.get("batch"),
    course: formData.get("course"),
    semester: parseInt(formData.get("semester")),
    dob: formData.get("dob"),
    gender: formData.get("gender"),
    category: formData.get("category"),
    address: formData.get("address"),
    contact: formData.get("contact"),
    email: formData.get("email"),
  };

  if (studentId) {
    DataStore.updateItem("students", studentId, student);
    showAlert("Student updated successfully", "success");
  } else {
    DataStore.add("students", student);
    showAlert("Student added successfully", "success");
  }

  closeModal("addStudentModal");
  renderStudents(currentContext);
}

function editStudent(id) {
  const students = DataStore.get("students");
  const student = students.find((s) => s.id === id);

  if (student) {
    const form = document
      .getElementById("addStudentModal")
      .querySelector("form");
    document.getElementById("studentModalTitle").textContent = "Edit Student";
    document.getElementById("studentId").value = student.id;
    form.rollNumber.value = student.rollNumber;
    form.firstName.value = student.firstName;
    form.surname.value = student.surname;
    form.fatherName.value = student.fatherName || "";
    form.batch.value = student.batch;
    form.course.value = student.course;
    form.semester.value = student.semester;
    form.dob.value = student.dob || "";
    form.gender.value = student.gender;
    form.category.value = student.category;
    form.address.value = student.address || "";
    form.contact.value = student.contact || "";
    form.email.value = student.email || "";

    openModal("addStudentModal");
  }
}

function deleteStudent(id) {
  if (confirm("Are you sure you want to delete this student?")) {
    DataStore.delete("students", id);
    showAlert("Student deleted successfully", "success");
    renderStudents(currentContext);
  }
}

function searchStudents(query) {
  const students = DataStore.get("students");
  const filtered = students.filter(
    (s) =>
      s.firstName.toLowerCase().includes(query.toLowerCase()) ||
      s.surname.toLowerCase().includes(query.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(query.toLowerCase()),
  );

  const studentsHTML = filtered
    .map(
      (student) => `
                <tr>
                    <td>${student.rollNumber}</td>
                    <td>${student.firstName} ${student.surname}</td>
                    <td>${student.course} - Sem ${student.semester}</td>
                    <td>${student.batch}</td>
                    <td>${student.gender}</td>
                    <td>${student.category}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn action-btn-edit" onclick="editStudent('${student.id}')">Edit</button>
                            <button class="action-btn action-btn-delete" onclick="deleteStudent('${student.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `,
    )
    .join("");

  document.getElementById("studentTableBody").innerHTML =
    studentsHTML ||
    '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">No students found</td></tr>';
}

function openImportModal() {
  openModal("importModal");
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      let students = [];
      const content = e.target.result;

      if (file.name.endsWith(".json")) {
        students = JSON.parse(content);
      } else if (file.name.endsWith(".csv")) {
        const lines = content.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(",").map((v) => v.trim());
          const student = { id: generateId() };
          headers.forEach((header, index) => {
            student[header] = values[index];
          });
          if (student.semester) student.semester = parseInt(student.semester);
          students.push(student);
        }
      }

      // Add all students
      students.forEach((student) => {
        if (!student.id) student.id = generateId();
        DataStore.add("students", student);
      });

      showAlert(`Successfully imported ${students.length} students`, "success");
      closeModal("importModal");
      renderStudents(currentContext);
    } catch (error) {
      showAlert("Error importing file: " + error.message, "danger");
    }
  };

  reader.readAsText(file);
}

function exportStudents() {
  const students = DataStore.get("students");
  const csv = [
    [
      "rollNumber",
      "firstName",
      "surname",
      "fatherName",
      "batch",
      "course",
      "semester",
      "dob",
      "gender",
      "category",
      "address",
      "contact",
      "email",
    ].join(","),
    ...students.map((s) =>
      [
        s.rollNumber,
        s.firstName,
        s.surname,
        s.fatherName || "",
        s.batch,
        s.course,
        s.semester,
        s.dob || "",
        s.gender,
        s.category,
        s.address || "",
        s.contact || "",
        s.email || "",
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `students_export_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ==================== FACULTY MANAGEMENT ====================
function renderFaculty(context = {}) {
  const faculty = DataStore.get("faculty");

  const facultyHTML = faculty
    .map(
      (f) => `
                <tr>
                    <td>${f.name}</td>
                    <td>${f.subject}</td>
                    <td>${f.batch} - ${f.course} Sem ${f.semester}</td>
                    <td>${f.contact || "N/A"}</td>
                    <td>${f.email || "N/A"}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn action-btn-edit" onclick="editFaculty('${f.id}')">Edit</button>
                            <button class="action-btn action-btn-delete" onclick="deleteFaculty('${f.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `,
    )
    .join("");

  const content = `
                <div class="top-bar">
                    <div>
                        <h1 class="page-title">Faculty Management</h1>
                        <div class="breadcrumb">
                            <span>Home</span>
                            <span>/</span>
                            <span>Faculty</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="openAddFacultyModal()">
                        ➕ Add Faculty
                    </button>
                </div>

                <div class="content-card">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Subject</th>
                                    <th>Assigned To</th>
                                    <th>Contact</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${facultyHTML || '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No faculty members found</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Add Faculty Modal -->
                <div class="modal" id="addFacultyModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title" id="facultyModalTitle">Add Faculty Member</h2>
                            <button class="close-modal" onclick="closeModal('addFacultyModal')">×</button>
                        </div>
                        <form onsubmit="saveFaculty(event)">
                            <input type="hidden" name="facultyId" id="facultyId">
                            <div class="form-group">
                                <label class="form-label">Name *</label>
                                <input type="text" class="form-input" name="name" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Subject *</label>
                                <input type="text" class="form-input" name="subject" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Batch *</label>
                                    <input type="text" class="form-input" name="batch" required placeholder="e.g., 2025">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Course *</label>
                                    <select class="form-select" name="course" required>
                                        <option value="">Select Course</option>
                                        <option value="BCA">BCA</option>
                                        <option value="MCA">MCA</option>
                                        <option value="PGCA">PGCA</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Semester *</label>
                                <select class="form-select" name="semester" required>
                                    <option value="">Select Semester</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                    <option value="3">Semester 3</option>
                                    <option value="4">Semester 4</option>
                                    <option value="5">Semester 5</option>
                                    <option value="6">Semester 6</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Contact</label>
                                    <input type="tel" class="form-input" name="contact">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" name="email">
                                </div>
                            </div>
                            <div class="btn-group">
                                <button type="submit" class="btn btn-primary">Save Faculty</button>
                                <button type="button" class="btn btn-outline" onclick="closeModal('addFacultyModal')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

  document.getElementById("mainContent").innerHTML = content;
}

function openAddFacultyModal() {
  document.getElementById("facultyModalTitle").textContent =
    "Add Faculty Member";
  document.getElementById("addFacultyModal").querySelector("form").reset();
  document.getElementById("facultyId").value = "";
  openModal("addFacultyModal");
}

function saveFaculty(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const facultyId = formData.get("facultyId");

  const faculty = {
    id: facultyId || generateId(),
    name: formData.get("name"),
    subject: formData.get("subject"),
    batch: formData.get("batch"),
    course: formData.get("course"),
    semester: parseInt(formData.get("semester")),
    contact: formData.get("contact"),
    email: formData.get("email"),
  };

  if (facultyId) {
    DataStore.updateItem("faculty", facultyId, faculty);
    showAlert("Faculty updated successfully", "success");
  } else {
    DataStore.add("faculty", faculty);
    showAlert("Faculty added successfully", "success");
  }

  closeModal("addFacultyModal");
  renderFaculty();
}

function editFaculty(id) {
  const faculty = DataStore.get("faculty");
  const member = faculty.find((f) => f.id === id);

  if (member) {
    const form = document
      .getElementById("addFacultyModal")
      .querySelector("form");
    document.getElementById("facultyModalTitle").textContent = "Edit Faculty";
    document.getElementById("facultyId").value = member.id;
    form.name.value = member.name;
    form.subject.value = member.subject;
    form.batch.value = member.batch;
    form.course.value = member.course;
    form.semester.value = member.semester;
    form.contact.value = member.contact || "";
    form.email.value = member.email || "";

    openModal("addFacultyModal");
  }
}

function deleteFaculty(id) {
  if (confirm("Are you sure you want to delete this faculty member?")) {
    DataStore.delete("faculty", id);
    showAlert("Faculty deleted successfully", "success");
    renderFaculty();
  }
}

// ==================== LECTURE SCHEDULER ====================
function renderLectures(context = {}) {
  const lectures = DataStore.get("lectures");
  const faculty = DataStore.get("faculty");

  const lecturesHTML = lectures
    .map((lecture) => {
      const facultyMember = faculty.find((f) => f.id === lecture.facultyId);
      return `
                    <tr>
                        <td>${lecture.batch} - ${lecture.course} Sem ${lecture.semester}</td>
                        <td>${lecture.subject}</td>
                        <td>${facultyMember ? facultyMember.name : "N/A"}</td>
                        <td>${lecture.day}</td>
                        <td>${lecture.startTime} - ${lecture.endTime}</td>
                        <td>
                            <div class="action-btns">
                                <button class="action-btn action-btn-edit" onclick="editLecture('${lecture.id}')">Edit</button>
                                <button class="action-btn action-btn-delete" onclick="deleteLecture('${lecture.id}')">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
    })
    .join("");

  const content = `
                <div class="top-bar">
                    <div>
                        <h1 class="page-title">Lecture Scheduler</h1>
                        <div class="breadcrumb">
                            <span>Home</span>
                            <span>/</span>
                            <span>Lecture Scheduler</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="openAddLectureModal()">
                        ➕ Add Lecture
                    </button>
                </div>

                <div class="content-card">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Class</th>
                                    <th>Subject</th>
                                    <th>Faculty</th>
                                    <th>Day</th>
                                    <th>Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lecturesHTML || '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No lectures scheduled</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Add Lecture Modal -->
                <div class="modal" id="addLectureModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title" id="lectureModalTitle">Schedule Lecture</h2>
                            <button class="close-modal" onclick="closeModal('addLectureModal')">×</button>
                        </div>
                        <form onsubmit="saveLecture(event)">
                            <input type="hidden" name="lectureId" id="lectureId">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Batch *</label>
                                    <input type="text" class="form-input" name="batch" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Course *</label>
                                    <select class="form-select" name="course" required>
                                        <option value="">Select Course</option>
                                        <option value="BCA">BCA</option>
                                        <option value="MCA">MCA</option>
                                        <option value="PGCA">PGCA</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Semester *</label>
                                    <select class="form-select" name="semester" required>
                                        <option value="">Select Semester</option>
                                        <option value="1">Semester 1</option>
                                        <option value="2">Semester 2</option>
                                        <option value="3">Semester 3</option>
                                        <option value="4">Semester 4</option>
                                        <option value="5">Semester 5</option>
                                        <option value="6">Semester 6</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Subject *</label>
                                    <input type="text" class="form-input" name="subject" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Faculty *</label>
                                <select class="form-select" name="facultyId" required>
                                    <option value="">Select Faculty</option>
                                    ${faculty.map((f) => `<option value="${f.id}">${f.name} - ${f.subject}</option>`).join("")}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Day *</label>
                                <select class="form-select" name="day" required>
                                    <option value="">Select Day</option>
                                    <option value="Monday">Monday</option>
                                    <option value="Tuesday">Tuesday</option>
                                    <option value="Wednesday">Wednesday</option>
                                    <option value="Thursday">Thursday</option>
                                    <option value="Friday">Friday</option>
                                    <option value="Saturday">Saturday</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Start Time *</label>
                                    <input type="time" class="form-input" name="startTime" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">End Time *</label>
                                    <input type="time" class="form-input" name="endTime" required>
                                </div>
                            </div>
                            <div class="btn-group">
                                <button type="submit" class="btn btn-primary">Schedule Lecture</button>
                                <button type="button" class="btn btn-outline" onclick="closeModal('addLectureModal')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

  document.getElementById("mainContent").innerHTML = content;
}

function openAddLectureModal() {
  document.getElementById("lectureModalTitle").textContent = "Schedule Lecture";
  document.getElementById("addLectureModal").querySelector("form").reset();
  document.getElementById("lectureId").value = "";
  openModal("addLectureModal");
}

function saveLecture(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const lectureId = formData.get("lectureId");

  const lecture = {
    id: lectureId || generateId(),
    batch: formData.get("batch"),
    course: formData.get("course"),
    semester: parseInt(formData.get("semester")),
    subject: formData.get("subject"),
    facultyId: formData.get("facultyId"),
    day: formData.get("day"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  };

  if (lectureId) {
    DataStore.updateItem("lectures", lectureId, lecture);
    showAlert("Lecture updated successfully", "success");
  } else {
    DataStore.add("lectures", lecture);
    showAlert("Lecture scheduled successfully", "success");
  }

  closeModal("addLectureModal");
  renderLectures();
}

function editLecture(id) {
  const lectures = DataStore.get("lectures");
  const lecture = lectures.find((l) => l.id === id);

  if (lecture) {
    const form = document
      .getElementById("addLectureModal")
      .querySelector("form");
    document.getElementById("lectureModalTitle").textContent = "Edit Lecture";
    document.getElementById("lectureId").value = lecture.id;
    form.batch.value = lecture.batch;
    form.course.value = lecture.course;
    form.semester.value = lecture.semester;
    form.subject.value = lecture.subject;
    form.facultyId.value = lecture.facultyId;
    form.day.value = lecture.day;
    form.startTime.value = lecture.startTime;
    form.endTime.value = lecture.endTime;

    openModal("addLectureModal");
  }
}

function deleteLecture(id) {
  if (confirm("Are you sure you want to delete this lecture?")) {
    DataStore.delete("lectures", id);
    showAlert("Lecture deleted successfully", "success");
    renderLectures();
  }
}

// ==================== ATTENDANCE ====================
function renderAttendance(context = {}) {
  const students = DataStore.get("students");
  const lectures = DataStore.get("lectures");

  // Get unique class combinations
  const classes = [
    ...new Set(students.map((s) => `${s.batch}-${s.course}-${s.semester}`)),
  ];

  const classOptions = classes
    .map((c) => {
      const [batch, course, semester] = c.split("-");
      return `<option value="${c}">${batch} - ${course} Sem ${semester}</option>`;
    })
    .join("");

  const subjectOptions = context.selectedClass
    ? lectures
        .filter(
          (l) =>
            `${l.batch}-${l.course}-${l.semester}` === context.selectedClass,
        )
        .map((l) => `<option value="${l.id}">${l.subject}</option>`)
        .join("")
    : "";

  let attendanceFormHTML = "";
  if (context.selectedClass && context.selectedLecture) {
    const [batch, course, semester] = context.selectedClass.split("-");
    const classStudents = students.filter(
      (s) =>
        s.batch === batch &&
        s.course === course &&
        s.semester === parseInt(semester),
    );

    attendanceFormHTML = `
                    <div class="content-card">
                        <div class="card-header">
                            <h2 class="card-title">Mark Attendance</h2>
                            <button class="btn btn-success" onclick="saveAttendance()">Save Attendance</button>
                        </div>
                        <div class="attendance-grid" id="attendanceGrid">
                            ${classStudents
                              .map(
                                (student) => `
                                <div class="attendance-row">
                                    <div class="attendance-student">
                                        <strong>${student.rollNumber}</strong> - ${student.firstName} ${student.surname}
                                    </div>
                                    <div class="attendance-actions">
                                        <button class="attendance-btn present" data-student="${student.id}" data-status="present" onclick="toggleAttendance(this)">
                                            Present
                                        </button>
                                        <button class="attendance-btn absent" data-student="${student.id}" data-status="absent" onclick="toggleAttendance(this)">
                                            Absent
                                        </button>
                                    </div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                `;
  }

  const content = `
                <div class="top-bar">
                    <div>
                        <h1 class="page-title">Attendance Management</h1>
                        <div class="breadcrumb">
                            <span>Home</span>
                            <span>/</span>
                            <span>Attendance</span>
                        </div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h2 class="card-title">Select Class & Subject</h2>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Select Class</label>
                            <select class="form-select" id="classSelect" onchange="selectAttendanceClass(this.value)">
                                <option value="">Select Class</option>
                                ${classOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Select Subject</label>
                            <select class="form-select" id="subjectSelect" onchange="selectAttendanceSubject(this.value)" ${!context.selectedClass ? "disabled" : ""}>
                                <option value="">Select Subject</option>
                                ${subjectOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Date</label>
                            <input type="date" class="form-input" id="attendanceDate" value="${new Date().toISOString().split("T")[0]}">
                        </div>
                    </div>
                </div>

                ${attendanceFormHTML}

                <div class="content-card">
                    <div class="card-header">
                        <h2 class="card-title">Attendance History</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Class</th>
                                    <th>Subject</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="6" style="text-align: center; color: var(--text-secondary);">No attendance records yet</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

  document.getElementById("mainContent").innerHTML = content;

  // Restore selections
  if (context.selectedClass) {
    document.getElementById("classSelect").value = context.selectedClass;
  }
  if (context.selectedLecture) {
    document.getElementById("subjectSelect").value = context.selectedLecture;
  }
}

function selectAttendanceClass(classValue) {
  navigateTo("attendance", { selectedClass: classValue });
}

function selectAttendanceSubject(lectureId) {
  navigateTo("attendance", {
    selectedClass: document.getElementById("classSelect").value,
    selectedLecture: lectureId,
  });
}

const attendanceData = {};

function toggleAttendance(button) {
  const studentId = button.dataset.student;
  const status = button.dataset.status;
  const row = button.closest(".attendance-row");

  // Clear all active states in this row
  row.querySelectorAll(".attendance-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Set active state
  button.classList.add("active");
  attendanceData[studentId] = status;
}

function saveAttendance() {
  const classSelect = document.getElementById("classSelect").value;
  const lectureId = document.getElementById("subjectSelect").value;
  const date = document.getElementById("attendanceDate").value;

  if (!classSelect || !lectureId) {
    showAlert("Please select class and subject", "warning");
    return;
  }

  const lectures = DataStore.get("lectures");
  const lecture = lectures.find((l) => l.id === lectureId);

  Object.entries(attendanceData).forEach(([studentId, status]) => {
    const record = {
      id: generateId(),
      studentId: studentId,
      lectureId: lectureId,
      batch: lecture.batch,
      course: lecture.course,
      semester: lecture.semester,
      subject: lecture.subject,
      date: date,
      status: status,
    };
    DataStore.add("attendance", record);
  });

  showAlert("Attendance saved successfully", "success");
  navigateTo("attendance");
}

// ==================== MARKS ====================
function renderMarks(context = {}) {
  const students = DataStore.get("students");
  const lectures = DataStore.get("lectures");

  const classes = [
    ...new Set(students.map((s) => `${s.batch}-${s.course}-${s.semester}`)),
  ];

  const classOptions = classes
    .map((c) => {
      const [batch, course, semester] = c.split("-");
      return `<option value="${c}">${batch} - ${course} Sem ${semester}</option>`;
    })
    .join("");

  const subjectOptions = context.selectedClass
    ? lectures
        .filter(
          (l) =>
            `${l.batch}-${l.course}-${l.semester}` === context.selectedClass,
        )
        .map((l) => `<option value="${l.subject}">${l.subject}</option>`)
        .join("")
    : "";

  let marksFormHTML = "";
  if (context.selectedClass && context.selectedSubject) {
    const [batch, course, semester] = context.selectedClass.split("-");
    const classStudents = students.filter(
      (s) =>
        s.batch === batch &&
        s.course === course &&
        s.semester === parseInt(semester),
    );

    const marks = DataStore.get("marks");

    marksFormHTML = `
                    <div class="content-card">
                        <div class="card-header">
                            <h2 class="card-title">Enter Marks</h2>
                            <button class="btn btn-success" onclick="saveMarks()">Save Marks</button>
                        </div>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Student Name</th>
                                        <th>Marks (out of 100)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${classStudents
                                      .map((student) => {
                                        const existingMark = marks.find(
                                          (m) =>
                                            m.studentId === student.id &&
                                            m.subject ===
                                              context.selectedSubject,
                                        );
                                        return `
                                            <tr>
                                                <td>${student.rollNumber}</td>
                                                <td>${student.firstName} ${student.surname}</td>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        class="form-input" 
                                                        min="0" 
                                                        max="100" 
                                                        data-student="${student.id}"
                                                        value="${existingMark ? existingMark.marks : ""}"
                                                        placeholder="Enter marks"
                                                    >
                                                </td>
                                            </tr>
                                        `;
                                      })
                                      .join("")}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
  }

  const content = `
                <div class="top-bar">
                    <div>
                        <h1 class="page-title">Marks Entry</h1>
                        <div class="breadcrumb">
                            <span>Home</span>
                            <span>/</span>
                            <span>Marks</span>
                        </div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h2 class="card-title">Select Class & Subject</h2>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Select Class</label>
                            <select class="form-select" id="marksClassSelect" onchange="selectMarksClass(this.value)">
                                <option value="">Select Class</option>
                                ${classOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Select Subject</label>
                            <select class="form-select" id="marksSubjectSelect" onchange="selectMarksSubject(this.value)" ${!context.selectedClass ? "disabled" : ""}>
                                <option value="">Select Subject</option>
                                ${subjectOptions}
                            </select>
                        </div>
                    </div>
                </div>

                ${marksFormHTML}
            `;

  document.getElementById("mainContent").innerHTML = content;

  if (context.selectedClass) {
    document.getElementById("marksClassSelect").value = context.selectedClass;
  }
  if (context.selectedSubject) {
    document.getElementById("marksSubjectSelect").value =
      context.selectedSubject;
  }
}

function selectMarksClass(classValue) {
  navigateTo("marks", { selectedClass: classValue });
}

function selectMarksSubject(subject) {
  navigateTo("marks", {
    selectedClass: document.getElementById("marksClassSelect").value,
    selectedSubject: subject,
  });
}

function saveMarks() {
  const classSelect = document.getElementById("marksClassSelect").value;
  const subject = document.getElementById("marksSubjectSelect").value;

  if (!classSelect || !subject) {
    showAlert("Please select class and subject", "warning");
    return;
  }

  const [batch, course, semester] = classSelect.split("-");
  const inputs = document.querySelectorAll("input[data-student]");

  inputs.forEach((input) => {
    const studentId = input.dataset.student;
    const marksValue = parseFloat(input.value);

    if (marksValue >= 0 && marksValue <= 100) {
      // Check if mark already exists
      const existingMarks = DataStore.get("marks");
      const existingIndex = existingMarks.findIndex(
        (m) => m.studentId === studentId && m.subject === subject,
      );

      const markRecord = {
        id: existingIndex >= 0 ? existingMarks[existingIndex].id : generateId(),
        studentId: studentId,
        batch: batch,
        course: course,
        semester: parseInt(semester),
        subject: subject,
        marks: marksValue,
        maxMarks: 100,
        date: new Date().toISOString().split("T")[0],
      };

      if (existingIndex >= 0) {
        DataStore.updateItem("marks", markRecord.id, markRecord);
      } else {
        DataStore.add("marks", markRecord);
      }
    }
  });

  showAlert("Marks saved successfully", "success");
}

// ==================== PERFORMANCE ====================
function renderPerformance(context = {}) {
  const students = DataStore.get("students");
  const attendance = DataStore.get("attendance");
  const marks = DataStore.get("marks");

  // Calculate performance for each student
  const performanceData = students.map((student) => {
    // Calculate attendance percentage
    const studentAttendance = attendance.filter(
      (a) => a.studentId === student.id,
    );
    const presentCount = studentAttendance.filter(
      (a) => a.status === "present",
    ).length;
    const attendancePercentage =
      studentAttendance.length > 0
        ? ((presentCount / studentAttendance.length) * 100).toFixed(1)
        : 0;

    // Calculate average marks
    const studentMarks = marks.filter((m) => m.studentId === student.id);
    const avgMarks =
      studentMarks.length > 0
        ? (
            studentMarks.reduce((sum, m) => sum + m.marks, 0) /
            studentMarks.length
          ).toFixed(1)
        : 0;

    // Determine performance category
    let performance = "N/A";
    if (avgMarks >= 75) performance = "Good";
    else if (avgMarks >= 50) performance = "Average";
    else if (avgMarks > 0) performance = "Needs Improvement";

    return {
      student,
      attendancePercentage,
      avgMarks,
      performance,
      lowAttendance: parseFloat(attendancePercentage) < 75,
    };
  });

  const performanceHTML = performanceData
    .map(
      (data) => `
                <tr>
                    <td>${data.student.rollNumber}</td>
                    <td>${data.student.firstName} ${data.student.surname}</td>
                    <td>${data.student.course} - Sem ${data.student.semester}</td>
                    <td>
                        <span class="badge ${data.lowAttendance ? "badge-danger" : "badge-success"}">
                            ${data.attendancePercentage}%
                        </span>
                    </td>
                    <td>${data.avgMarks}</td>
                    <td>
                        <span class="badge ${
                          data.performance === "Good"
                            ? "badge-success"
                            : data.performance === "Average"
                              ? "badge-warning"
                              : data.performance === "Needs Improvement"
                                ? "badge-danger"
                                : "badge-info"
                        }">
                            ${data.performance}
                        </span>
                    </td>
                </tr>
            `,
    )
    .join("");

  const content = `
                <div class="top-bar">
                    <div>
                        <h1 class="page-title">Student Performance</h1>
                        <div class="breadcrumb">
                            <span>Home</span>
                            <span>/</span>
                            <span>Performance</span>
                        </div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="search-bar">
                        <span class="search-icon">🔍</span>
                        <input type="text" class="search-input" placeholder="Search students..." onkeyup="searchPerformance(this.value)">
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Attendance</th>
                                    <th>Avg Marks</th>
                                    <th>Performance</th>
                                </tr>
                            </thead>
                            <tbody id="performanceTableBody">
                                ${performanceHTML || '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No performance data available</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

  document.getElementById("mainContent").innerHTML = content;
}

function searchPerformance(query) {
  const students = DataStore.get("students");
  const attendance = DataStore.get("attendance");
  const marks = DataStore.get("marks");

  const filtered = students.filter(
    (s) =>
      s.firstName.toLowerCase().includes(query.toLowerCase()) ||
      s.surname.toLowerCase().includes(query.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(query.toLowerCase()),
  );

  const performanceData = filtered.map((student) => {
    const studentAttendance = attendance.filter(
      (a) => a.studentId === student.id,
    );
    const presentCount = studentAttendance.filter(
      (a) => a.status === "present",
    ).length;
    const attendancePercentage =
      studentAttendance.length > 0
        ? ((presentCount / studentAttendance.length) * 100).toFixed(1)
        : 0;

    const studentMarks = marks.filter((m) => m.studentId === student.id);
    const avgMarks =
      studentMarks.length > 0
        ? (
            studentMarks.reduce((sum, m) => sum + m.marks, 0) /
            studentMarks.length
          ).toFixed(1)
        : 0;

    let performance = "N/A";
    if (avgMarks >= 75) performance = "Good";
    else if (avgMarks >= 50) performance = "Average";
    else if (avgMarks > 0) performance = "Needs Improvement";

    return {
      student,
      attendancePercentage,
      avgMarks,
      performance,
      lowAttendance: parseFloat(attendancePercentage) < 75,
    };
  });

  const performanceHTML = performanceData
    .map(
      (data) => `
                <tr>
                    <td>${data.student.rollNumber}</td>
                    <td>${data.student.firstName} ${data.student.surname}</td>
                    <td>${data.student.course} - Sem ${data.student.semester}</td>
                    <td>
                        <span class="badge ${data.lowAttendance ? "badge-danger" : "badge-success"}">
                            ${data.attendancePercentage}%
                        </span>
                    </td>
                    <td>${data.avgMarks}</td>
                    <td>
                        <span class="badge ${
                          data.performance === "Good"
                            ? "badge-success"
                            : data.performance === "Average"
                              ? "badge-warning"
                              : data.performance === "Needs Improvement"
                                ? "badge-danger"
                                : "badge-info"
                        }">
                            ${data.performance}
                        </span>
                    </td>
                </tr>
            `,
    )
    .join("");

  document.getElementById("performanceTableBody").innerHTML =
    performanceHTML ||
    '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No performance data found</td></tr>';
}

// ==================== SETTINGS ====================
function renderSettings() {
  const data = DataStore.getData();
  const totalStudents = DataStore.get("students").length;
  const totalFaculty = DataStore.get("faculty").length;
  const totalLectures = DataStore.get("lectures").length;
  const totalAttendance = DataStore.get("attendance").length;
  const totalMarks = DataStore.get("marks").length;

  const content = `
                <div class="top-bar">
                    <div>
                        <h1 class="page-title">Settings</h1>
                        <div class="breadcrumb">
                            <span>Home</span>
                            <span>/</span>
                            <span>Settings</span>
                        </div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h2 class="card-title">System Information</h2>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Department Name</label>
                        <input type="text" class="form-input" id="deptName" value="${data.departments[0]?.name || "Computer Department"}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Current User Name</label>
                        <input type="text" class="form-input" id="userName" value="${data.currentUser.name}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">User Email</label>
                        <input type="email" class="form-input" id="userEmail" value="${data.currentUser.email}">
                    </div>
                    <button class="btn btn-primary" onclick="saveSettings()">
                        💾 Save Settings
                    </button>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h2 class="card-title">Database Statistics</h2>
                    </div>
                    <div class="dashboard-grid">
                        <div class="stat-card">
                            <div class="stat-card-header">
                                <div class="stat-icon" style="background: #dbeafe; color: #1e40af;">👥</div>
                            </div>
                            <div class="stat-value">${totalStudents}</div>
                            <div class="stat-label">Total Students</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-header">
                                <div class="stat-icon" style="background: #d1fae5; color: #065f46;">👨‍🏫</div>
                            </div>
                            <div class="stat-value">${totalFaculty}</div>
                            <div class="stat-label">Faculty Members</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-header">
                                <div class="stat-icon" style="background: #fef3c7; color: #92400e;">📅</div>
                            </div>
                            <div class="stat-value">${totalLectures}</div>
                            <div class="stat-label">Scheduled Lectures</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-header">
                                <div class="stat-icon" style="background: #e0e7ff; color: #3730a3;">✅</div>
                            </div>
                            <div class="stat-value">${totalAttendance}</div>
                            <div class="stat-label">Attendance Records</div>
                        </div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h2 class="card-title">Data Management</h2>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-secondary" onclick="exportAllData()">
                            📤 Export All Data (JSON)
                        </button>
                        <button class="btn btn-primary" onclick="document.getElementById('importAllData').click()">
                            📥 Import Data (JSON)
                        </button>
                        <input type="file" id="importAllData" accept=".json" style="display: none;" onchange="importAllData(event)">
                    </div>
                    <div style="margin-top: 1rem; padding: 1rem; background: #dbeafe; border-radius: 8px; border-left: 4px solid var(--accent);">
                        <strong>💡 Tip:</strong> Export your data regularly to keep a backup. You can import it later to restore all information.
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h2 class="card-title">Danger Zone</h2>
                    </div>
                    <button class="btn btn-danger" onclick="clearAllData()">
                        🗑️ Clear All Data
                    </button>
                    <div style="margin-top: 1rem; padding: 1rem; background: #fee2e2; border-radius: 8px; border-left: 4px solid var(--danger);">
                        <strong>⚠️ Warning:</strong> Clearing all data will permanently delete all students, faculty, lectures, attendance, and marks data. This action cannot be undone. Make sure to export your data first!
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h2 class="card-title">About VidyaSetu</h2>
                    </div>
                    <div style="display: grid; gap: 0.75rem;">
                        <p><strong>Version:</strong> 1.0.0</p>
                        <p><strong>Description:</strong> Complete college department management system with student, faculty, lecture scheduling, attendance, and marks management.</p>
                        <p><strong>Features:</strong></p>
                        <ul style="margin-left: 1.5rem; color: var(--text-secondary);">
                            <li>Department & Batch Structure Management</li>
                            <li>Student Management (Add/Edit/Delete/Import/Export)</li>
                            <li>Faculty Assignment & Management</li>
                            <li>Lecture Scheduling</li>
                            <li>Attendance Tracking & Reports</li>
                            <li>Marks Entry & Performance Analysis</li>
                            <li>Local Data Storage (Browser localStorage)</li>
                            <li>Mobile Responsive Design</li>
                        </ul>
                        <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.875rem;">
                            <strong>Storage:</strong> All data is stored locally in your browser's localStorage. No internet connection required after loading.
                        </p>
                        <p style="color: var(--text-secondary); font-size: 0.875rem;">
                            <strong>Privacy:</strong> Your data never leaves your device and is completely private.
                        </p>
                    </div>
                </div>
            `;

  document.getElementById("mainContent").innerHTML = content;
}

function saveSettings() {
  const deptName = document.getElementById("deptName").value;
  const userName = document.getElementById("userName").value;
  const userEmail = document.getElementById("userEmail").value;

  const data = DataStore.getData();
  data.departments[0].name = deptName;
  data.currentUser.name = userName;
  data.currentUser.email = userEmail;
  DataStore.save(data);

  // Update sidebar user name
  document.getElementById("sidebarUserName").textContent = userName;

  showAlert("Settings saved successfully!", "success");
}

function importAllData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);

      // Validate the data structure
      if (
        !importedData.departments ||
        !importedData.students ||
        !importedData.faculty
      ) {
        throw new Error("Invalid data format");
      }

      // Ask for confirmation
      if (
        confirm(
          "This will replace all existing data with the imported data. Are you sure?",
        )
      ) {
        DataStore.save(importedData);
        showAlert("Data imported successfully!", "success");
        setTimeout(() => {
          renderSettings();
        }, 1000);
      }
    } catch (error) {
      showAlert("Error importing data: " + error.message, "danger");
    }
  };
  reader.readAsText(file);

  // Reset input
  event.target.value = "";
}

function exportAllData() {
  const data = DataStore.getData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vidyasetu_backup_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
  showAlert("Data exported successfully", "success");
}

function clearAllData() {
  if (
    confirm(
      "Are you sure you want to clear all data? This action cannot be undone.",
    )
  ) {
    if (
      confirm(
        "This will delete ALL students, faculty, lectures, attendance, and marks. Are you absolutely sure?",
      )
    ) {
      localStorage.removeItem("vidyasetu_data");
      DataStore.init();
      showAlert("All data cleared successfully", "success");
      navigateTo("dashboard");
    }
  }
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    showAlert("Logged out successfully", "success");
    setTimeout(() => {
      navigateTo("dashboard");
    }, 1000);
  }
}

// ==================== INITIALIZE APP ====================
document.addEventListener("DOMContentLoaded", function () {
  // Load user name from storage
  const data = DataStore.getData();
  if (data.currentUser && data.currentUser.name) {
    document.getElementById("sidebarUserName").textContent =
      data.currentUser.name;
  }

  // Render dashboard
  renderDashboard();
});
