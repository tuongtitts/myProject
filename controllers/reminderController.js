const reminderModel = require('../models/reminderModel');

// Lấy danh sách ghi chú học tập theo học sinh, tháng và năm
exports.getRemindersByMonth = async (req, res) => {
    try {
        const { studentId, month, year } = req.params;
        console.log(`[GET] Fetching reminders for studentId: ${studentId}, month: ${month}, year: ${year}`);
        
        // Kiểm tra quyền truy cập
        if (req.user.id !== parseInt(studentId)) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập ghi chú này!" });
        }
        
        const [reminders] = await reminderModel.getRemindersByStudent(studentId, month, year);
        res.json(reminders);
    } catch (err) {
        console.error('[GET] Error fetching reminders:', err);
        res.status(500).json({ message: "Lỗi khi lấy ghi chú!" });
    }
};

// Tạo mới ghi chú học tập
exports.createReminder = async (req, res) => {
    try {
        // Kiểm tra quyền tạo ghi chú
        if (req.user.id !== parseInt(req.body.student_id)) {
            return res.status(403).json({ message: "Bạn không có quyền tạo ghi chú cho người khác!" });
        }
        
        const result = await reminderModel.createReminder(req.body);
        console.log(`[POST] Created reminder with id: ${result[0].insertId}`);
        res.json({ message: "Ghi chú được tạo thành công!", id: result[0].insertId });
    } catch (err) {
        console.error('[POST] Error creating reminder:', err);
        res.status(500).json({ message: "Lỗi khi thêm ghi chú!" });
    }
};

// Xóa ghi chú theo ID
exports.deleteReminder = async (req, res) => {
    try {
        const { id, studentId } = req.params; // Lấy studentId và id từ params
        const loggedInStudentId = req.user.id; // ID học sinh từ token
        
        // Kiểm tra quyền xóa ghi chú
        if (loggedInStudentId !== parseInt(studentId)) {
            return res.status(403).json({ message: "Bạn không có quyền xóa ghi chú của người khác!" });
        }
        
        console.log(`[DELETE] Attempting to delete reminder id: ${id}, studentId: ${studentId}`);
        const [result] = await reminderModel.deleteReminder(id, studentId);
        
        if (result.affectedRows === 0) {
            console.log(`[DELETE] No reminder found for id: ${id}, studentId: ${studentId}`);
            return res.status(404).json({ message: "Không tìm thấy ghi chú hoặc bạn không có quyền xóa!" });
        }
        
        console.log(`[DELETE] Successfully deleted reminder id: ${id}`);
        res.json({ message: "Ghi chú đã được xóa!" });
    } catch (err) {
        console.error('[DELETE] Error deleting reminder:', err);
        res.status(500).json({ message: "Lỗi khi xóa ghi chú!" });
    }
};