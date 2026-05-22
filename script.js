// =========================
// 家族予定アプリ（完成版）
// 背景色分け対応
// =========================

const APP_PASSWORD = "1980";

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("familyEvents") || "{}");

// =========================
// 名前カラー（背景色）
// =========================
const nameColors = {
  "パパ": "#4a90e2",     // 青
  "ママ": "#f1c40f",     // 黄
  "トウカ": "#7ed6ff",   // ライトブルー
  "ヒヨリ": "#ff7eb6",   // ピンク
  "祖母": "#9b59b6",     // 紫
  "祖父": "#95a5a6"      // グレー
};

// =========================
// 初期化
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

    // ★予定表示（背景色バッジ）
    dayEvents.forEach(e => {

      const bg = nameColors[e.name] || "#ccc";

      html += `
        <div style="
          background:${bg};
          color:#fff;
          font-size:11px;
          padding:2px 5px;
          margin-top:2px;
          border-radius:5px;
          line-height:1.2;
        ">
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
  list.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  let hasData = false;

  for (const dateKey in events) {

    const [y, m] = dateKey.split("-").map(Number);

    if (y === year && m === month + 1) {

      events[dateKey].forEach(e => {

        hasData = true;

        const bg = nameColors[e.name] || "#ccc";

        list.innerHTML += `
          <div style="margin-bottom:6px;">
            
            <span style="
              background:${bg};
              color:#fff;
              padding:3px 6px;
              border-radius:5px;
              font-size:12px;
              margin-right:6px;
            ">
              ${e.name}
            </span>

            ${dateKey} ${e.time}：${e.schedule}
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
  container.innerHTML = "";

  const dayEvents = events[dateKey] || [];

  if (dayEvents.length === 0) {
    container.innerHTML = "<p>予定なし</p>";
    return;
  }

  dayEvents.forEach((e, i) => {

    const bg = nameColors[e.name] || "#ccc";

    container.innerHTML += `
      <div style="
        background:${bg};
        color:#fff;
        padding:5px;
        margin-bottom:5px;
        border-radius:5px;
      ">
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