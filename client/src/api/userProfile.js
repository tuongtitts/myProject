import { getAuthHeaders, logout } from "./auth.js";  

export async function getUserProfile(usernameElement, accountImage) {
    try {
        if (!usernameElement || !accountImage) {
            throw new Error("usernameElement hoặc accountImage không hợp lệ");
        }

        const response = await fetch("http://localhost:5000/api/user/profile", {
            method: "GET",
            headers: getAuthHeaders(),
            credentials: "include" 
        });

        if (!response.ok) {
            throw new Error(`Lỗi tải thông tin người dùng: ${response.status}`);
        }

        const data = await response.json();
        if (!data?.name) {  
            throw new Error("Dữ liệu người dùng không hợp lệ");
        }

        updateUserDisplay(usernameElement, accountImage, data.name); 
    } catch (error) {
        console.error(" Profile load error:", error);
        logout();  
    }
}

export function updateUserDisplay(usernameElement, accountImage, name) { 
    usernameElement.textContent = name;  
    accountImage.textContent = getInitials(name);  
}

function getInitials(name) {
    return name.split(" ")
        .map(word => word.charAt(0).toUpperCase())
        .join("");
}