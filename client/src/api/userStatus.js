
import { getAuthHeaders } from "./auth.js";

export async function fetchOnlineUsers({ maxRetries = 3, retryDelay = 2000 } = {}) {

  if (!navigator.onLine) {
    console.warn("Không có kết nối mạng!");
    alert("Bạn đang offline. Vui lòng kiểm tra kết nối mạng.");
    return [];
  }

  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await fetch("http://localhost:5000/api/users/online", {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
        signal: AbortSignal.timeout(5000), 
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi tải danh sách: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data?.online_users || !Array.isArray(data.online_users)) {
        throw new Error("Dữ liệu không hợp lệ từ server");
      }

      const users = data.online_users.map((user) => ({
        id: user.id || user.name?.charCodeAt(0),
        name: user.name,
        online: user.isOnline === 1,
      }));

      return users;
    } catch (error) {
      retries++;
      console.error(`Lỗi khi lấy danh sách người dùng online (thử ${retries}/${maxRetries}):`, error);

      if (retries === maxRetries) {

        alert("Không thể tải danh sách người dùng online. Vui lòng thử lại sau.");
        return [];
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  return [];
}


window.addEventListener("online", () => {
  console.log("Đã kết nối lại mạng. Tải lại danh sách người dùng...");
  fetchOnlineUsers(); 
});

window.addEventListener("offline", () => {
  console.warn("Mất kết nối mạng!");
  alert("Bạn đã mất kết nối mạng. Một số chức năng có thể không hoạt động.");
});

window.addEventListener("beforeunload", async () => {
  try {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      keepalive: true, 
    });
  } catch (error) {
    console.error("Error during logout on unload:", error);
  }
});