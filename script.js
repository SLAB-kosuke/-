const APP_PASSWORD = "1234";

function login(){

  const pass =
    document.getElementById("passwordInput").value;

  if(pass === APP_PASSWORD){

    document.getElementById("loginScreen")
      .style.display = "none";

  }else{

    alert("パスワードが違います");

  }

}

let currentDate = new Date();

let selectedDay = null;

let events =
  JSON.parse(localStorage.getItem("familyEvents")) || {};

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

function saveLocal(){

  localStorage.setItem(
    "familyEvents",
    JSON.stringify(events)
  );

}

/* カレンダー */

function renderCalendar(){

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

    div.className = "day-name";
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

    empty.className = "day empty";

    calendar.appendChild(empty);

  }

  for(let day=1;day<=lastDate;day++){

    const dateKey =
      `${year}-${month+1}-${day}`;

    const dayDiv =
      document.createElement("div");

    dayDiv.className = "day";

    dayDiv.innerHTML =
      `<div class="date">${day}</div>`;

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

}

/* モーダル */

function openModal(date){

  selectedDay = date;

  document.getElementById("selectedDate")
    .innerText =
      `${date} の予定`;

  document.getElementById("modal")
    .style.display = "flex";

  renderDayEvents();

}

function closeModal(){

  document.getElementById("modal")
    .style.display = "none";

}

/* group */

function createGroupId(){

  return "group_" + Date.now();

}

/* 追加 */

function addEvent(
  date,
  name,
  schedule,
  time,
  repeat,
  groupId
){

  if(!events[date]){

    events[date] = [];

  }

  events[date].push({

    name,
    schedule,
    time,
    repeat,
    groupId

  });

}

/* 保存 */

function saveEvent(){

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

  const groupId =
    createGroupId();

  addEvent(
    selectedDay,
    name,
    schedule,
    time,
    repeat,
    groupId
  );

  if(repeat !== "none"){

    createRepeatEvents(
      selectedDay,
      name,
      schedule,
      time,
      repeat,
      groupId
    );

  }

  saveLocal();

  renderCalendar();

  renderDayEvents();

}

/* 繰り返し */

function createRepeatEvents(
  startDate,
  name,
  schedule,
  time,
  repeat,
  groupId
){

  let base =
    new Date(startDate);

  for(let i=1;i<=12;i++){

    let next =
      new Date(base);

    if(repeat==="daily"){

      next.setDate(base.getDate()+i);

    }

    if(repeat==="weekly"){

      next.setDate(base.getDate()+(7*i));

    }

    if(repeat==="monthly"){

      next.setMonth(base.getMonth()+i);

    }

    const y =
      next.getFullYear();

    const m =
      next.getMonth()+1;

    const d =
      next.getDate();

    const key =
      `${y}-${m}-${d}`;

    addEvent(
      key,
      name,
      schedule,
      time,
      repeat,
      groupId
    );

  }

}

/* 個別削除 */

function deleteEvent(index){

  events[selectedDay]
    .splice(index,1);

  if(events[selectedDay].length===0){

    delete events[selectedDay];

  }

  saveLocal();

  renderCalendar();

  renderDayEvents();

}

/* 修正版：未来分だけ削除 */

function deleteRepeatEvents(
  groupId,
  fromDate
){

  if(
    !confirm(
      "この日以降の繰り返し予定を削除しますか？"
    )
  ){

    return;

  }

  const start =
    new Date(fromDate);

  for(const date in events){

    const targetDate =
      new Date(date);

    if(targetDate >= start){

      events[date] =
        events[date].filter(ev=>

          ev.groupId !== groupId

        );

      if(events[date].length===0){

        delete events[date];

      }

    }

  }

  saveLocal();

  renderCalendar();

  renderDayEvents();

}

/* 当日 */

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
    .forEach((ev,index)=>{

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

      const deleteBtn =
        document.createElement("button");

      deleteBtn.className =
        "delete-btn";

      deleteBtn.innerText =
        "削除";

      deleteBtn.onclick = ()=>{

        deleteEvent(index);

      };

      group.appendChild(deleteBtn);

      if(ev.repeat !== "none"){

        const repeatBtn =
          document.createElement("button");

        repeatBtn.className =
          "repeat-delete-btn";

        repeatBtn.innerText =
          "以降削除";

        repeatBtn.onclick = ()=>{

          deleteRepeatEvents(
            ev.groupId,
            selectedDay
          );

        };

        group.appendChild(repeatBtn);

      }

      div.appendChild(group);

      dayEvents.appendChild(div);

    });

}

/* 月変更 */

function changeMonth(num){

  currentDate.setMonth(
    currentDate.getMonth()+num
  );

  renderCalendar();

}

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

renderCalendar();
