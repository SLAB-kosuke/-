import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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
  const password = document.getElementById("passwordInput").value;

  if (password === PASSWORD) {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";

    initCalendar();
  } else {
    alert("パスワードが違います");
  }
};

function initCalendar() {
  const calendarEl = document.getElementById("calendar");

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
  document.getElementById("eventModal").style.display = "flex";

  if (date) {
    document.getElementById("eventDate").value = date;
  }
};

window.closeModal = function () {
  document.getElementById("eventModal").style.display = "none";
};

window.goToday = function () {
  calendar.today();
};

window.toggleList = function () {
  const list = document.getElementById("eventList");

  if (list.style.display === "block") {
    list.style.display = "none";
  } else {
    list.style.display = "block";
    generateList();
  }
};

window.saveEvent = async function () {
  const name = document.getElementById("eventName").value;
  const title = document.getElementById("eventTitle").value;
  const date = document.getElementById("eventDate").value;
  const time = document.getElementById("eventTime").value;
  const repeatType = document.getElementById("repeatType").value;

  const periodStart = document.getElementById("periodStart").value;
  const periodEnd = document.getElementById("periodEnd").value;

  if (!title || !date) {
    alert("タイトルと日付を入力してください");
    return;
  }

  await addDoc(collection(db, "events"), {
    name,
    title,
    date,
    time,
    repeatType,
    periodStart,
    periodEnd,
    color: COLORS[name],
    createdAt: Date.now()
  });

  closeModal();

  calendar.removeAllEvents();

  loadEvents();
};

async function loadEvents() {
  const snapshot = await getDocs(collection(db, "events"));

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    if (data.repeatType === "period") {
      generatePeriodEvents(data, docSnap.id);
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

function generatePeriodEvents(data, id) {
  const start = new Date(data.periodStart);
  const end = new Date(data.periodEnd);

  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];

    calendar.addEvent({
      id,
      title: formatTitle(data),
      start: dateStr,
      backgroundColor: data.color,
      borderColor: data.color,
      extendedProps: data
    });

    current.setDate(current.getDate() + 1);
  }
}

function formatTitle(data) {
  if (data.time) {
    return `${data.time} ${data.title}`;
  }

  return data.title;
}

function generateList() {
  const list = document.getElementById("eventList");

  const events = calendar.getEvents();

  events.sort((a, b) => new Date(a.start) - new Date(b.start));

  let html = "";

  events.forEach(event => {
    html += `
      <div style="margin-bottom:10px;padding:10px;border-bottom:1px solid #ddd;">
        <strong>${event.startStr}</strong><br>
        ${event.title}
      </div>
    `;
  });

  list.innerHTML = html;
}

function openDetailModal(event) {
  document.getElementById("detailModal").style.display = "flex";

  document.getElementById("detailTitle").innerText = event.title;

  const buttons = document.getElementById("detailButtons");

  const repeatType = event.extendedProps.repeatType;

  if (repeatType === "none") {
    buttons.innerHTML = `
      <button onclick="editEvent()">編集</button>
      <button onclick="deleteEvent()">削除</button>
      <button onclick="closeDetailModal()">閉じる</button>
    `;
  } else {
    buttons.innerHTML = `
      <button onclick="editEvent()">編集</button>
      <button onclick="deleteSingleRepeat()">当日削除</button>
      <button onclick="deleteFutureRepeat()">以降削除</button>
      <button onclick="closeDetailModal()">閉じる</button>
    `;
  }
}

window.closeDetailModal = function () {
  document.getElementById("detailModal").style.display = "none";
};

window.editEvent = function () {
  alert("編集機能は次段階で追加");
};

window.deleteEvent = async function () {
  await deleteDoc(doc(db, "events", selectedEvent.id));

  selectedEvent.remove();

  closeDetailModal();
};

window.deleteSingleRepeat = function () {
  alert("当日削除機能は次段階で追加");
};

window.deleteFutureRepeat = function () {
  alert("以降削除機能は次段階で追加");
};

const repeatSelect = document.getElementById("repeatType");

repeatSelect.addEventListener("change", () => {
  const value = repeatSelect.value;

  const periodFields = document.getElementById("periodFields");

  if (value === "period") {
    periodFields.style.display = "flex";
  } else {
    periodFields.style.display = "none";
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", 
