const XLSX = require('xlsx');

/**
 * Standard flat export
 */
const exportToExcel = (data = [], res, fileName = 'data') => {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      data = [{ message: 'No data available' }];
    }
    const worksheet = XLSX.utils.json_to_sheet(data, { header: Object.keys(data[0]) });
    const wscols = Object.keys(data[0]).map(key => ({
      wch: Math.max(key.length, ...data.map(row => (row[key] ? row[key].toString().length : 0)))
    }));
    worksheet['!cols'] = wscols;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Excel Export Error', error);
    res.status(500).json({ success: false, message: 'Failed to export Excel' });
  }
};

/**
 * Pivot / bulk export
 * Row 1: Student ID | Student Name | Attendance (merged) | ... | Total Average%
 * Row 2: blank      | blank        | 19 May 2026 | 20 May 2026 | ...
 * Row 3+: STU001    | Name         | P | A | L | ...  | 75%
 */
const exportBulkToExcel = (rows = [], res, fileName = 'attendance') => {
  try {
    if (!rows || rows.length === 0) {
      return exportToExcel([{ message: 'No attendance data found' }], res, fileName);
    }

    // Unique dates sorted
    const dateSet = new Set();
    rows.forEach(r => { if (r.date) dateSet.add(r.date); });
    const dates = Array.from(dateSet).sort();

    // Unique students — ordered by student_id text
    const studentMap = new Map();
    rows.forEach(r => {
      if (!studentMap.has(r.student_id)) {
        studentMap.set(r.student_id, { student_id: r.student_id, name: r.name });
      }
    });
    const students = Array.from(studentMap.values());

    // Lookup: "student_id__date" -> P/A/L
    const lookup = {};
    rows.forEach(r => {
      const key = `${r.student_id}__${r.date}`;
      const s = r.status ? r.status.charAt(0).toUpperCase() : '';
      lookup[key] = s;
    });

    // Format date: "19 May\n2026"
    function fmtDate(dateStr) {
      const d = new Date(dateStr);
      const day = d.getUTCDate();
      const mon = d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' });
      const yr  = d.getUTCFullYear();
      return `${day} ${mon}\n${yr}`;
    }

    const workbook = XLSX.utils.book_new();
    const ws = {};
    const numDates = dates.length;
    const avgCol   = 2 + numDates;

    // ── Row 0: Header row 1 ──
    ws[XLSX.utils.encode_cell({ r: 0, c: 0 })] = { v: 'Student ID',       t: 's' };
    ws[XLSX.utils.encode_cell({ r: 0, c: 1 })] = { v: 'Student Name',     t: 's' };
    ws[XLSX.utils.encode_cell({ r: 0, c: 2 })] = { v: 'Attendance',       t: 's' };
    ws[XLSX.utils.encode_cell({ r: 0, c: avgCol })] = { v: 'Total\nAverage %', t: 's' };

    // Merge "Attendance" across date columns
    ws['!merges'] = [{ s: { r: 0, c: 2 }, e: { r: 0, c: avgCol - 1 } }];

    // ── Row 1: Date headers ──
    dates.forEach((d, i) => {
      ws[XLSX.utils.encode_cell({ r: 1, c: 2 + i })] = { v: fmtDate(d), t: 's' };
    });

    // ── Rows 2+: Student data ──
    students.forEach((stu, sIdx) => {
      const r = sIdx + 2;
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = { v: stu.student_id, t: 's' };
      ws[XLSX.utils.encode_cell({ r, c: 1 })] = { v: stu.name,       t: 's' };

      let presentCount = 0, totalCount = 0;

      dates.forEach((d, dIdx) => {
        const key    = `${stu.student_id}__${d}`;
        const status = lookup[key] || '';
        ws[XLSX.utils.encode_cell({ r, c: 2 + dIdx })] = { v: status, t: 's' };
        if (status) {
          totalCount++;
          if (status === 'P') presentCount++;
        }
      });

      const avgVal = totalCount > 0
        ? (presentCount / totalCount * 100).toFixed(1) + '%'
        : '0%';
      ws[XLSX.utils.encode_cell({ r, c: avgCol })] = { v: avgVal, t: 's' };
    });

    // Worksheet range
    ws['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: students.length + 1, c: avgCol }
    });

    // Column widths
    ws['!cols'] = [
      { wch: 14 },                      // Student ID
      { wch: 22 },                      // Student Name
      ...dates.map(() => ({ wch: 11 })),// date cols
      { wch: 13 }                       // Average
    ];

    // Row heights — taller for header rows with line breaks
    ws['!rows'] = [{ hpt: 20 }, { hpt: 32 }];

    XLSX.utils.book_append_sheet(workbook, ws, 'Attendance');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Bulk Excel Export Error', error);
    res.status(500).json({ success: false, message: 'Failed to export bulk Excel' });
  }
};

module.exports = exportToExcel;
module.exports.exportBulkToExcel = exportBulkToExcel;