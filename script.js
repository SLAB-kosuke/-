import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const PASSWORD = "1980";

const COLORS = {
  "パパ": "#4A90E2",
  "ママ": "#F8E71C",
  "トウカ": "#7FDBFF",
  "ヒヨリ": "#FFB6D9",
  "祖母": "#B36AE2",
  "祖父": "#9B9B9B",
  "共通": "#50C878"
};

let calendar;
let selectedEvent = null;

window.login = function () {

  const password =
    document.getElementById("passwordInput").value;

  if (password === PASSWORD) {

    document.getElementById("loginScreen").style.display =
      "none";

    document.getElementById("mainApp").style.display =
      "block";

    initCalendar();

  } else {

    alert("パスワードが違います");

  }

};

function initCalendar() {

  const calendarEl =
    document.getElementById("calendar");

  calendar = new FullCalendar.Calendar(calendarEl, {

    initialView: "dayGridMonth",

    locale: "ja",

    height: "auto",

    dayMaxEvents: 5,

    dateClick(info) {

      openModal(info.dateStr);

    },

    eventClick(info) {

      selectedEvent = info.event;

      openDetailModal(info.event);

    }

  });

  calendar.render();

  loadEvents();

}

window.openModal = function (date = "") {

  selectedEvent = null;

  document.getElementById("eventModal").style.display =
    "flex";

  document.getElementById("eventName").value =
    "";

  document.getElementById("eventTitle").value =
    "";

  document.getElementById("eventDate").value =
    date || "";

  document.getElementById("eventTime").value =
    "";

  document.getElementById("repeatType").value =
    "none";

  document.getElementById("periodStart").value =
    "";

  document.getElementById("periodEnd").value =
    "";

  document.getElementById("periodFields").style.display =
    "none";

};

window.closeModal = function () {

  document.getElementById("eventModal").style.display =
    "none";

  document.getElementById("eventName").value =
    "";

  document.getElementById("eventTitle").value =
    "";

  document.getElementById("eventDate").value =
    "";

  document.getElementById("eventTime").value =
    "";

  document.getElementById("repeatType").value =
    "none";

  document.getElementById("periodStart").value =
    "";

  document.getElementById("periodEnd").value =
    "";

  document.getElementById("periodFields").style.display =
    "none";

};

window.goToday = function () {

  calendar.today();

};

window.toggleList = function () {

  const list =
    document.getElementById("eventList");

  if (list.style.display === "block") {

    list.style.display = "none";

  } else {

    list.style.display = "block";

    generateList();

  }

};

window.saveEvent = async function () {

  try {

    const name =
      document.getElementById("eventName").value;

    if (!name) {

      alert("名前を選択してください");

      return;

    }

    const title =
      document.getElementById("eventTitle").value;

    const date =
      document.getElementById("eventDate").value;

    const time =
      document.getElementById("eventTime").value;

    const repeatType =
      document.getElementById("repeatType").value;

    const periodStart =
      document.getElementById("periodStart").value;

    const periodEnd =
      document.getElementById("periodEnd").value;

    let excludedDates = [];

    if (selectedEvent?.extendedProps?.excludedDates) {

      excludedDates =
        selectedEvent.extendedProps.excludedDates;

    }

    const saveData = {
      name,
      title,
      date,
      time,
      repeatType,
      periodStart,
      periodEnd,
      excludedDates,
      repeatEndDate:
  selectedEvent?.extendedProps?.repeatEndDate || "",
      color: COLORS[name],
      createdAt: Date.now()
    };

    if (selectedEvent) {

      await updateDoc(
        doc(db, "events_v2", selectedEvent.id),
        saveData
      );

    } else {

      await addDoc(
        collection(db, "events_v2"),
        saveData
      );

    }

    calendar.removeAllEvents();

    await loadEvents();

    selectedEvent = null;

    closeModal();

    alert("保存しました");

  } catch (error) {

    console.error(error);

    alert("保存失敗");

  }

};

async function loadEvents() {

  const snapshot =
    await getDocs(collection(db, "events_v2"));

  snapshot.forEach((docSnap) => {

    const data =
      docSnap.data();

    if (!data.excludedDates) {

      data.excludedDates = [];

    }

    if (data.repeatType === "period") {

      generatePeriodEvents(data, docSnap.id);

    } else if (data.repeatType === "weekly") {

      generateWeeklyEvents(data, docSnap.id);

    } else if (data.repeatType === "monthly") {

      generateMonthlyEvents(data, docSnap.id);

    } else if (data.repeatType === "yearly") {

      generateYearlyEvents(data, docSnap.id);

    } else {

      calendar.addEvent({

        id: docSnap.id,

        title: formatTitle(data),

        start: data.date,

        backgroundColor: data.color,

        borderColor: data.color,

        extendedProps: data

      });

    }

  });

}

function addCalendarEvent(data, id, dateStr) {

  if (
    data.excludedDates &&
    data.excludedDates.includes(dateStr)
  ) {
    return;
  }

  calendar.addEvent({

    id,

    title: formatTitle(data),

    start: dateStr,

    backgroundColor: data.color,

    borderColor: data.color,

    extendedProps: data

  });

}

function generatePeriodEvents(data, id) {

  const start =
    new Date(data.periodStart);

  const end =
    new Date(data.periodEnd);

  const current =
    new Date(start);

  while (current <= end) {

    const dateStr =
      current.toISOString().split("T")[0];

    addCalendarEvent(data, id, dateStr);

    current.setDate(current.getDate() + 1);

  }

}

function generateWeeklyEvents(data, id) {

  const start =
    new Date(data.date);

  for (let i = 0; i < 52; i++) {

    const current =
      new Date(start);

    current.setDate(
      start.getDate() + (i * 7)
    );

    const dateStr =
      current.toISOString().split("T")[0];

    addCalendarEvent(data, id, dateStr);

  }

}

function generateMonthlyEvents(data, id) {

  const start =
    new Date(data.date);

  for (let i = 0; i < 24; i++) {

    const current =
      new Date(start);

    current.setMonth(
      start.getMonth() + i
    );

    const dateStr =
      current.toISOString().split("T")[0];

    addCalendarEvent(data, id, dateStr);

  }

}

function generateYearlyEvents(data, id) {

  const start =
    new Date(data.date);

  for (let i = 0; i < 10; i++) {

    const current =
      new Date(start);

    current.setFullYear(
      start.getFullYear() + i
    );

    const dateStr =
      current.toISOString().split("T")[0];

    addCalendarEvent(data, id, dateStr);

  }

}

function formatTitle(data) {

  let text = "";

  if (data.time) {

    text += `${data.time} `;

  }

  text += `[${data.name}] ${data.title}`;

  return text;

}

function generateList() {

  const list =
    document.getElementById("eventList");

  const events =
    calendar.getEvents();

  events.sort((a, b) => {

    return new Date(a.start) -
      new Date(b.start);

  });

  let html = "";

  events.forEach(event => {

    html += `
      <div style="
        margin-bottom:10px;
        padding:10px;
        border-bottom:1px solid #ddd;
      ">

        <strong>${event.startStr}</strong><br>

        ${event.title}

      </div>
    `;

  });

  list.innerHTML = html;

}

function openDetailModal(event) {

  document.getElementById("detailModal").style.display =
    "flex";

  document.getElementById("detailTitle").innerText =
    event.title;

  const buttons =
    document.getElementById("detailButtons");

  const repeatType =
    event.extendedProps.repeatType;

  if (repeatType === "none") {

    buttons.innerHTML = `
      <button onclick="editEvent()">
        編集
      </button>

      <button onclick="deleteEvent()">
        削除
      </button>

      <button onclick="closeDetailModal()">
        閉じる
      </button>
    `;

  } else {

    buttons.innerHTML = `
      <button onclick="editEvent()">
        編集
      </button>

      <button onclick="deleteSingleRepeat()">
        当日削除
      </button>

      <button onclick="deleteFutureRepeat()">
        以降削除
      </button>

      <button onclick="closeDetailModal()">
        閉じる
      </button>
    `;

  }

}

window.closeDetailModal = function () {

  document.getElementById("detailModal").style.display =
    "none";

};

window.editEvent = function () {

  closeDetailModal();

  const data =
    selectedEvent.extendedProps;

  document.getElementById("eventName").value =
    data.name || "";

  document.getElementById("eventTitle").value =
    data.title || "";

  document.getElementById("eventDate").value =
    data.date || "";

  document.getElementById("eventTime").value =
    data.time || "";

  document.getElementById("repeatType").value =
    data.repeatType || "none";

  document.getElementById("periodStart").value =
    data.periodStart || "";

  document.getElementById("periodEnd").value =
    data.periodEnd || "";

  if (data.repeatType === "period") {

    document.getElementById("periodFields").style.display =
      "flex";

  } else {

    document.getElementById("periodFields").style.display =
      "none";

  }

  document.getElementById("eventModal").style.display =
    "flex";

};

window.deleteEvent = async function () {

  try {

    await deleteDoc(
      doc(db, "events_v2", selectedEvent.id)
    );

    selectedEvent.remove();

    closeDetailModal();

    alert("削除しました");

  } catch (error) {

    console.error(error);

    alert("削除失敗");

  }

};

window.deleteSingleRepeat = async function () {

  try {

    const dateStr =
      selectedEvent.startStr;

    const data =
      selectedEvent.extendedProps;

    let excludedDates =
      data.excludedDates || [];

    if (!excludedDates.includes(dateStr)) {

      excludedDates.push(dateStr);

    }

    await updateDoc(
      doc(db, "events_v2", selectedEvent.id),
      {
        excludedDates
      }
    );

    calendar.removeAllEvents();

    await loadEvents();

    closeDetailModal();

    alert("当日の予定を削除しました");

  } catch (error) {

    console.error(error);

    alert("削除失敗");

  }

};

window.deleteFutureRepeat = function () {

  alert("以降削除機能は次段階で追加");

};

const repeatSelect =
  document.getElementById("repeatType");

repeatSelect.addEventListener("change", () => {

  const value =
    repeatSelect.value;

  const periodFields =
    document.getElementById("periodFields");

  if (value === "period") {

    periodFields.style.display =
      "flex";

  } else {

    periodFields.style.display =
      "none";

  }

});
