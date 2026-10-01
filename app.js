/**
 * EDUPULSE 20 - CENTRAL CONTROLLER (app.js)
 * Single Clean Architecture: Firebase v10 + Dropdown 81 HS + AppHook Gemini AI
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==========================================
// 1. CẤU HÌNH HỆ THỐNG & API
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDgPsOLRCLmzQAbC2eI0QX8gXLF7FicIzk",
    authDomain: "edupulse-20.firebaseapp.com",
    projectId: "edupulse-20",
    storageBucket: "edupulse-20.firebasestorage.app",
    messagingSenderId: "895238045749",
    appId: "1:895238045749:web:e6d7df1c4a2b2508a7717c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Google Apps Script Webhook URL (AppHook Gemini AI)
const GAS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzMVkPnk9KmLJY5mSUI-mOtfPdtyMkwsKz5x4b2cHqSaT4NfKcb1zdSCl8tXsF8xCY7/exec";

let conversationHistory = [];

// ==========================================
// 2. DANH SÁCH 81 HỌC SINH 4B1 & 4B2 (PIN MẶC ĐỊNH 1234)
// ==========================================
const DANH_SACH_HOC_SINH = [
  // LỚP 4B1 (40 học sinh)
  { "lop": "4B1", "hoTen": "Đặng Tâm An", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Nguyễn Khánh An", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Đặng Lan Anh", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Đặng Thị Ngọc Anh", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Hoàng Anh", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Mai Diệp Ánh", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Vũ Chính Bảo", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Nguyễn Thị Kim Chi", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Vũ Ngọc Phương Chi", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Nguyễn Thùy Dương", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Quốc Đại", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Đặng Danh Đạt", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Gia Hân", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Nguyễn Lê Gia Hân", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Nguyễn Lê Ngọc Hân", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Thị Hải Hậu", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Trung Hiếu", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Vũ Minh Hiếu", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Đặng Gia Hưng", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Thị Thu Hương", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Mai Thị Quỳnh Hương", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Nguyễn Hoàng Khang", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Nguyễn Duy Khánh", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Nguyễn Chí Kiệt", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Ngô Diệp Chi Mai", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Vũ Hà My", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Trần Hà My", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Huy Nghiêm", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Thị Yến Nhi", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Nguyễn Đức Phát", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Anh Quân", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Nguyễn Thị Như Quỳnh", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Nguyễn Thị Phương Thảo", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Nguyễn Anh Thư", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Thị Thu Trang", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Vũ Hữu Trọng", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Anh Tuấn", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Nguyễn Thị Bảo Uyên", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Lê Huy Xuân", "pin": "1234" },
  { "lop": "4B1", "hoTen": "Trịnh Thị Út", "pin": "1234" },

  // LỚP 4B2 (41 học sinh + Giáo viên)
  { "lop": "4B2", "hoTen": "Nguyễn Đăng Hải An", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Lê Đức Anh", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Thị Lan Anh", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Lê Văn Cương", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Phan Trí Cường", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Vũ Quốc Cường", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Ngô Anh Dũng", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Vũ Đức Duy", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Đào Hương Giang", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Đào Ngân Hà", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Thị Hằng", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Minh Hiếu", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Vũ Đình Minh Hiếu", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Thị Ngọc Hoa", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Lê Huy Hoàng", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Lê Văn Huy", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Gia Hưng", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Lê Vũ Bảo Khánh", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Phan Đức Kiên", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Đặng Thị Khánh Ly", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Chí Minh", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Quang Minh", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Dương Hà My", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Thị Ánh My", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Thị Trà My", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Vũ Chí Nam", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Trịnh Nguyễn Nhật Nam", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Thị Thanh Ngân", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Thị Ngọc", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Đặng Kiều Oanh", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Đặng Thanh Phong", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Hoàng Công Thiên Phúc", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Vũ Minh Quang", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Đặng Tiến Thành", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Lương Công Thành", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Kiều Phương Thảo", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Nguyễn Thị Phương Thùy", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Lê Bảo Trâm", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Đặng Phương Trinh", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Đặng Thanh Trúc", "pin": "1234" },
  { "lop": "4B2", "hoTen": "Giáo Viên", "pin": "1234" }
];

// ==========================================
// 3. ĐỒNG BỘ DỮ LIỆU & ĐỊNH TUYẾN TRANG
// ==========================================
async function autoSyncStudentsToFirebase() {
    try {
        const snapshot = await getDocs(collection(db, "hoc_sinh"));
        if (snapshot.empty) {
            console.log("Đang tự động nạp 81 học sinh lên Firebase...");
            for (const hs of DANH_SACH_HOC_SINH) {
                await addDoc(collection(db, "hoc_sinh"), hs);
            }
            console.log("Tự động nạp thành công 81 học sinh!");
        }
    } catch (e) {
        console.error("Lỗi tự động đồng bộ Firebase:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    autoSyncStudentsToFirebase();

    if (document.getElementById('login-section')) {
        initLoginController();
    }
    
    if (document.getElementById('menu-section')) {
        initMenuController();
    }

    if (document.getElementById('quiz-section')) {
        initQuizController();
    }
});

// ==========================================
// 4. LOGIC ĐĂNG NHẬP & MENU TÊN ĐỘNG
// ==========================================
function initLoginController() {
    const classSelect = document.getElementById('student-class');
    const nameSelect = document.getElementById('student-name');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('error-message');
    const studentPinInput = document.getElementById('student-pin');

    if (!loginBtn) return;

    function loadNameDropdown(selectedClass) {
        if (!nameSelect) return;
        nameSelect.innerHTML = '<option value="">-- Chọn tên của con --</option>';
        const filtered = DANH_SACH_HOC_SINH.filter(hs => hs.lop === selectedClass);
        
        filtered.forEach(hs => {
            const opt = document.createElement('option');
            opt.value = hs.hoTen;
            opt.textContent = hs.hoTen;
            nameSelect.appendChild(opt);
        });
    }

    if (classSelect) {
        loadNameDropdown(classSelect.value);
        classSelect.addEventListener('change', (e) => loadNameDropdown(e.target.value));
    }

    loginBtn.addEventListener('click', async () => {
        const lop = classSelect ? classSelect.value : "4B1";
        const hoTen = nameSelect ? nameSelect.value : "";
        const pin = studentPinInput ? studentPinInput.value.trim() : "";

        if (!hoTen) {
            hienThiLoi(errorMsg, "Con nhớ chọn Họ và Tên nhé!");
            return;
        }

        if (!pin) {
            hienThiLoi(errorMsg, "Con nhớ nhập Mã PIN nhé!");
            return;
        }

        try {
            loginBtn.innerText = "Đang kiểm tra...";
            loginBtn.disabled = true;

            const q = query(
                collection(db, "hoc_sinh"), 
                where("lop", "==", lop), 
                where("hoTen", "==", hoTen)
            );
            
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const studentData = snapshot.docs[0].data();
                if (String(studentData.pin).trim() === pin) {
                    localStorage.setItem("eduPulse_hoTen", studentData.hoTen);
                    localStorage.setItem("eduPulse_lop", studentData.lop);
                    window.location.href = "menu.html";
                    return;
                }
            }
            
            const localStudent = DANH_SACH_HOC_SINH.find(hs => hs.lop === lop && hs.hoTen === hoTen);
            if (localStudent && localStudent.pin === pin) {
                localStorage.setItem("eduPulse_hoTen", localStudent.hoTen);
                localStorage.setItem("eduPulse_lop", localStudent.lop);
                window.location.href = "menu.html";
            } else {
                hienThiLoi(errorMsg, "Mã PIN chưa chính xác (Mặc định là 1234)!");
            }

        } catch (error) {
            console.error("Lỗi đăng nhập: ", error);
            hienThiLoi(errorMsg, "Hệ thống đang bận, con thử lại sau nhé!");
        } finally {
            loginBtn.innerText = "Vào Lớp Học";
            loginBtn.disabled = false;
        }
    });

    if (studentPinInput) {
        studentPinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loginBtn.click();
        });
    }
}

function hienThiLoi(element, thongBao) {
    if (!element) return;
    element.innerText = thongBao;
    element.style.display = "block";
    setTimeout(() => { element.style.display = "none"; }, 4000);
}

// ==========================================
// 5. LOGIC TRANG MENU (menu.html)
// ==========================================
function initMenuController() {
    const tenHocSinh = localStorage.getItem("eduPulse_hoTen");
    if (!tenHocSinh) {
        window.location.href = "index.html";
        return;
    }

    const welcomeEl = document.getElementById('welcome-name');
    if (welcomeEl) welcomeEl.innerText = tenHocSinh;

    async function dongBoLichHoc() {
        try {
            const docRef = doc(db, "cau_hinh", "trang_thai_mon");
            const snap = await getDoc(docRef);
            
            const loadingMsg = document.getElementById('loading-msg');
            if (loadingMsg) loadingMsg.style.display = 'none';

            if (snap.exists()) {
                const data = snap.data();
                const cardToan = document.getElementById('card-toan');
                const cardTiengViet = document.getElementById('card-tieng-viet');
                const cardTiengAnh = document.getElementById('card-tieng-anh');

                if (cardToan) cardToan.style.display = data.toan ? 'block' : 'none';
                if (cardTiengViet) cardTiengViet.style.display = data.tiengViet ? 'block' : 'none';
                if (cardTiengAnh) cardTiengAnh.style.display = data.tiengAnh ? 'block' : 'none';
            }
        } catch (error) {
            console.error("Lỗi đồng bộ cấu hình: ", error);
        }
    }

    dongBoLichHoc();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = "index.html";
        });
    }
}

// ==========================================
// 6. LOGIC BÀI TẬP & GIA SƯ AI (APPHOOK WEBHOOK)
// ==========================================
async function initQuizController() {
    const tenHocSinh = localStorage.getItem("eduPulse_hoTen");
    if (!tenHocSinh) { window.location.href = "index.html"; return; }

    const quizSection = document.getElementById('quiz-section');
    const containerCauHoi = document.getElementById('danh-sach-cau-hoi');
    const btnSubmit = document.getElementById('submit-quiz');
    
    if (!quizSection || !containerCauHoi) return;

    const monHocDocId = quizSection.getAttribute('data-mon') || "toan"; 
    let thongTinBaiHoc = "";
    let duLieuDeThi = [];

    try {
        const docRef = doc(db, "ngan_hang_de", monHocDocId);
        const snap = await getDoc(docRef);
        
        if (snap.exists() && snap.data().danhSachCauHoi) {
            const data = snap.data();
            thongTinBaiHoc = data.thongTinBaiHoc || "";
            duLieuDeThi = data.danhSachCauHoi || [];
            
            const tieuDeEl = document.getElementById('tieu-de-bai');
            if (tieuDeEl) tieuDeEl.innerText = "Bài tập " + monHocDocId.toUpperCase();
            
            let fullHtml = "";
            duLieuDeThi.forEach((cau, index) => {
                fullHtml += `
                    <div class="cau-hoi" id="cau-${index}" data-dap-an="${cau.dapAnDung}">
                        <p class="de-bai">Câu ${cau.cauSo}: ${cau.deBai}</p>
                        <div class="lua-chon">
                `;
                for (const [key, value] of Object.entries(cau.luaChon)) {
                    fullHtml += `<label><input type="radio" name="chon_${index}" value="${key}"> ${key}. ${value}</label>`;
                }
                fullHtml += `</div></div>`;
            });
            
            containerCauHoi.innerHTML = fullHtml;
            if (btnSubmit) btnSubmit.style.display = "block";
        } else {
            containerCauHoi.innerHTML = "<p style='color:#ff6b6b;'>Thầy chưa nạp đề thi cho môn này. Con quay lại sau nhé!</p>";
        }
    } catch (error) {
        console.error("Lỗi tải đề: ", error);
        containerCauHoi.innerHTML = "<p style='color:#ff6b6b;'>Không thể tải bài tập. Con báo thầy Tuyến hỗ trợ nhé!</p>";
    }

    if (btnSubmit) {
        btnSubmit.addEventListener('click', async () => {
            let soCauDung = 0;
            let tongHopBaiLam = "";
            let chiTietLuuFirebase = [];
            
            duLieuDeThi.forEach((cau, index) => {
                const theCauHoi = document.getElementById(`cau-${index}`);
                const luaChon = theCauHoi ? theCauHoi.querySelector('input[type="radio"]:checked') : null;
                const dapAnHocSinh = luaChon ? luaChon.value : "Bỏ trống";
                const dapAnDung = theCauHoi ? theCauHoi.getAttribute('data-dap-an') : cau.dapAnDung;
                
                const trangThai = (dapAnHocSinh === dapAnDung) ? "ĐÚNG" : "SAI";
                if (trangThai === "ĐÚNG") soCauDung++;

                tongHopBaiLam += `Câu ${cau.cauSo}: ${cau.deBai}\n- Đáp án đúng: ${dapAnDung}. Con chọn: ${dapAnHocSinh} (${trangThai})\n\n`;
                
                chiTietLuuFirebase.push({
                    cauSo: cau.cauSo,
                    dapAnDung: dapAnDung,
                    hocSinhChon: dapAnHocSinh,
                    ketQua: trangThai
                });
            });

            const duLieuLuuDB = {
                hocSinh: tenHocSinh,
                lop: localStorage.getItem("eduPulse_lop") || "4B1",
                monHoc: monHocDocId,
                diemSo: soCauDung,
                tongSoCau: duLieuDeThi.length,
                chiTietLamBai: chiTietLuuFirebase,
                thoiGianNop: serverTimestamp()
            };
            
            try {
                await addDoc(collection(db, "ket_qua_hoc_tap"), duLieuLuuDB);
            } catch (err) {
                console.error("Lỗi lưu điểm: ", err);
            }

            btnSubmit.style.display = 'none';
            const chatSection = document.getElementById('chat-section');
            if (chatSection) chatSection.style.display = 'flex';

            const heThongBaoCao = `HỆ THỐNG BÁO CÁO: Học sinh vừa nộp bài môn ${monHocDocId}. Điểm: ${soCauDung}/${duLieuDeThi.length}.
Mục tiêu bài học: ${thongTinBaiHoc}
CHI TIẾT BÀI LÀM:
${tongHopBaiLam}
Dựa vào đây, hãy khen ngợi, nhắc nhở lỗi sai và hỏi "Con cần giúp gì không?".`;

            giaoTiepVoiAI(heThongBaoCao, true); 
        });
    }

    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');

    if (sendChatBtn && chatInput) {
        sendChatBtn.addEventListener('click', () => {
            const text = chatInput.value.trim();
            if (!text) return;
            hienThiTinNhan(text, 'user-msg');
            chatInput.value = '';
            giaoTiepVoiAI(text, false);
        });
    }

    async function giaoTiepVoiAI(noiDung, laBaoCaoNgam) {
        conversationHistory.push({ "role": "user", "parts": [{ "text": noiDung }] });
        
        const loadingId = "loading-" + Date.now();
        hienThiTinNhan("Thầy đang gõ phím...", 'ai-msg', loadingId);

        try {
            const payload = { history: conversationHistory };
            if (laBaoCaoNgam) payload.context = noiDung;

            const response = await fetch(GAS_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            xoaPhanTu(loadingId);
            const aiAnswer = data?.answer || "Thầy đã nhận được bài làm của con!";
            hienThiTinNhan(aiAnswer, 'ai-msg');
            conversationHistory.push({ "role": "model", "parts": [{ "text": aiAnswer }] });

        } catch (error) {
            console.error("Lỗi giao tiếp AI: ", error);
            xoaPhanTu(loadingId);
            hienThiTinNhan("Đường truyền đang gián đoạn, con đợi chút nhé!", 'ai-msg');
        }
    }

    function hienThiTinNhan(text = '', typeClass = '', id = '') {
        const box = document.getElementById('chat-box');
        if (!box) return;
        const safeText = String(text).replace(/\n/g, '<br>');
        const idAttr = id ? `id="${id}"` : '';
        box.insertAdjacentHTML('beforeend', `<div class="chat-bubble ${typeClass}" ${idAttr}>${safeText}</div>`);
        box.scrollTop = box.scrollHeight;
    }

    function xoaPhanTu(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
}
