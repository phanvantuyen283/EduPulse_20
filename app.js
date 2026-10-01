// ============================================================
// HỆ THỐNG EDUPULSE 2.0 - TỆP XỬ LÝ CHÍNH (app.js)
// Collection Firestore: hoc_sinh
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. Cấu hình Firebase Project
const firebaseConfig = {
    apiKey: "AIzaSyDgPsOLRCLmzQAbC2eI0QX8gXLF7FicIzk",
    authDomain: "edupulse-20.firebaseapp.com",
    projectId: "edupulse-20"
};

// Khởi tạo Firebase App & Firestore DB
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Đưa db lên window để các script khác (nếu có) có thể tái sử dụng
window.db = db;

// 2. Các hàm tiện ích (Helpers)
function showError(msg) {
    const errorMsg = document.getElementById("error-msg");
    if (errorMsg) {
        errorMsg.innerText = msg;
        errorMsg.style.display = "block";
    } else {
        alert(msg);
    }
}

function clearError() {
    const errorMsg = document.getElementById("error-msg");
    if (errorMsg) {
        errorMsg.innerText = "";
        errorMsg.style.display = "none";
    }
}

function getCurrentUser() {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}
window.logout = logout; // Cho phép gọi hàm từ button onclick="logout()"

// 3. Bộ xử lý Đăng Nhập (Login Controller)
function initLoginController() {
    const lopSelect = document.getElementById("lop-select");
    const nameSelect = document.getElementById("student-name");
    const pinInput = document.getElementById("pin-code");
    const loginBtn = document.getElementById("login-btn");

    // Bỏ qua nếu trang hiện tại không có form đăng nhập
    if (!lopSelect || !nameSelect || !loginBtn) return;

    // Xử lý khi chọn Lớp
    lopSelect.addEventListener("change", async (e) => {
        clearError();
        const selectedLop = e.target.value.trim();
        nameSelect.innerHTML = '<option value="">-- Đang tải danh sách... --</option>';

        if (!selectedLop) {
            nameSelect.innerHTML = '<option value="">-- Chọn Lớp trước --</option>';
            return;
        }

        try {
            // Truy vấn danh sách học sinh từ collection 'hoc_sinh'
            const q = query(collection(db, "hoc_sinh"), where("lop", "==", selectedLop));
            const snap = await getDocs(q);

            nameSelect.innerHTML = '<option value="">-- Chọn Tên Học Sinh --</option>';

            if (snap.empty) {
                nameSelect.innerHTML = `<option value="">-- Chưa có dữ liệu lớp ${selectedLop} --</option>`;
                return;
            }

            // Thu thập dữ liệu và sắp xếp tên theo chuẩn Tiếng Việt
            const studentsList = [];
            snap.forEach((docSnap) => {
                const data = docSnap.data();
                studentsList.push({
                    id: docSnap.id,
                    hoTen: data.hoTen || data.name || "Học sinh"
                });
            });

            studentsList.sort((a, b) => a.hoTen.localeCompare(b.hoTen, "vi"));

            // Đưa tên học sinh vào dropdown
            studentsList.forEach((st) => {
                const opt = document.createElement("option");
                opt.value = st.hoTen;
                opt.textContent = st.hoTen;
                nameSelect.appendChild(opt);
            });
        } catch (err) {
            console.error("Lỗi nạp danh sách hoc_sinh:", err);
            nameSelect.innerHTML = '<option value="">-- Lỗi kết nối Firestore --</option>';
            showError("Không thể nạp danh sách học sinh. Vui lòng thử lại!");
        }
    });

    // Xử lý khi nhấn nút Đăng Nhập
    loginBtn.addEventListener("click", async (e) => {
        if (e) e.preventDefault();
        clearError();

        const selectedLop = lopSelect.value.trim();
        const hoTen = nameSelect.value.trim();
        const pin = pinInput ? pinInput.value.trim() : "";

        if (!selectedLop) {
            showError("Con hãy chọn Lớp học nhé!");
            return;
        }
        if (!hoTen) {
            showError("Con hãy chọn Tên của mình nhé!");
            return;
        }
        if (!pin) {
            showError("Con hãy nhập Mã PIN nhé!");
            return;
        }

        loginBtn.disabled = true;
        loginBtn.innerText = "Đang kiểm tra...";

        try {
            // Xác thực thông tin học sinh trong collection 'hoc_sinh'
            const q = query(
                collection(db, "hoc_sinh"),
                where("lop", "==", selectedLop),
                where("hoTen", "==", hoTen),
                where("pin", "==", pin)
            );
            const snap = await getDocs(q);

            if (!snap.empty) {
                const userDoc = snap.docs[0];
                const userData = userDoc.data();

                // Lưu phiên làm việc vào LocalStorage
                localStorage.setItem("currentUser", JSON.stringify({
                    id: userDoc.id,
                    hoTen: userData.hoTen,
                    lop: userData.lop
                }));

                // Chuyển hướng tới trang Menu học tập
                window.location.href = "menu.html";
            } else {
                showError("Mã PIN chưa đúng, con kiểm tra lại nhé!");
            }
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            showError("Lỗi kết nối. Vui lòng kiểm tra lại đường truyền!");
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerText = "Vào Lớp Học";
        }
    });
}

// 4. Điều hướng và bảo vệ trang (Auth Guard & UI)
function checkAuthAndDisplayUser() {
    const currentUser = getCurrentUser();
    const currentPath = window.location.pathname.toLowerCase();

    // Các trang yêu cầu phải đăng nhập
    const isProtectedPage = currentPath.includes("menu.html") || 
                            currentPath.includes("dashboard.html") || 
                            currentPath.includes("quiz.html");

    if (isProtectedPage && !currentUser) {
        window.location.href = "index.html";
        return;
    }

    // Hiển thị tên người dùng lên giao diện nếu có thẻ #user-display
    const userDisplay = document.getElementById("user-display");
    if (userDisplay && currentUser) {
        userDisplay.innerText = `${currentUser.hoTen} (${currentUser.lop})`;
    }
}

// 5. Khởi chạy khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
    initLoginController();
    checkAuthAndDisplayUser();
});
