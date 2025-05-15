const db = require('../config/db'); // import module kết nối csdl
// lấy thông tin người dùng theo id
const getUserById = async (id) => {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return users.length ? users[0] : null;
};
// kiểm tra trạng thái online
const updateUserOnlineStatus = async (id, status) => {
    const [result] = await db.query('UPDATE users SET isOnline = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
};
// const getAllUsers = async () => {
//     const [users] = await db.query('SELECT * FROM users');
//     return users;
// };
const getAllUsers = async () => {
    const [users] = await db.query(`
        SELECT id, name, email, role, status, created_at, last_login 
        FROM users
        ORDER BY id
    `);
    return users;
};

module.exports = {
    getUserById,
    updateUserOnlineStatus,
    getAllUsers
};
