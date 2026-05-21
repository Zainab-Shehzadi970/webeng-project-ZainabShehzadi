const XLSX = require('xlsx');

const importExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  const cleanedData = data.map(row => {
    const keys = Object.keys(row);
    const findVal = (...names) => {
      const key = keys.find(k =>
        names.includes(k.toLowerCase().trim().replace(/\s+/g, '_'))
      );
      return key ? String(row[key]).trim() : '';
    };

    return {
      name:       findVal('name', 'student_name', 'full_name'),
      student_id: findVal('student_id', 'studentid', 'id', 'roll_no', 'roll'),
      course:     findVal('course', 'course_name', 'subject')
    };
  }).filter(r => r.name && r.student_id);

  return cleanedData;
};

module.exports = importExcel;