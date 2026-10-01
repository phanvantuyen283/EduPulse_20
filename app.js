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

const firebaseConfig = {
    apiKey: "AIzaSyDgPsOLRCLmzQAbC2eI0QX8gXLF7FicIzk",
    authDomain: "edupulse-20.firebaseapp.com",
    projectId: "edupulse-20"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
window.db = db;

// Quản lý thông báo lỗi
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

function initLoginController() {
    // Khớp 100% ID với file index.html
    const lopSelect = document.getElementById("lop-select");
    const nameSelect = document.getElementById("student-name");
    const pinInput = document.getElementById("pin-code");
    const loginBtn = document.getElementById("login-btn");

    if (!lopSelect || !nameSelect) {
        console.error("LỖI: Không tìm thấy các thẻ select trong index.html!");
        return;
    }

    // Hàm nạp danh sách học sinh từ Firestore
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

            // Sắp xếp tên theo bảng chữ cái Tiếng Việt
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

    // Tự động tải nếu lớp đã chọn sẵn
    if (lopSelect.value) {
        loadStudents(lopSelect.value.trim());
    }

    // Lắng nghe khi thay đổi lớp
    lopSelect.addEventListener("change", (e) => {
        loadStudents(e.target.value.trim());
    });

    // Sự kiện Đăng Nhập
    if (loginBtn) {
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
}

function initApp() {
    initLoginController();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
