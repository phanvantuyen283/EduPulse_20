// ==========================================
// EDUPULSE 20 - LOGIC XỬ LÝ GIAO DIỆN & AI (ĐÃ ĐIỀU CHỈNH CHUẨN)
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// 1. Cấu hình Firebase từ dự án EduPulse 20
const firebaseConfig = {
  apiKey: "AIzaSyDgPsOLRCLmzQAbC2eI0QX8gXLF7FicIzk",
  authDomain: "edupulse-20.firebaseapp.com",
  projectId: "edupulse-20",
  storageBucket: "edupulse-20.firebasestorage.app",
  messagingSenderId: "895238045749",
  appId: "1:895238045749:web:e6d7df1c4a2b2508a7717c",
  measurementId: "G-R08XNW6HTX"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Danh sách dự phòng 81 học sinh (4B1 và 4B2) để chạy offline tức thì
const danhSachDuPhong = [
  {"hoTen": "Đặng Tâm An", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Khánh An", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Đặng Lan Anh", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Đặng Thị Ngọc Anh", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Hoàng Anh", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Mai Diệp Ánh", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Vũ Chính Bảo", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Thị Kim Chi", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Vũ Ngọc Phương Chi", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Thùy Dương", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Quốc Đại", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Đặng Danh Đạt", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Gia Hân", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Lê Gia Hân", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Lê Ngọc Hân", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Thị Hải Hậu", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Trung Hiếu", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Vũ Minh Hiếu", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Đặng Gia Hưng", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Thị Thu Hương", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Mai Thị Quỳnh Hương", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Nguyễn Hoàng Khang", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Duy Khánh", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Chí Kiệt", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Ngô Diệp Chi Mai", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Vũ Hà My", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Trần Hà My", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Huy Nghiêm", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Thị Yến Nhi", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Đức Phát", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Anh Quân", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Thị Như Quỳnh", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Thị Phương Thảo", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Anh Thư", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Thị Thu Trang", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Vũ Hữu Trọng", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Anh Tuấn", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Thị Bảo Uyên", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Lê Huy Xuân", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Trịnh Thị Út", "lop": "4B1", "pin": "1234"},
  {"hoTen": "Nguyễn Đăng Hải An", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Lê Đức Anh", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Thị Lan Anh", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Lê Văn Cương", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Phan Trí Cường", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Vũ Quốc Cường", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Ngô Anh Dũng", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Vũ Đức Duy", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Đào Hương Giang", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Đào Ngân Hà", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Thị Hằng", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Minh Hiếu", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Vũ Đình Minh Hiếu", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Thị Ngọc Hoa", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Lê Huy Hoàng", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Lê Văn Huy", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Gia Hưng", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Lê Vũ Bảo Khánh", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Phan Đức Kiên", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Đặng Thị Khánh Ly", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Chí Minh", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Quang Minh", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Dương Hà My", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Thị Ánh My", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Thị Trà My", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Vũ Chí Nam", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Trịnh Nguyễn Nhật Nam", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Thị Thanh Ngân", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Thị Ngọc", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Đặng Kiều Oanh", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Đặng Thanh Phong", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Hoàng Công Thiên Phúc", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Vũ Minh Quang", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Đặng Tiến Thành", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Lương Công Thành", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Kiều Phương Thảo", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Nguyễn Thị Phương Thùy", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Lê Bảo Trâm", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Đặng Phương Trinh", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Đặng Thanh Trúc", "lop": "4B2", "pin": "1234"},
  {"hoTen": "Giáo Viên", "lop": "4B2", "pin": "1234"}
];

// 3. Các thành phần giao diện
const classSelect = document.getElementById('class-select');
const studentSelect = document.getElementById('student-select');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Khi chọn lớp -> Lọc danh sách học sinh
classSelect.addEventListener('change', async function() {
    const selectedClass = this.value;
    studentSelect.innerHTML = '<option value="" disabled selected>Đang tải danh sách...</option>';
    studentSelect.disabled = true;
    passwordInput.disabled = true;
    passwordInput.value = '';
    loginBtn.disabled = true;

    let danhSachHienThi = [];

    try {
        const q = query(collection(db, "Students"), where("lop", "==", selectedClass));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            danhSachHienThi.push(doc.data());
        });

        // Nếu Firebase chưa có dữ liệu, lấy từ danh sách dự phòng
        if (danhSachHienThi.length === 0) {
            danhSachHienThi = danhSachDuPhong.filter(item => item.lop === selectedClass);
        }
    } catch (error) {
        console.warn("Không kết nối được Firebase, dùng danh sách dự phòng.");
        danhSachHienThi = danhSachDuPhong.filter(item => item.lop === selectedClass);
    }

    // Sắp xếp tên theo thứ tự A-Z tiếng Việt
    danhSachHienThi.sort((a, b) => a.hoTen.localeCompare(b.hoTen, 'vi'));

    studentSelect.innerHTML = '<option value="" disabled selected>-- Bấm để chọn tên của con --</option>';
    danhSachHienThi.forEach(hs => {
        const opt = document.createElement('option');
        opt.value = hs.hoTen;
        opt.textContent = hs.hoTen;
        opt.dataset.pin = hs.pin || "1234"; // Lưu mã PIN vào dataset để kiểm tra
        studentSelect.appendChild(opt);
    });

    studentSelect.disabled = false;
});

// Khi chọn tên xong -> Kích hoạt ô nhập mã PIN
studentSelect.addEventListener('change', function() {
    if(this.value) {
        passwordInput.disabled = false;
        passwordInput.value = '';
        passwordInput.focus();
        loginBtn.disabled = true;
    }
});

// Khi nhập PIN -> Kích hoạt nút đăng nhập
passwordInput.addEventListener('input', function() {
    if(this.value.trim().length >= 4) {
        loginBtn.disabled = false;
    } else {
        loginBtn.disabled = true;
    }
});

// Sự kiện Đăng nhập vào lớp học (Đã sửa lỗi kiểm tra mã PIN)
loginBtn.addEventListener('click', handleLogin);
passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !loginBtn.disabled) {
        handleLogin();
    }
});

function handleLogin() {
    const selectedClass = classSelect.value;
    const selectedStudent = studentSelect.value;
    const inputPin = passwordInput.value.trim();

    // Lấy mã PIN chuẩn từ option được chọn
    const selectedOption = studentSelect.options[studentSelect.selectedIndex];
    const correctPin = selectedOption ? selectedOption.dataset.pin : null;

    if (inputPin === correctPin) { 
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'flex'; // Dùng 'flex' để giữ layout chuẩn CSS
        
        document.getElementById('display-name').textContent = selectedStudent;
        document.getElementById('display-class').textContent = "Lớp " + selectedClass;
    } else {
        alert("❌ Mã PIN chưa đúng, con vui lòng kiểm tra lại nhé!");
        passwordInput.value = '';
        loginBtn.disabled = true;
    }
}

// Đăng xuất quay lại màn hình đầu
document.getElementById('logout-btn').addEventListener('click', function() {
    location.reload();
});

// ==========================================
// 4. KẾT NỐI TRỢ LÝ AI (TRỰC TIẾP, GỌN NHẸ)
// ==========================================
const GAS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbw959M8qHfxv61A59_7RuV2QwaVg3GHzIYsJfDUGnUm01D8NloE34gOyjaUbQChGisT/exec";

async function guiCauHoiChoAI() {
    const text = userInput.value.trim();
    if (!text) return;

    // Hiển thị tin nhắn của học sinh lên khung chat
    appendMessage(text, 'user-message');
    userInput.value = '';

    // Tạo hiệu ứng AI đang suy nghĩ
    const loadingId = appendMessage("Thầy đang suy nghĩ gợi ý cho con...", 'ai-message loading');

    try {
        const response = await fetch(GAS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ question: text })
        });

        const data = await response.json();
        
        // Xóa thông báo đang suy nghĩ và thay bằng câu trả lời từ Gemini
        removeMessage(loadingId);
        appendMessage(data.answer, 'ai-message');

    } catch (error) {
        console.error("Lỗi gửi tới AI:", error);
        removeMessage(loadingId);
        appendMessage("Mạng đang hơi chậm, con gửi lại câu hỏi giúp thầy nhé!", 'ai-message');
    }
}

sendBtn.addEventListener('click', guiCauHoiChoAI);
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        guiCauHoiChoAI();
    }
});

// Hàm hỗ trợ hiển thị khung chat (Xử lý cả xuống dòng \n từ Gemini)
function appendMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    
    let avatar = className.includes('user') ? '👤' : '🤖';
    
    // Đổi ký tự \n thành thẻ <br> để câu trả lời xuống dòng đẹp mắt
    const formattedText = escapeHtml(text).replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
        <div class="avatar">${avatar}</div>
        <div class="text">${formattedText}</div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    const tempId = 'msg-' + Date.now();
    msgDiv.id = tempId;
    return tempId;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
