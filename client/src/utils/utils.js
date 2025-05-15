export function showLoading(show) {
    let loader = document.getElementById("loading-indicator");

    if (show) {
        if (!loader) {
            loader = document.createElement("div");
            loader.id = "loading-indicator";
            loader.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                ">
                    <div style="
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        text-align: center;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                    ">
                        <div class="spinner" style="
                            width: 40px;
                            height: 40px;
                            border: 4px solid rgba(0, 0, 0, 0.3);
                            border-top-color: black;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto;
                        "></div>
                        <p style="margin-top: 10px;">Đang xử lý...</p>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
        }
        return loader; // Trả về loader để có thể xóa sau này
    } else {
        if (loader) {
            loader.remove(); // Xóa loader nếu tồn tại
        }
        return null; // Không cần trả về gì khi xóa
    }
}