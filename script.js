// =========================
// 家族予定アプリ（完全安定版）
// =========================

const APP_PASSWORD = "1980";

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("familyEvents") || "{}");

// =========================
// 名前カラー
// =========================
const nameColors = {
  "パパ": "#4a90e2",
  "ママ": "#e26aa0",
  "トウカ": "#7ed321",
  "ヒヨリ": "#f5a623",
  "祖母": "#8e44ad",
  "祖父": "#34495e"
};

// =========================
// 初期化（これが超重要）
// =========================
document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
  renderMonthlyList();
});

// =========================
// ログイン
// =========================
window.login = function () {

  const pass = document.getElementById("passwordInput").value.trim();

  if (pass === APP_PASSWORD) {

    document.getElementById("loginScreen").style.display = "none";

    renderCalendar();
    renderMonthlyList();

  } else {
    alert("パスワードが違います");
  }
};

// =========================
// カレンダー表示
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

    let html = `<div class="day" onclick="openModal('${dateKey}')">
      <div>${day}</div>
    `;

    // ★予定を全部表示
    dayEvents.forEach(e => {

      const color = nameColors[e.name] || "#333";

      html += `
        <div style="font-size:11px;color:${color};line-height:1.2;">
          ${e.time} ${e.name} ${e.schedule}
        </div>
      `;
    });

    html += `</div>`;

    calendar.innerHTML += html;
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

  let hasData = false;

  for (const dateKey in events) {

    const [y, m] = dateKey.split("-").map(Number);

    if (y === year && m === month + 1) {

      events[dateKey].forEach(e => {

        hasData = true;

        const color = nameColors[e.name] || "#333";

        list.innerHTML += `
          <div style="color:${color}">
            ${dateKey} ${e.time} ${e.name}：${e.schedule}
          </div>
        `;
      });
    }
  }

  if (!hasData) {
    list.innerHTML = "<p>今月の予定はありません</p>";
  }
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

  window.selectedDate = dateKey;

  document.getElementById("modal").style.display = "block";
  document.getElementById("selectedDate").textContent = dateKey;

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

  renderCalendar();
  renderMonthlyList();
  renderDayEvents(dateKey);
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

    const color = nameColors[e.name] || "#333";

    container.innerHTML += `
      <div style="color:${color}">
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

  renderCalendar();
  renderMonthlyList();
  renderDayEvents(dateKey);
};