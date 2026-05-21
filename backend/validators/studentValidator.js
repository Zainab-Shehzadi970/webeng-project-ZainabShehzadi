// ➤ ADD / CREATE STUDENT
exports.validateAddStudent = (req, res, next) => {
  const { name, student_id, course_id } = req.body;

  // Required fields
  if (!name || !student_id || !course_id) {
    return res.status(400).json({ message: 'All fields are required ❌' });
  }

  // Name length check
  if (name.length < 3) {
    return res.status(400).json({ message: 'Name too short ❌' });
  }

  // Student ID basic check
  if (student_id.length < 3) {
    return res.status(400).json({ message: 'Invalid Student ID ❌' });
  }

  next();
};



// ➤ UPDATE STUDENT
exports.validateUpdateStudent = (req, res, next) => {
  const { name, student_id, course_id } = req.body;

  if (!name || !student_id || !course_id) {
    return res.status(400).json({ message: 'All fields are required ❌' });
  }

  next();
};



// ➤ GET SINGLE / DELETE VALIDATION (ID check)
exports.validateStudentId = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'Invalid student ID ❌' });
  }

  next();
};
