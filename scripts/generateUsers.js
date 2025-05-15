require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');


const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'elearning_platform'
});


async function generatePasswordHash(password) {
    return await bcrypt.hash(password, 10);
}


async function insertAdmins() {
    const admins = [
        { 
            id: 10000001, 
            name: 'Admin System',
            email: 'admin@system.com',
            password: 'admin@1' 
        }
    ];

    const connection = await pool.getConnection(); 

    try {
        for (let admin of admins) {
            const hashedPassword = await generatePasswordHash(admin.password);

  
            await connection.execute(
                `INSERT INTO users (id, name, email, password_hash, role, status) 
                 VALUES (?, ?, ?, ?, 'admin', 'active')`,
                [admin.id, admin.name, admin.email, hashedPassword]
            );

            console.log(` Đã thêm admin: ${admin.name}`);
            console.log(' Email:', admin.email);
            console.log(' Mật khẩu:', admin.password);
            console.log('------------------------');
        }

        console.log(' Hoàn tất tạo tài khoản admin!');
    } catch (error) {
        console.error(" Lỗi khi thêm admin:", error);
    } finally {
        connection.release(); 
    }
}

insertAdmins().then(() => {
    console.log(' Script đã kết thúc');
    process.exit(0);
}).catch(error => {
    console.error(' Lỗi:', error);
    process.exit(1);
});