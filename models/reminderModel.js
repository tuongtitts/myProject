const db = require("../config/db");

// Lấy danh sách ghi chú học tập theo học sinh, tháng và năm
exports.getRemindersByStudent = (studentId, month, year) => {
    return db.query(
        `SELECT * FROM study_reminders 
         WHERE student_id = ? 
         AND MONTH(schedule_date) = ? 
         AND YEAR(schedule_date) = ? 
         ORDER BY schedule_date`,
        [studentId, parseInt(month), parseInt(year)]
    );
};

// Tạo mới ghi chú học tập
exports.createReminder = ({ student_id, note, schedule_date }) => {
    return db.query(
        `INSERT INTO study_reminders (student_id, note, schedule_date) 
         VALUES (?, ?, ?)`,
        [student_id, note, schedule_date]
    );
};

// Xóa ghi chú theo ID và student_id
exports.deleteReminder = (id, studentId) => {
    return db.query(
        `DELETE FROM study_reminders 
         WHERE id = ? AND student_id = ?`,
        [id, studentId]
    );
};