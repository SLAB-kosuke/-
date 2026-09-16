import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* Firebase設定 */

const firebaseConfig = {
  apiKey: "AIzaSyBGeCs9-gsS66uCZ9HqEsbSqNv4_dOE5Bg",
  authDomain: "family-calendar-38bf7.firebaseapp.com",
  projectId: "family-calendar-38bf7",
  storageBucket: "family-calendar-38bf7.firebasestorage.app",
  messagingSenderId: "419708212606",
  appId: "1:419708212606:web:2c93b424d3bd8c7387cf2f",
  measurementId: "G-H72FRHK749"
};


/* Firebase開始 */

const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);

const auth =
  getAuth(app);

signInAnonymously(auth)
  .then(() => {

    console.log("匿名ログイン成功");

  })
  .catch((error) => {

    console.error(error);

  });


/* パスワード */

const APP_PASSWORD = "1980";

/* ログイン */

window.login = function(){

  const pass =
    document.getElementById("passwordInput").value;

  if(pass === APP_PASSWORD){

    document.getElementById("loginScreen")
      .style.display = "none";

  }else{

    alert("パスワードが違います");

  }

};


/* 基本 */

let currentDate = new Date();

let selectedDay = null;

let events = {};


/* 時間 */

const hourSelect =
  document.getElementById("hour");

for(let i=0;i<24;i++){

  const option =
    document.createElement("option");

  const value =
    i.toString().padStart(2,"0");

  option.value = value;

  option.textContent = value;

  hourSelect.appendChild(option);

}


/* 色 */

function getClass(name){

  switch(name){

    case "パパ":
      return "papa";

    case "ママ":
      return "mama";

    case "トウカ":
      return "touka";

    case "ヒヨリ":
      return "hiyori";

    case "祖母":
      return "sobo";

    case "祖父":
      return "soji";

    default:
      return "";

  }

}


/* =========================================
   日本の祝日判定
   日曜日・祝日＝朱色
   土曜日＝青色
   ========================================= */

/* 第○月曜日 */
function getNthMonday(year, month, nth){

  const firstDay =
    new Date(year, month - 1, 1).getDay();

  return 1 + ((8 - firstDay) % 7) + ((nth - 1) * 7);

}


/* 春分の日 */
function getVernalEquinoxDay(year){

  return Math.floor(
    20.8431 +
    0.242194 * (year - 1980) -
    Math.floor((year - 1980) / 4)
  );

}


/* 秋分の日 */
function getAutumnalEquinoxDay(year){

  return Math.floor(
    23.2488 +
    0.242194 * (year - 1980) -
    Math.floor((year - 1980) / 4)
  );

}


/*
  祝日の基本日を取得
  ※現在の日本の祝日制度を中心に判定
*/
function getBasicJapaneseHolidays(year){

  const holidays = {};

  function add(month, day, name){

    const key =
      `${year}-${month}-${day}`;

    holidays[key] = name;

  }

  /* 元日 */
  add(1, 1, "元日");

  /* 成人の日 */
  if(year >= 2000){
    add(
      1,
      getNthMonday(year, 1, 2),
      "成人の日"
    );
  }

  /* 建国記念の日 */
  if(year >= 1967){
    add(2, 11, "建国記念の日");
  }

  /* 天皇誕生日 */
  if(year >= 2020){
    add(2, 23, "天皇誕生日");
  }

  /* 春分の日 */
  if(year >= 1949){
    add(
      3,
      getVernalEquinoxDay(year),
      "春分の日"
    );
  }

  /* 昭和の日 */
  if(year >= 2007){
    add(4, 29, "昭和の日");
  }

  /* 憲法記念日 */
  add(5, 3, "憲法記念日");

  /* みどりの日 */
  if(year >= 2007){
    add(5, 4, "みどりの日");
  }

  /* こどもの日 */
  add(5, 5, "こどもの日");

  /* 海の日 */
  if(year >= 2003){
    add(
      7,
      getNthMonday(year, 7, 3),
      "海の日"
    );
  }

  /* 山の日 */
  if(year >= 2016){
    add(8, 11, "山の日");
  }

  /* 敬老の日 */
  if(year >= 2003){
    add(
      9,
      getNthMonday(year, 9, 3),
      "敬老の日"
    );
  }

  /* 秋分の日 */
  if(year >= 1948){
    add(
      9,
      getAutumnalEquinoxDay(year),
      "秋分の日"
    );
  }

  /* スポーツの日 */
  if(year >= 2020){
    add(
      10,
      getNthMonday(year, 10, 2),
      "スポーツの日"
    );
  }

  /* 文化の日 */
  add(11, 3, "文化の日");

  /* 勤労感謝の日 */
  add(11, 23, "勤労感謝の日");

  /*
    2020年・2021年は東京オリンピックに伴う
    海の日・スポーツの日・山の日の特例を反映
  */
  if(year === 2020){

    delete holidays[`${year}-7-20`];

    /* 2020年の海の日＝7月23日 */
    add(7, 23, "海の日");

    delete holidays[`${year}-10-${getNthMonday(year, 10, 2)}`];

    /* 2020年のスポーツの日＝7月24日 */
    add(7, 24, "スポーツの日");

    delete holidays[`${year}-8-11`];

    /* 2020年の山の日＝8月10日 */
    add(8, 10, "山の日");

  }

  if(year === 2021){

    delete holidays[`${year}-7-${getNthMonday(year, 7, 3)}`];

    /* 2021年の海の日＝7月22日 */
    add(7, 22, "海の日");

    delete holidays[`${year}-8-11`];

    /* 2021年の山の日＝8月8日 */
    add(8, 8, "山の日");

    delete holidays[`${year}-10-${getNthMonday(year, 10, 2)}`];

    /* 2021年のスポーツの日＝7月23日 */
    add(7, 23, "スポーツの日");

  }

  return holidays;

}


/*
  日本の祝日を取得
  振替休日・国民の休日も追加
*/
function getJapaneseHolidays(year){

  const holidays =
    getBasicJapaneseHolidays(year);

  const dateKeys =
    Object.keys(holidays);

  /* 振替休日 */
  dateKeys.forEach(key=>{

    const parts =
      key.split("-");

    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);

    const date =
      new Date(y, m - 1, d);

    if(date.getDay() !== 0){
      return;
    }

    let substitute =
      new Date(date);

    do{

      substitute.setDate(
        substitute.getDate() + 1
      );

      const subKey =
        `${substitute.getFullYear()}-${substitute.getMonth()+1}-${substitute.getDate()}`;

      if(!holidays[subKey]){
        holidays[subKey] = "振替休日";
        break;
      }

    }while(true);

  });


  /*
    祝日と祝日の間の平日は「国民の休日」
  */
  for(let month=1;month<=12;month++){

    const lastDay =
      new Date(year, month, 0).getDate();

    for(let day=2;day<lastDay;day++){

      const current =
        new Date(year, month - 1, day);

      if(current.getDay() === 0 ||
         current.getDay() === 6){

        continue;

      }

      const prevKey =
        `${year}-${month}-${day-1}`;

      const nextKey =
        `${year}-${month}-${day+1}`;

      if(
        holidays[prevKey] &&
        holidays[nextKey] &&
        !holidays[`${year}-${month}-${day}`]
      ){

        holidays[`${year}-${month}-${day}`] =
          "国民の休日";

      }

    }

  }

  return holidays;

}


/* 日付の色用クラス */
function getDateClass(year, month, day){

  const date =
    new Date(year, month - 1, day);

  const weekday =
    date.getDay();

  const holidays =
    getJapaneseHolidays(year);

  const key =
    `${year}-${month}-${day}`;

  /* 祝日を最優先 */
  if(holidays[key]){
    return "date holiday";
  }

  /* 日曜日 */
  if(weekday === 0){
    return "date sunday";
  }

  /* 土曜日 */
  if(weekday === 6){
    return "date saturday";
  }

  /* 平日 */
  return "date";

}


/* カレンダー */

window.renderCalendar = function(){

  const calendar =
    document.getElementById("calendar");

  calendar.innerHTML = "";

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  document.getElementById("monthYear")
    .innerText =
      `${year}年 ${month+1}月`;

  const dayNames =
    ["日","月","火","水","木","金","土"];

  dayNames.forEach(day=>{

    const div =
      document.createElement("div");

    div.className =
      "day-name";

    div.innerText = day;

    calendar.appendChild(div);

  });

  const firstDay =
    new Date(year,month,1).getDay();

  const lastDate =
    new Date(year,month+1,0).getDate();

  for(let i=0;i<firstDay;i++){

    const empty =
      document.createElement("div");

    empty.className =
      "day empty";

    calendar.appendChild(empty);

  }

  for(let day=1;day<=lastDate;day++){

    const dateKey =
      `${year}-${month+1}-${day}`;

    const dayDiv =
      document.createElement("div");

    dayDiv.className =
      "day";

    const dateClass =
      getDateClass(
        year,
        month + 1,
        day
      );

    const holidayName =
      getJapaneseHolidays(year)[dateKey] || "";

    dayDiv.innerHTML =
      `<div class="${dateClass}"${holidayName ? ` title="${holidayName}"` : ""}>${day}</div>`;

    if(events[dateKey]){

      events[dateKey]
        .slice(0,5)
        .forEach(ev=>{

          const evDiv =
            document.createElement("div");

          evDiv.className =
            `event ${getClass(ev.name)}`;

          evDiv.innerHTML =
            `
            ${ev.time}
            ${ev.name}
            <br>
            ${ev.schedule}
            `;

          dayDiv.appendChild(evDiv);

        });

    }

    dayDiv.onclick = ()=>{

      openModal(dateKey);

    };

    calendar.appendChild(dayDiv);

  }

  renderMonthlyList();

};


/* モーダル */

window.openModal = function(date){

  selectedDay = date;

  document.getElementById("selectedDate")
    .innerText =
      `${date} の予定`;

  document.getElementById("modal")
    .style.display = "flex";

  renderDayEvents();

};


window.closeModal = function(){

  document.getElementById("modal")
    .style.display = "none";

};


/* group id */

function createGroupId(){

  return "group_" + Date.now();

}


/* 保存 */

window.saveEvent = async function(){

  const saveBtn =
    document.querySelector(".save-btn");

  saveBtn.disabled = true;

  saveBtn.innerText = "保存中...";

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

  const time =
    `${hour}:${minute}`;

  if(!name || !schedule){

    alert("入力してください");

    saveBtn.disabled = false;

    saveBtn.innerText = "決定";

    return;

  }

  const groupId =
    createGroupId();
console.log("① addDoc実行直前", {name, schedule, time, repeat, selectedDay});
  await addDoc(
    collection(db,"events"),
    {
      date: selectedDay,
      name,
      schedule,
      time,
      repeat,
      groupId
    }
  );
console.log("② addDoc成功");
  
  if(repeat !== "none"){

    await createRepeatEvents(
      selectedDay,
      name,
      schedule,
      time,
      repeat,
      groupId
    );

  }

  saveBtn.disabled = false;

  saveBtn.innerText = "決定";

  setTimeout(()=>{

    document.getElementById("name").value = "";

    document.getElementById("schedule").value = "";

    document.getElementById("hour").value = "00";

    document.getElementById("minute").value = "00";

    document.getElementById("repeatType").value = "none";

  },200);

};


/* 繰り返し */

async function createRepeatEvents(
  startDate,
  name,
  schedule,
  time,
  repeat,
  groupId
){

  let base =
    new Date(startDate);

  for(let i=1;i<=365;i++){

    let next =
      new Date(base);

    if(repeat==="daily"){

      next.setDate(
        base.getDate()+i
      );

    }

    if(repeat==="weekly"){

      next.setDate(
        base.getDate()+(7*i)
      );

    }

    if(repeat==="monthly"){

      next.setMonth(
        base.getMonth()+i
      );

    }

    if(
      repeat==="monthly" &&
      i > 12
    ){

      break;

    }

    if(
      repeat==="weekly" &&
      i > 52
    ){

      break;

    }

    const y =
      next.getFullYear();

    const m =
      next.getMonth()+1;

    const d =
      next.getDate();

    const key =
      `${y}-${m}-${d}`;

    await addDoc(

      collection(db,"events"),

      {
        date: key,
        name,
        schedule,
        time,
        repeat,
        groupId
      }

    );

  }

}


/* 削除 */

async function deleteEvent(id){

  if(
    !confirm(
      "削除しますか？"
    )
  ){
    return;
  }
  await deleteDoc(
    doc(db,"events",id)
  );
}

/* 当日削除 */

async function deleteSingleDay(
  groupId,
  targetDate
){

  if(
    !confirm(
      "この日だけ削除しますか？"
    )
  ){

    return;

  }

  if(!events[targetDate]){

    return;

  }

  for(const ev of events[targetDate]){

    if(ev.groupId === groupId){

      await deleteDoc(
        doc(db,"events",ev.id)
      );

    }

  }

}


/* 以降削除 */

async function deleteRepeatEvents(
  groupId,
  fromDate
){

  if(
    !confirm(
      "この日以降を削除しますか？"
    )
  ){

    return;

  }

  const start =
    new Date(fromDate);

  for(const date in events){

    const target =
      new Date(date);

    if(target >= start){

      for(const ev of events[date]){

        if(ev.groupId === groupId){

          await deleteDoc(
            doc(db,"events",ev.id)
          );

        }

      }

    }

  }

}


/* 全削除 */

async function deleteAllRepeatEvents(
  groupId
){

  if(
    !confirm(
      "繰り返し予定を全部削除しますか？"
    )
  ){

    return;

  }

  for(const date in events){

    for(const ev of events[date]){

      if(ev.groupId === groupId){

        await deleteDoc(
          doc(db,"events",ev.id)
        );

      }

    }

  }

}


/* 日別一覧 */

function renderDayEvents(){

  const dayEvents =
    document.getElementById("dayEvents");

  dayEvents.innerHTML = "";

  if(
    !events[selectedDay] ||
    events[selectedDay].length===0
  ){

    dayEvents.innerHTML =
      "予定はありません";

    return;

  }

  events[selectedDay]
    .forEach(ev=>{

      const div =
        document.createElement("div");

      div.className =
        "modal-event-item";

      const left =
        document.createElement("div");

      left.innerHTML =
        `
        ${ev.time}
        ｜ ${ev.name}
        ｜ ${ev.schedule}
        `;

      div.appendChild(left);

      const group =
        document.createElement("div");

      group.className =
        "button-group";

      /* 削除 */

      const deleteBtn =
        document.createElement("button");

      deleteBtn.className =
        "delete-btn";

      deleteBtn.innerText =
        "削除";

      deleteBtn.onclick = ()=>{

        if(ev.repeat !== "none"){

          deleteSingleDay(
            ev.groupId,
            selectedDay
          );

        }else{

          deleteEvent(ev.id);

        }

      };

      group.appendChild(deleteBtn);

      /* 繰り返し */

      if(ev.repeat !== "none"){

        const futureBtn =
          document.createElement("button");

        futureBtn.className =
          "repeat-delete-btn";

        futureBtn.innerText =
          "以降削除";

        futureBtn.onclick = ()=>{

          deleteRepeatEvents(
            ev.groupId,
            selectedDay
          );

        };

        group.appendChild(futureBtn);

        const allBtn =
          document.createElement("button");

        allBtn.className =
          "repeat-delete-btn";

        allBtn.innerText =
          "全削除";

        allBtn.onclick = ()=>{

          deleteAllRepeatEvents(
            ev.groupId
          );

        };

        group.appendChild(allBtn);

      }

      div.appendChild(group);

      dayEvents.appendChild(div);

    });

}


/* 月変更 */

window.changeMonth = function(num){

  currentDate.setMonth(
    currentDate.getMonth()+num
  );

  renderCalendar();

};


/* 一覧 */

function renderMonthlyList(){

  const monthlyList =
    document.getElementById("monthlyList");

  monthlyList.innerHTML = "";

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth()+1;

  let list = [];

  for(const date in events){

    const sp =
      date.split("-");

    if(
      Number(sp[0])===year &&
      Number(sp[1])===month
    ){

      events[date]
        .forEach(ev=>{

          list.push({

            date,
            ...ev

          });

        });

    }

  }

  list.sort((a,b)=>{

    if(a.date===b.date){

      return a.time.localeCompare(b.time);

    }

    return new Date(a.date)
      - new Date(b.date);

  });

  if(list.length===0){

    monthlyList.innerHTML =
      "予定はありません";

    return;

  }

  list.forEach(item=>{

    const div =
      document.createElement("div");

    div.className =
      "list-item";

    div.innerHTML =
      `
      ${item.date}
      ｜ ${item.time}
      ｜ ${item.name}
      ｜ ${item.schedule}
      `;

    monthlyList.appendChild(div);

  });

}


/* リアルタイム同期 */

onSnapshot(

  collection(db,"events"),

  (snapshot)=>{

    events = {};

    snapshot.forEach(docSnap=>{

      const data =
        docSnap.data();

      if(!events[data.date]){

        events[data.date] = [];

      }

      events[data.date].push({

        id: docSnap.id,

        ...data

      });

    });

    renderCalendar();

    if(selectedDay){

      renderDayEvents();

    }

  }

);


renderCalendar();

if ("serviceWorker" in navigator) {

  navigator.serviceWorker
    .register("./service-worker.js")
    .then(() => {

      console.log("Service Worker登録成功");

    });

}

