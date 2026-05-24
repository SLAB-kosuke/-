```javascript
// =========================
// 家族予定アプリ 完全版
// =========================

const APP_PASSWORD = "1980";

const STORAGE_KEY = "familyEvents";

let currentDate = new Date();

let editingIndex = null;

let events =
  JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

// =========================
// 名前カラー
// =========================
const nameColors = {
  "パパ": "#4a90e2",
  "ママ": "#f1c40f",
  "トウカ": "#7ed6ff",
  "ヒヨリ": "#ff7eb6",
  "祖母": "#9b59b6",
  "祖父": "#95a5a6"
};

// =========================
// 初期化
// =========================
document.addEventListener("DOMContentLoaded", () => {

  // 時間生成
  const hourSelect = document.getElementById("hour");

  for (let i = 0; i < 24; i++) {

    const h = String(i).padStart(2, "0");

    const option = document.createElement("option");

    option.value = h;
    option.textContent = h;

    hourSelect.appendChild(option);
  }

  renderCalendar();
  renderMonthlyList();
});

// =========================
// ログイン
// =========================
window.login = function () {

  const pass =
    document.getElementById("passwordInput").value.trim();

  if (pass === APP_PASSWORD) {

    document.getElementById("loginScreen").style.display =
      "none";

    renderCalendar();
    renderMonthlyList();

  } else {

    alert("パスワードが違います");
  }
};

// =========================
// カレンダー
// =========================
function renderCalendar() {

  const calendar =
    document.getElementById("calendar");

  const monthYear =
    document.getElementById("monthYear");

  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent =
    `${year}年 ${month + 1}月`;

  const firstDay =
    new Date(year, month, 1).getDay();

  const lastDate =
    new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += `<div></div>`;
  }

  for (let day = 1; day <= lastDate; day++) {

    const dateKey =
      `${year}-${month + 1}-${day}`;

    const dayEvents =
      getEventsForDate(dateKey);

    let html =
      `<div class="day"
        onclick="openModal('${dateKey}')">

        <div>${day}</div>`;

    dayEvents
      .sort((a, b) =>
        a.time.localeCompare(b.time)
      )
      .forEach(e => {

        html += `
          <div style="
            background:${e.color};
            color:#fff;
            font-size:11px;
            padding:2px 5px;
            margin-top:2px;
            border-radius:5px;
          ">
            ${e.time}
            ${e.name}
            ${e.schedule}
          </div>
        `;
      });

    html += `</div>`;

    calendar.innerHTML += html;
  }
}

// =========================
// 月一覧
// =========================
function renderMonthlyList() {

  const list =
    document.getElementById("monthlyList");

  list.innerHTML = "";

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth() + 1;

  let allEvents = [];

  for (let day = 1; day <= 31; day++) {

    const dateKey =
      `${year}-${month}-${day}`;

    const dayEvents =
      getEventsForDate(dateKey);

    dayEvents.forEach(e => {

      allEvents.push({
        dateKey,
        ...e
      });
    });
  }

  allEvents.sort((a, b) => {

    const d1 =
      new Date(`${a.dateKey} ${a.time}`);

    const d2 =
      new Date(`${b.dateKey} ${b.time}`);

    return d1 - d2;
  });

  if (allEvents.length === 0) {

    list.innerHTML =
      "<p>今月の予定はありません</p>";

    return;
  }

  allEvents.forEach(e => {

    list.innerHTML += `
      <div style="
        background:${e.color};
        color:#fff;
        padding:6px;
        margin-bottom:6px;
        border-radius:6px;
      ">
        ${e.dateKey}
        ${e.time}
        ${e.name}
        ：${e.schedule}
      </div>
    `;
  });
}

// =========================
// 繰り返し判定
// =========================
function getEventsForDate(dateKey) {

  let result = [];

  const targetDate = new Date(dateKey);

  for (const baseDate in events) {

    events[baseDate].forEach(e => {

      const base =
        new Date(baseDate);

      let show = false;

      if (baseDate === dateKey) {
        show = true;
      }

      // 毎週
      if (e.repeat === "weekly") {

        if (
          targetDate.getDay() ===
          base.getDay()
        ) {
          show = true;
        }
      }

      // 毎月
      if (e.repeat === "monthly") {

        if (
          targetDate.getDate() ===
          base.getDate()
        ) {
          show = true;
        }
      }

      // その他
      if (e.repeat === "other") {

        if (!e.repeatEnd) return;

        const end =
          new Date(e.repeatEnd);

        if (
          targetDate >= base &&
          targetDate <= end
        ) {
          show = true;
        }
      }

      if (show) {
        result.push(e);
      }
    });
  }

  return result;
}

// =========================
// 月変更
// =========================
window.changeMonth = function(offset) {

  currentDate.setMonth(
    currentDate.getMonth() + offset
  );

  renderCalendar();
  renderMonthlyList();
};

// =========================
// モーダル
// =========================
window.openModal = function(dateKey) {

  window.selectedDate = dateKey;

  editingIndex = null;

  document.getElementById("modal")
    .style.display = "block";

  document.getElementById("selectedDate")
    .textContent = dateKey;

  renderDayEvents(dateKey);
};

window.closeModal = function() {

  document.getElementById("modal")
    .style.display = "none";
};

// =========================
// 保存
// =========================
window.saveEvent = function() {

  const name =
    document.getElementById("name").value;

  const schedule =
    document.getElementById("schedule").value;

  const hour =
    document.getElementById("hour").value;

  const minute =
    document.getElementById("minute").value;

  const repeat =
    document.getElementById("repeatType").value;

  const repeatEnd =
    document.getElementById("repeatEnd").value;

  const color =
    document.getElementById("eventColor").value;

  if (!name || !schedule) {

    alert("名前と予定を入力してください");

    return;
  }

  const dateKey = window.selectedDate;

  if (!events[dateKey]) {
    events[dateKey] = [];
  }

  const newEvent = {
    name,
    schedule,
    time: `${hour}:${minute}`,
    repeat,
    repeatEnd,
    color
  };

  if (editingIndex !== null) {

    events[dateKey][editingIndex] =
      newEvent;

  } else {

    events[dateKey].push(newEvent);
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(events)
  );

  editingIndex = null;

  document.getElementById("schedule").value =
    "";

  renderCalendar();
  renderMonthlyList();
  renderDayEvents(dateKey);
};

// =========================
// 日別表示
// =========================
function renderDayEvents(dateKey) {

  const container =
    document.getElementById("dayEvents");

  container.innerHTML = "";

  const dayEvents =
    events[dateKey] || [];

  if (dayEvents.length === 0) {

    container.innerHTML =
      "<p>予定なし</p>";

    return;
  }

  dayEvents.forEach((e, i) => {

    container.innerHTML += `
      <div style="
        background:${e.color};
        color:#fff;
        padding:6px;
        margin-bottom:5px;
        border-radius:5px;
      ">

        ${e.time}
        ${e.name}
        ：${e.schedule}

        <br>

        <button onclick="
          editEvent('${dateKey}', ${i})
        ">
          編集
        </button>

        <button onclick="
          deleteEvent('${dateKey}', ${i})
        ">
          削除
        </button>

      </div>
    `;
  });
}

// =========================
// 編集
// =========================
window.editEvent = function(dateKey, index) {

  const e = events[dateKey][index];

  editingIndex = index;

  document.getElementById("name").value =
    e.name;

  document.getElementById("schedule").value =
    e.schedule;

  const [h, m] =
    e.time.split(":");

  document.getElementById("hour").value = h;

  document.getElementById("minute").value = m;

  document.getElementById("repeatType").value =
    e.repeat || "none";

  document.getElementById("repeatEnd").value =
    e.repeatEnd || "";

  document.getElementById("eventColor").value =
    e.color || "#4a90e2";
};

// =========================
// 削除
// =========================
window.deleteEvent = function(dateKey, index) {

  events[dateKey].splice(index, 1);

  if (events[dateKey].length === 0) {
    delete events[dateKey];
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(events)
  );

  renderCalendar();
  renderMonthlyList();
  renderDayEvents(dateKey);
};
```
