import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore, doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. CẤU HÌNH FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDgPsOLRCLmzQAbC2eI0QX8gXLF7FicIzk",
    authDomain: "edupulse-20.firebaseapp.com",
    projectId: "edupulse-20"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. URL GOOGLE APPS SCRIPT AI (ĐÃ FIX LỖI CORS)
const GAS_URL = "https://script.google.com/macros/s/AKfycbyUwwqytE1S6XjKjRlcuqHV6b1M3RgyqpF/exec";

// 3. NHẬN DIỆN TRANG VÀ KHỞI TẠO THÔNG MINH
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;

    // Trang Đăng nhập (index.html)
    if (document.getElementById("login-section") || document.getElementById("lop-select") || path.endsWith("index.html") || path === "/") {
        initLoginController();
    }

    // Trang Menu Trạm khám phá (menu.html)
    if (document.getElementById("menu-section") || document.getElementById("welcome-name") || document.getElementById("ten-hoc-sinh") || path.endsWith("menu.html")) {
        initMenuController();
    }

    // Trang Bài tập (bai_toan.html, bai_tieng_viet.html, bai_tieng_anh.html)
    if (document.getElementById("quiz-section") || path.includes("bai_")) {
        initQuizController();
    }
});

// ==========================================
// A. BỘ ĐIỀU KHIỂN ĐĂNG NHẬP (index.html)
// ==========================================
function initLoginController() {
    const lopSelect = document.getElementById("lop-select");
    const nameSelect = document.getElementById("student-name");
    const pinInput = document.getElementById("pin-code");
    const loginBtn = document.getElementById("login-btn");
    const errorMsg = document.getElementById("error-msg");

    // 1. Sự kiện chọn Lớp (4B1 hoặc 4B2) -> Tự động nạp danh sách học sinh lớp đó từ Firestore
    if (lopSelect && nameSelect) {
        lopSelect.addEventListener("change", async (e) => {
            const selectedLop = e.target.value.trim();
            
            nameSelect.innerHTML = '<option value="">-- Đang tải danh sách... --</option>';
            
            if (!selectedLop) {
                nameSelect.innerHTML = '<option value="">-- Chọn Lớp trước --</option>';
                return;
            }

            try {
                // Truy vấn danh sách học sinh thuộc Lớp được chọn (4B1 hoặc 4B2)
                const q = query(collection(db, "hoc_sinh"), where("lop", "==", selectedLop));
                const snap = await getDocs(q);

                nameSelect.innerHTML = '<option value="">-- Chọn Tên Học Sinh --</option>';
                
                if (snap.empty) {
                    nameSelect.innerHTML = '<option value="">-- Chưa có dữ liệu học sinh lớp này --</option>';
                    return;
                }

                snap.forEach((docSnap) => {
                    const data = docSnap.data();
                    const opt = document.createElement("option");
                    opt.value = data.hoTen;
                    opt.textContent = data.hoTen;
                    nameSelect.appendChild(opt);
                });
            } catch (err) {
                console.error("Lỗi nạp danh sách học sinh theo lớp:", err);
                nameSelect.innerHTML = '<option value="">-- Lỗi tải danh sách --</option>';
            }
        });
    }

    // 2. Xử lý nút Đăng nhập
    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const selectedLop = lopSelect ? lopSelect.value.trim() : "";
            const hoTen = nameSelect ? nameSelect.value.trim() : "";
            const pin = pinInput ? pinInput.value.trim() : "";

            if (!selectedLop || !hoTen || !pin) {
                showError("Con hãy chọn Lớp, chọn Tên và nhập Mã PIN nhé!");
                return;
            }

            loginBtn.disabled = true;
            loginBtn.innerText = "Đang kiểm tra...";

            try {
                // Xác thực Học sinh theo Lớp, Họ tên và Mã PIN
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
                    
                    // Lưu thông tin học sinh vào localStorage
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
                showError("Kết nối máy chủ thất bại, con thử lại sau giây lát!");
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerText = "Vào Lớp Học";
            }
        });
    }

    function showError(msg) {
        if (errorMsg) {
            errorMsg.innerText = msg;
            errorMsg.style.display = "block";
        }
    }
}

// ==========================================
// B. BỘ ĐIỀU KHIỂN TRẠM KHÁM PHÁ (menu.html)
// ==========================================
async function initMenuController() {
    const currentUserStr = localStorage.getItem("currentUser");
    if (!currentUserStr) {
        window.location.href = "index.html";
        return;
    }

    const currentUser = JSON.parse(currentUserStr);

    // Hiển thị tên học sinh và lớp
    const welcomeIDs = ["welcome-name", "ten-hoc-sinh", "student-display", "user-name"];
    welcomeIDs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = `${currentUser.hoTen} (${currentUser.lop})`;
    });

    const loadingMsg = document.getElementById("loading-msg");
    const logoutBtn = document.getElementById("logout-btn");

    // Xử lý Đăng xuất
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }

    // Đọc trạng thái Bật/Tắt môn học từ Firestore
    try {
        const docRef = doc(db, "cau_hinh", "trang_thai_mon");
        const snap = await getDoc(docRef);

        if (snap.exists()) {
            const config = snap.data();
            setCardVisibility("card-toan", config.toan ?? true);
            setCardVisibility("card-tieng-viet", config.tiengViet ?? true);
            setCardVisibility("card-tieng-anh", config.tiengAnh ?? true);
        } else {
            setCardVisibility("card-toan", true);
            setCardVisibility("card-tieng-viet", true);
            setCardVisibility("card-tieng-anh", true);
        }
    } catch (err) {
        console.error("Lỗi nạp cấu hình môn:", err);
    } finally {
        if (loadingMsg) loadingMsg.style.display = "none";
    }

    function setCardVisibility(cardId, isVisible) {
        const el = document.getElementById(cardId);
        if (el) el.style.display = isVisible ? "block" : "none";
    }
}

// ==========================================
// C. BỘ ĐIỀU KHIỂN BÀI TẬP & GIA SƯ AI (bai_*.html)
// ==========================================
async function initQuizController() {
    const currentUserStr = localStorage.getItem("currentUser");
    if (!currentUserStr) {
        window.location.href = "index.html";
        return;
    }
    const currentUser = JSON.parse(currentUserStr);

    const quizSection = document.getElementById("quiz-section");
    const monHoc = quizSection ? quizSection.getAttribute("data-mon") : null;
    const tieuDeBai = document.getElementById("tieu-de-bai");
    const danhSachCauHoiEl = document.getElementById("danh-sach-cau-hoi");
    const submitBtn = document.getElementById("submit-quiz");
    const chatSection = document.getElementById("chat-section");
    const chatBox = document.getElementById("chat-box");
    const chatInput = document.getElementById("chat-input");
    const sendChatBtn = document.getElementById("send-chat");

    if (!monHoc) return;

    let danhSachCauHoi = [];
    let baiHocTitle = "";

    try {
        const snap = await getDoc(doc(db, "ngan_hang_de", monHoc));
        if (snap.exists()) {
            const data = snap.data();
            baiHocTitle = data.thongTinBaiHoc || "Bài luyện tập";
            danhSachCauHoi = data.danhSachCauHoi || [];
            
            if (tieuDeBai) tieuDeBai.innerText = baiHocTitle;
            renderQuiz(danhSachCauHoi);
            if (submitBtn) submitBtn.style.display = "block";
        } else {
            if (danhSachCauHoiEl) danhSachCauHoiEl.innerHTML = `<p style="text-align:center; color:#ff6b6b;">Chưa có đề thi cho môn này.</p>`;
        }
    } catch (err) {
        console.error("Lỗi nạp đề thi:", err);
        if (danhSachCauHoiEl) danhSachCauHoiEl.innerHTML = `<p style="text-align:center; color:#ff6b6b;">Không thể tải dữ liệu đề thi.</p>`;
    }

    function renderQuiz(questions) {
        if (!danhSachCauHoiEl) return;
        danhSachCauHoiEl.innerHTML = "";

        questions.forEach((q, index) => {
            const qDiv = document.createElement("div");
            qDiv.className = "cau-hoi";
            
            let htmlOptions = "";
            q.cacLuaChon.forEach((opt) => {
                const optKey = opt.trim().substring(0, 1);
                htmlOptions += `
                    <label>
                        <input type="radio" name="cau_${q.id}" value="${optKey}">
                        ${opt}
                    </label>
                `;
            });

            qDiv.innerHTML = `
                <div class="de-bai">Câu ${index + 1}: ${q.cauHoi}</div>
                <div class="lua-chon">${htmlOptions}</div>
            `;
            danhSachCauHoiEl.appendChild(qDiv);
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
            let diemSo = 0;
            const chiTietLamBai = [];

            danhSachCauHoi.forEach((q) => {
                const selectedInput = document.querySelector(`input[name="cau_${q.id}"]:checked`);
                const answerUser = selectedInput ? selectedInput.value : "Chưa chọn";
                const isCorrect = (answerUser === q.dapAnDung);

                if (isCorrect) diemSo++;

                chiTietLamBai.push({
                    cauHoi: q.cauHoi,
                    dapAnHocSinh: answerUser,
                    dapAnDung: q.dapAnDung,
                    laDapAnDung: isCorrect
                });
            });

            submitBtn.disabled = true;
            submitBtn.innerText = "Đã Nộp Bài";

            const allRadios = document.querySelectorAll('input[type="radio"]');
            allRadios.forEach(r => r.disabled = true);

            try {
                await addDoc(collection(db, "ket_qua_hoc_tap"), {
                    hocSinh: currentUser.hoTen,
                    lop: currentUser.lop,
                    monHoc: monHoc,
                    diemSo: diemSo,
                    tongSoCau: danhSachCauHoi.length,
                    chiTietLamBai: chiTietLamBai,
                    thoiGianNop: serverTimestamp()
                });
            } catch (e) {
                console.error("Lỗi lưu kết quả:", e);
            }

            if (chatSection) chatSection.style.display = "flex";

            const promptPhanTich = taoPromptChuaBai(currentUser.hoTen, currentUser.lop, baiHocTitle, diemSo, danhSachCauHoi.length, chiTietLamBai);
            
            appendMessage("ai", `Thầy AI đang chấm bài và chuẩn bị nhận xét cho con chút nhé...`);

            try {
                const aiResponse = await giaoTiepVoiAI(promptPhanTich);
                if (chatBox.lastElementChild) chatBox.lastElementChild.remove();
                appendMessage("ai", aiResponse);
            } catch (err) {
                if (chatBox.lastElementChild) chatBox.lastElementChild.remove();
                appendMessage("ai", "Đường truyền gián đoạn, con kiểm tra lại kết nối mạng rồi hỏi thầy nhé!");
            }
        });
    }

    if (sendChatBtn && chatInput) {
        sendChatBtn.addEventListener("click", guiTinNhanHocSinh);
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") guiTinNhanHocSinh();
        });
    }

    async function guiTinNhanHocSinh() {
        const msg = chatInput.value.trim();
        if (!msg) return;

        appendMessage("user", msg);
        chatInput.value = "";

        const loadingBubble = appendMessage("ai", "Thầy AI đang suy nghĩ...");

        try {
            const promptChat = `Học sinh ${currentUser.hoTen} (${currentUser.lop}) hỏi thêm: "${msg}". Hãy đóng vai gia sư tiểu học thân thiện, hướng dẫn gợi mở (ZPD) ngắn gọn cho học sinh.`;
            const reply = await giaoTiepVoiAI(promptChat);
            loadingBubble.innerText = reply;
        } catch (err) {
            loadingBubble.innerText = "Đường truyền gián đoạn, con đợi chút rồi gửi lại tin nhắn nhé!";
        }
    }

    function appendMessage(sender, text) {
        if (!chatBox) return;
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-bubble ${sender === "user" ? "user-msg" : "ai-msg"}`;
        msgDiv.innerText = text;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return msgDiv;
    }
}

// ==========================================
// D. HÀM GIAO TIẾP GOOGLE APPS SCRIPT AI (CHỐNG LỖI CORS)
// ==========================================
async function giaoTiepVoiAI(promptText) {
    try {
        const response = await fetch(GAS_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "text/plain;charset=utf-8" 
            },
            body: JSON.stringify({ prompt: promptText })
        });

        if (!response.ok) {
            throw new Error(`Lỗi máy chủ HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && (data.reply || data.answer)) {
            return data.reply || data.answer;
        } else if (data && data.error) {
            return `Thầy AI thông báo: ${data.error}`;
        } else {
            return "Thầy AI đã tiếp nhận nhưng chưa thể đưa ra câu trả lời lúc này.";
        }
    } catch (error) {
        console.error("Lỗi giao tiếp AI:", error);
        throw error;
    }
}

function taoPromptChuaBai(tenHocSinh, lop, tenBai, diem, tongCau, chiTiet) {
    let chiTietText = chiTiet.map((item, i) => 
        `- Câu ${i+1}: "${item.cauHoi}" | Con chọn: ${item.dapAnHocSinh} | Đáp án đúng: ${item.dapAnDung} -> ${item.laDapAnDung ? "ĐÚNG" : "SAI"}`
    ).join("\n");

    return `Bạn là Thầy giáo AI thân thiện, dạy khối lớp 4.
Học sinh: ${tenHocSinh} - Lớp ${lop}
Bài làm: ${tenBai}
Kết quả: ${diem}/${tongCau} câu đúng.

Chi tiết bài làm:
${chiTietText}

YÊU CẦU PHẢN HỒI:
1. Khen ngợi tinh thần học tập của con một cách chân thành.
2. Nếu có câu sai, hãy chọn 1 câu sai điển hình để hướng dẫn gợi mở (Vùng phát triển gần - ZPD), KHÔNG cho ngay đáp án mà đặt câu hỏi gợi ý để con tự tư duy.
3. Giữ giọng văn ngắn gọn (dưới 150 từ), ấm áp, dùng từ xưng hô "thầy" - "con".`;
}
