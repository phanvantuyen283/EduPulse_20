// ============================================================
// HỆ THỐNG EDUPULSE 2.0 - TỆP XỬ LÝ CHÍNH (app.js)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
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
// 1. XỬ LÝ TRANG ĐĂNG NHẬP (index.html)
// ============================================================
function initLoginController() {
    const lopSelect = document.getElementById("lop-select");
    const nameSelect = document.getElementById("student-name");
    const pinInput = document.getElementById("pin-code");
    const loginBtn = document.getElementById("login-btn");

    if (!lopSelect || !nameSelect || !loginBtn) return;

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

    if (lopSelect.value) {
        loadStudents(lopSelect.value.trim());
    }

    lopSelect.addEventListener("change", (e) => {
        loadStudents(e.target.value.trim());
    });

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

// ============================================================
// 2. XỬ LÝ TRANG MENU KHÁM PHÁ (menu.html)
// ============================================================
function initMenuController() {
    const welcomeName = document.getElementById("welcome-name");
    const welcomeClass = document.getElementById("welcome-class");
    const logoutBtn = document.getElementById("logout-btn");
    const lessonsSection = document.getElementById("lessons-section");
    const lessonsList = document.getElementById("lessons-list");
    const loadingMsg = document.getElementById("loading-msg");
    const subjectTitle = document.getElementById("selected-subject-title");

    if (!welcomeName) return;

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "index.html";
        return;
    }

    welcomeName.innerText = currentUser.hoTen;
    if (welcomeClass) welcomeClass.innerText = `Lớp ${currentUser.lop}`;

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }

    // Đọc trực tiếp Document môn học từ Firebase ngan_hang_de
    async function fetchSubjectData(subjectId, subjectDisplayName) {
        if (!lessonsSection || !lessonsList) return;

        lessonsSection.style.display = "block";
        subjectTitle.innerText = `Môn ${subjectDisplayName} - Bộ câu hỏi ôn tập`;
        lessonsList.innerHTML = "";
        
        if (loadingMsg) {
            loadingMsg.innerText = "Đang lấy bộ câu hỏi từ máy chủ...";
            loadingMsg.style.display = "block";
        }

        try {
            // Lấy Document trực tiếp theo ID (VD: 'tieng_viet', 'toan', 'tieng_Anh')
            const docRef = doc(db, "ngan_hang_de", subjectId);
            const docSnap = await getDoc(docRef);

            if (loadingMsg) loadingMsg.style.display = "none";

            if (!docSnap.exists()) {
                lessonsList.innerHTML = `<p style="color: #718096; text-align: center; padding: 15px;">Chưa có dữ liệu bài tập cho môn ${subjectDisplayName}.</p>`;
                return;
            }

            const data = docSnap.data();
            const questions = data.danhSachCauHoi || [];

            if (questions.length === 0) {
                lessonsList.innerHTML = `<p style="color: #718096; text-align: center; padding: 15px;">Bộ câu hỏi môn ${subjectDisplayName} đang rỗng.</p>`;
                return;
            }

            // Tạo thẻ bài tập hiển thị tổng số câu hỏi
            const card = document.createElement("div");
            card.style.cssText = "background: #ffffff; border: 1px solid #cbd5e0; border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);";
            
            card.innerHTML = `
                <div>
                    <h4 style="margin: 0 0 6px 0; color: #2d3748; font-size: 1.1rem;">Đề luyện tập tổng hợp - ${subjectDisplayName}</h4>
                    <p style="margin: 0; color: #4a5568; font-size: 0.9rem;">Bao gồm <strong>${questions.length} câu hỏi</strong> trắc nghiệm</p>
                </div>
                <button class="primary-btn" style="padding: 8px 16px; font-size: 0.9rem; width: auto; background-color: #3182ce;">Bắt đầu làm bài ➔</button>
            `;

            card.addEventListener("click", () => {
                // Lưu bộ câu hỏi vào localStorage để trang quiz.html hiển thị
                localStorage.setItem("currentQuiz", JSON.stringify({
                    subjectId: subjectId,
                    subjectName: subjectDisplayName,
                    questions: questions
                }));
                window.location.href = "quiz.html";
            });

            lessonsList.appendChild(card);

        } catch (err) {
            console.error("Lỗi lấy dữ liệu môn học:", err);
            if (loadingMsg) loadingMsg.style.display = "none";
            lessonsList.innerHTML = `<p style="color: #e53e3e; text-align: center;">Lỗi tải bài học: ${err.message}</p>`;
        }
    }

    // Sự kiện click chọn môn
    const subjectCards = document.querySelectorAll(".subject-card");
    subjectCards.forEach(card => {
        card.addEventListener("click", () => {
            const subjectId = card.getAttribute("data-subject-id");
            const subjectName = card.getAttribute("data-subject-name");
            if (subjectId) fetchSubjectData(subjectId, subjectName);
        });
    });
}

function initApp() {
    initLoginController();
    initMenuController();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
