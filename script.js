// =========================
// Firebase
// =========================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase設定
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

// =========================

const APP_PASSWORD = "1980";

let currentDate = new Date();

let events = [];

let editingId = null;

// =========================
// 初期化
// =========================

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

      document
        .getElementById("repeatEnd")
        .style.display =
          this.value === "other"
            ? "block"
            : "none";
    });

  loadEvents();
});

// =========================
// ログイン
// =========================

window.login = function () {

  const pass =
    document
      .getElementById("passwordInput")
      .value;

  if (pass === APP_PASSWORD) {

    document
      .getElementById("loginScreen")
      .style.display = "none";

  } else {

    alert("パスワード違います");
  }
};

// =========================
// Firestore読込
// =========================

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

// =========================
// カレンダー
// =========================

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
    calendar.innerHTML += "<div></div>";
  }

  for (let day = 1; day <= lastDate; day++) {

    const dateKey =
      `${year}-${month + 1}-${day}`;

    const dayEvents =
      getEventsForDate(dateKey);

    let html = `
      <div class="day"
        onclick="openModal('${dateKey}')">

        <div>${day}</div>
    `;

    dayEvents.forEach(e => {

      html += `
        <div style="
          background:${e.color};
          color:#fff;
          margin-top:2px;
          padding:2px;
          border-radius:4px;
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

// =========================
// 繰り返し
// =========================

function getEventsForDate(dateKey) {

  const target =
    new Date(dateKey);

  return events.filter(e => {

    const base =
      new Date(e.date);

    if (e.date === dateKey)
      return true;

    if (e.repeat === "weekly") {

      return (
        base.getDay() ===
        target.getDay()
      );
    }

    if (e.repeat === "monthly") {

      return (
        base.getDate() ===
        target.getDate()
      );
    }

    if (e.repeat === "other") {

      if (!e.repeatEnd)
        return false;

      const end =
        new Date(e.repeatEnd);

      return (
        target >= base &&
        target <= end
      );
    }

    return false;
  });
}

// =========================
// 月一覧
// =========================

function renderMonthlyList() {

  const list =
    document.getElementById("monthlyList");

  list.innerHTML = "";

  events.forEach(e => {

    list.innerHTML += `
      <div style="
        background:${e.color};
        color:#fff;
        margin-bottom:5px;
        padding:5px;
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

// =========================
// モーダル
// =========================

window.openModal = function(dateKey) {

  window.selectedDate = dateKey;

  document
    .getElementById("modal")
    .style.display = "block";

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

// =========================
// 保存
// =========================

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

  const color =
    document.getElementById("eventColor").value;

  const data = {

    date: window.selectedDate,

    name,

    schedule,

    time: `${hour}:${minute}`,

    repeat,

    repeatEnd,

    color
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

// =========================
// 日別
// =========================

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
        color:#fff;
        padding:5px;
        margin-bottom:5px;
        border-radius:5px;
      ">

        ${e.time}
        ${e.name}
        ：${e.schedule}

        <br>

        <button onclick="editEvent('${e.id}')">
          編集
        </button>

        <button onclick="deleteEvent('${e.id}')">
          削除
        </button>

      </div>
    `;
  });
}

// =========================
// 編集
// =========================

window.editEvent = function(id) {

  const e =
    events.find(v => v.id === id);

  editingId = id;

  document.getElementById("name").value =
    e.name;

  document.getElementById("schedule").value =
    e.schedule;

  const [h, m] =
    e.time.split(":");

  document.getElementById("hour").value = h;

  document.getElementById("minute").value = m;

  document.getElementById("repeatType").value =
    e.repeat;

  document.getElementById("repeatEnd").value =
    e.repeatEnd || "";

  document.getElementById("eventColor").value =
    e.color;

  openModal(e.date);
};

// =========================
// 削除
// =========================

window.deleteEvent =
async function(id) {

  await deleteDoc(
    doc(db, "events", id)
  );
};

// =========================
// 月変更
// =========================

window.changeMonth = function(offset) {

  currentDate.setMonth(
    currentDate.getMonth() + offset
  );

  renderCalendar();
};
```
