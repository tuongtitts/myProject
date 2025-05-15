require("dotenv").config();
const mysql = require('mysql2/promise');
const db = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '123456',
        database: process.env.DB_NAME || 'elearning_platform'
});
(async () => {
    try {
        const connection = await db.getConnection();
        console.log(" Kết nối MySQL thành công!");
        connection.release();
    } catch (error) {
        console.error("Lỗi kết nối MySQL:", error);
    }
})();
module.exports = db;    
