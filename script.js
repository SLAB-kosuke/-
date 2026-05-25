```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBGeCs9-gsS66uCZ9HqEsbSqNv4_dOE5Bg",
  authDomain: "family-calendar-38bf7.firebaseapp.com",
  projectId: "family-calendar-38bf7",
  storageBucket: "family-calendar-38bf7.firebasestorage.app",
  messagingSenderId: "419708212606",
  appId: "1:419708212606:web:2c93b424d3bd8c7387cf2f",
  measurementId: "G-H72FRHK749"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const eventsRef = collection(db, "events");

// パスワード
const APP_PASSWORD = "1980";

// 色
const nameColors = {
  "パパ": "#2196f3",
  "ママ": "#f1c40f",
  "トウカ": "#7FDBFF",
  "ヒヨリ": "#ff69b4",
  "祖母": "#9b59b6",
  "祖父": "#808080"
};

let currentDate = new Date();
let events = [];
let editingId = null;

// 初期化
document.addEventListener("DOMContentLoaded", () => {

  const hour =
    document.getElementById("hour");

  for (let i = 0; i < 24; i++) {

    const h =
      String(i).padStart(2, "0");

    hour.innerHTML += `
      <option value="${h}">
        ${h}
      </option>
    `;
  }

  document
    .getElementById("repeatType")
    .addEventListener("change", function () {

      const end =
        document.getElementById("repeatEnd");

      if (this.value === "other") {

        end.style.display = "block";

      } else {

        end.style.display = "none";
      }
    });

  loadEvents();
});

// ログイン
window.login = function () {

  const pass =
    document
      .getElementById("passwordInput")
      .value
      .trim();

  if (pass === APP_PASSWORD) {

    document
      .getElementById("loginScreen")
      .style.display = "none";

  } else {

    alert("パスワードが違います");
  }
};

// Firestore読込
function loadEvents() {

  onSnapshot(eventsRef, snapshot => {

    events = [];

    snapshot.forEach(docu => {

      events.push({
        id: docu.id,
        ...docu.data()
      });
    });

    renderCalendar();
    renderMonthlyList();
  });
}

// カレンダー
function renderCalendar() {

  const calendar =
    document.getElementById("calendar");

  calendar.innerHTML = "";

  const monthYear =
    document.getElementById("monthYear");

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

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
      events.filter(e => e.date === dateKey);

    let html = `
      <div class="day"
      onclick="openModal('${dateKey}')">

      <div>${day}</div>
    `;

    dayEvents.forEach(e => {

      html += `
        <div style="
          background:${e.color};
          color:white;
          padding:2px;
          margin-top:2px;
          border-radius:5px;
          font-size:11px;
        ">
          ${e.time}
          ${e.name}
        </div>
      `;
    });

    html += `</div>`;

    calendar.innerHTML += html;
  }
}

// 月一覧
function renderMonthlyList() {

  const list =
    document.getElementById("monthlyList");

  list.innerHTML = "";

  events.forEach(e => {

    list.innerHTML += `
      <div style="
        background:${e.color};
        color:white;
        padding:6px;
        margin-bottom:5px;
        border-radius:5px;
      ">
        ${e.date}
        ${e.time}
        ${e.name}
        ：${e.schedule}
      </div>
    `;
  });
}

// モーダル
window.openModal = function(dateKey) {

  window.selectedDate = dateKey;

  document
    .getElementById("modal")
    .style.display = "flex";

  document
    .getElementById("selectedDate")
    .textContent = dateKey;

  renderDayEvents(dateKey);
};

window.closeModal = function() {

  document
    .getElementById("modal")
    .style.display = "none";
};

// 保存
window.saveEvent = async function () {

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

  if (!name || !schedule) {

    alert("入力してください");
    return;
  }

  const data = {

    date: window.selectedDate,

    name,

    schedule,

    time: `${hour}:${minute}`,

    repeat,

    repeatEnd,

    color:
      nameColors[name] || "#4a90e2"
  };

  if (editingId) {

    await updateDoc(
      doc(db, "events", editingId),
      data
    );

    editingId = null;

  } else {

    await addDoc(eventsRef, data);
  }

  closeModal();
};

// 日別
function renderDayEvents(dateKey) {

  const box =
    document.getElementById("dayEvents");

  box.innerHTML = "";

  const dayEvents =
    events.filter(e => e.date === dateKey);

  dayEvents.forEach(e => {

    box.innerHTML += `
      <div style="
        background:${e.color};
        color:white;
        padding:6px;
        margin-bottom:6px;
        border-radius:6px;
      ">

        ${e.time}
        ${e.name}
        ：${e.schedule}

        <div style="
          display:flex;
          gap:5px;
          margin-top:5px;
        ">

          <button
            style="
              background:#f1c40f;
              color:black;
            "
            onclick="editEvent('${e.id}')">

            編集

          </button>

          <button
            style="
              background:#e74c3c;
              color:white;
            "
            onclick="deleteEvent('${e.id}')">

            削除

          </button>

        </div>

      </div>
    `;
  });
}

// 編集
window.editEvent = function(id) {

  const e =
    events.find(v => v.id === id);

  if (!e) return;

  editingId = id;

  document.getElementById("name").value =
    e.name;

  document.getElementById("schedule").value =
    e.schedule;

  const parts =
    e.time.split(":");

  document.getElementById("hour").value =
    parts[0];

  document.getElementById("minute").value =
    parts[1];

  document.getElementById("repeatType").value =
    e.repeat || "none";

  document.getElementById("repeatEnd").value =
    e.repeatEnd || "";

  document.getElementById("modal").style.display =
    "flex";
};

// 削除
window.deleteEvent = async function(id) {

  if (!confirm("削除しますか？"))
    return;

  await deleteDoc(
    doc(db, "events", id)
  );
};

// 月変更
window.changeMonth = function(offset) {

  currentDate.setMonth(
    currentDate.getMonth() + offset
  );

  renderCalendar();
};
```
