// ============================================================
// HỆ THỐNG EDUPULSE 2.0 - TỆP XỬ LÝ CHÍNH (app.js)
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
window.db = db;

// --- HÀM TIỆN ÍCH CHUNG ---
function showError(msg) {
    const errorMsg = document.getElementById("error-message") || document.getElementById("error-msg");
    if (errorMsg) {
        errorMsg.innerText = msg;
        errorMsg.style.display = "block";
    } else {
        alert(msg);
    }
}

function clearError() {
    const errorMsg = document.getElementById("error-message") || document.getElementById("error-msg");
    if (errorMsg) {
        errorMsg.innerText = "";
        errorMsg.style.display = "none";
    }
}

function getCurrentUser() {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
}

// ============================================================
// 2. XỬ LÝ CHO TRANG ĐĂNG NHẬP (index.html)
// ============================================================
function initLoginController() {
    const lopSelect = document.getElementById("lop-select");
    const nameSelect = document.getElementById("student-name");
    const pinInput = document.getElementById("pin-code");
    const loginBtn = document.getElementById("login-btn");

    // Nếu không phải trang index.html thì bỏ qua
    if (!lopSelect || !nameSelect || !loginBtn) return;

    // Hàm nạp danh sách học sinh theo lớp từ Firestore
    async function loadStudents(selectedLop) {
        clearError();
        nameSelect.innerHTML = '<option value="">-- Đang tải danh sách... --</option>';

        if (!selectedLop) {
            nameSelect.innerHTML = '<option value="">-- Chọn tên của con --</option>';
            return;
        }

        try {
            const q = query(collection(db, "hoc_sinh"), where("lop", "==", selectedLop));
            const snap = await getDocs(q);

            nameSelect.innerHTML = '<option value="">-- Chọn tên của con --</option>';

            if (snap.empty) {
                nameSelect.innerHTML = `<option value="">-- Chưa có dữ liệu lớp ${selectedLop} --</option>`;
                return;
            }

            const studentsList = [];
            snap.forEach((docSnap) => {
                const data = docSnap.data();
                studentsList.push({
                    id: docSnap.id,
                    hoTen: data.hoTen || data.name || "Học sinh"
                });
            });

            // Sắp xếp theo tên Tiếng Việt
            studentsList.sort((a, b) => a.hoTen.localeCompare(b.hoTen, "vi"));

            studentsList.forEach((st) => {
                const opt = document.createElement("option");
                opt.value = st.hoTen;
                opt.textContent = st.hoTen;
                nameSelect.appendChild(opt);
            });
        } catch (err) {
            console.error("Lỗi nạp danh sách hoc_sinh:", err);
            nameSelect.innerHTML = '<option value="">-- Lỗi kết nối Firestore --</option>';
            showError("Không thể nạp danh sách học sinh: " + err.message);
        }
    }

    // Tự động tải nếu đã chọn lớp từ trước
    if (lopSelect.value) {
        loadStudents(lopSelect.value.trim());
    }

    // Sự kiện chọn lớp
    lopSelect.addEventListener("change", (e) => {
        loadStudents(e.target.value.trim());
    });

    // Sự kiện Đăng Nhập
    loginBtn.addEventListener("click", async (e) => {
        if (e) e.preventDefault();
        clearError();

        const selectedLop = lopSelect.value.trim();
        const hoTen = nameSelect.value.trim();
        const pin = pinInput ? pinInput.value.trim() : "";

        if (!selectedLop) return showError("Con hãy chọn Lớp học nhé!");
        if (!hoTen) return showError("Con hãy chọn Tên của mình nhé!");
        if (!pin) return showError("Con hãy nhập Mã PIN nhé!");

        loginBtn.disabled = true;
        loginBtn.innerText = "Đang kiểm tra...";

        try {
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

                localStorage.setItem("currentUser", JSON.stringify({
                    id: userDoc.id,
                    hoTen: userData.hoTen,
                    lop: userData.lop
                }));

                // Chuyển sang trang menu
                window.location.href = "menu.html";
            } else {
                showError("Mã PIN chưa đúng, con kiểm tra lại nhé!");
            }
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            showError("Lỗi đăng nhập: " + err.message);
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerText = "Vào Lớp Học";
        }
    });
}

// ============================================================
// 3. XỬ LÝ CHO TRANG MENU KHÁM PHÁ (menu.html)
// ============================================================
function initMenuController() {
    const welcomeName = document.getElementById("welcome-name");
    const loadingMsg = document.getElementById("loading-msg");
    const logoutBtn = document.getElementById("logout-btn");

    // Nếu không có thẻ welcome-name (không ở trang menu.html) thì dừng lại
    if (!welcomeName) return;

    const currentUser = getCurrentUser();

    // Bảo vệ trang: Nếu chưa đăng nhập thì đẩy về index.html
    if (!currentUser) {
        window.location.href = "index.html";
        return;
    }

    // 1. Hiển thị tên học sinh lên header
    welcomeName.innerText = currentUser.hoTen;

    // 2. Ẩn dòng chữ thông báo đồng bộ bài học
    if (loadingMsg) {
        loadingMsg.style.display = "none";
    }

    // 3. Gắn sự kiện nút Đăng xuất
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }
}

// ============================================================
// KHỞI CHẠY TOÀN BỘ HỆ THỐNG
// ============================================================
function initApp() {
    initLoginController();
    initMenuController();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
