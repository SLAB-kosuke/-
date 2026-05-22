// =========================
// 家族予定アプリ（安定版）
// =========================

const APP_PASSWORD = "1980";

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("familyEvents") || "{}");

// =========================
// ログイン
// =========================
window.login = function () {

  const pass = document
    .getElementById("passwordInput")
    .value
    .trim();

  if (pass === APP_PASSWORD) {
    document.getElementById("loginScreen").style.display = "none";
    renderCalendar();
    renderMonthlyList();
  } else {
    alert("パスワードが違います");
  }
};

// =========================
// カレンダー描画
// =========================
function renderCalendar() {

  const calendar = document.getElementById("calendar");
  const monthYear = document.getElementById("monthYear");

  if (!calendar || !monthYear) return;

  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent = `${year}年 ${month + 1}月`;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += `<div></div>`;
  }

  for (let day = 1; day <= lastDate; day++) {

    const dateKey = `${year}-${month + 1}-${day}`;
    const dayEvents = events[dateKey] || [];

    calendar.innerHTML += `
      <div class="day" onclick="openModal('${dateKey}')">
        <div>${day}</div>
        <div style="font-size:12px;">
          ${dayEvents.length ? dayEvents.length + "件" : ""}
        </div>
      </div>
    `;
  }
}

// =========================
// 当月一覧
// =========================
function renderMonthlyList() {

  const list = document.getElementById("monthlyList");
  if (!list) return;

  list.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const keys = Object.keys(events).filter(k => {
    const [y, m] = k.split("-").map(Number);
    return y === year && m === month + 1;
  });

  if (keys.length === 0) {
    list.innerHTML = "<p>予定なし</p>";
    return;
  }

  keys.sort((a, b) => new Date(a) - new Date(b));

  keys.forEach(dateKey => {

    events[dateKey].forEach(e => {

      list.innerHTML += `
        <div class="event-item">
          ${dateKey} ${e.time} ${e.name}：${e.schedule}
        </div>
      `;

    });

  });
}

// =========================
// 月移動
// =========================
window.changeMonth = function (offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar();
  renderMonthlyList();
};

// =========================
// モーダル
// =========================
window.openModal = function (dateKey) {

  document.getElementById("modal").style.display = "block";
  document.getElementById("selectedDate").textContent = dateKey;

  window.selectedDate = dateKey;

  renderDayEvents(dateKey);
};

window.closeModal = function () {
  document.getElementById("modal").style.display = "none";
};

// =========================
// 保存
// =========================
window.saveEvent = function () {

  const name = document.getElementById("name").value;
  const schedule = document.getElementById("schedule").value;
  const hour = document.getElementById("hour").value;
  const minute = document.getElementById("minute").value;

  if (!name || !schedule) {
    alert("名前と予定を入力してください");
    return;
  }

  const dateKey = window.selectedDate;

  if (!events[dateKey]) {
    events[dateKey] = [];
  }

  events[dateKey].push({
    name,
    schedule,
    time: `${hour}:${minute}`
  });

  localStorage.setItem("familyEvents", JSON.stringify(events));

  renderDayEvents(dateKey);
  renderCalendar();
  renderMonthlyList(); // ★これ重要（反映漏れ防止）
};

// =========================
// その日の予定
// =========================
function renderDayEvents(dateKey) {

  const container = document.getElementById("dayEvents");
  if (!container) return;

  container.innerHTML = "";

  const dayEvents = events[dateKey] || [];

  if (dayEvents.length === 0) {
    container.innerHTML = "<p>予定なし</p>";
    return;
  }

  dayEvents.forEach((e, i) => {

    container.innerHTML += `
      <div class="event-item">
        ${e.time} ${e.name}：${e.schedule}
        <button onclick="deleteEvent('${dateKey}', ${i})">削除</button>
      </div>
    `;

  });
}

// =========================
// 削除
// =========================
window.deleteEvent = function (dateKey, index) {

  events[dateKey].splice(index, 1);

  if (events[dateKey].length === 0) {
    delete events[dateKey];
  }

  localStorage.setItem("familyEvents", JSON.stringify(events));

  renderDayEvents(dateKey);
  renderCalendar();
  renderMonthlyList();
};

// =========================
// 初期表示
// =========================
document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
  renderMonthlyList();
});