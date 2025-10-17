const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const activityForm = document.getElementById("activityForm");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const activityList = document.getElementById("activityList");
const deleteBtn = document.getElementById("deleteBtn");

const allDayInput = document.getElementById("allDay");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");
const timeInputsDiv = document.getElementById("timeInputs");
const reminderInput = document.getElementById("reminder");

let activities = [];
let selectedIndex = null;

// 📅 Huidige zichtbare maand
let currentDate = new Date();

// 📅 Kalender tekenen
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Titel boven kalender
  const monthNames = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december"
  ];
  monthYear.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = "<table><tr>";
  const days = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
  days.forEach(d => html += `<th>${d}</th>`);
  html += "</tr><tr>";

  // lege cellen voor eerste week
  for (let i = 0; i < firstDay; i++) {
    html += "<td></td>";
  }

  // dagen invullen
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Activiteiten op deze dag
    const dayActivities = activities.filter(act => act.date === dateStr);
    const hasActivity = dayActivities.length > 0;
    const activityClass = hasActivity ? "has-activity" : "";

    html += `<td data-date="${dateStr}" class="day ${activityClass}">
               ${day}
               ${dayActivities.length > 0 ? `<div class="activity-count">${dayActivities.length}</div>` : ""}
             </td>`;

    if ((day + firstDay) % 7 === 0) {
      html += "</tr><tr>";
    }
  }

  html += "</tr></table>";
  calendar.innerHTML = html;

  // Klik op dag = selecteer datum
  document.querySelectorAll(".day").forEach(cell => {
    cell.addEventListener("click", () => {
      dateInput.value = cell.dataset.date;
    });
  });
}

// ⏰ Toggle tijdvelden
allDayInput.addEventListener("change", () => {
  timeInputsDiv.style.display = allDayInput.checked ? "none" : "block";
});

// 🎯 Opslaan activiteit
activityForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const activity = {
    date: dateInput.value,
    description: descriptionInput.value,
    allDay: allDayInput.checked,
    startTime: allDayInput.checked ? null : startTimeInput.value,
    endTime: allDayInput.checked ? null : endTimeInput.value,
    reminder: reminderInput.value, // in minuten of "none"
    reminded: false
  };

  if (selectedIndex === null) {
    activities.push(activity);
  } else {
    activities[selectedIndex] = activity;
    selectedIndex = null;
  }

  activityForm.reset();
  allDayInput.checked = true;
  reminderInput.value = "none";
  timeInputsDiv.style.display = "none";
  renderActivities();
  renderCalendar();
});

// 🗑️ Verwijderen activiteit
deleteBtn.addEventListener("click", () => {
  if (selectedIndex !== null) {
    activities.splice(selectedIndex, 1);
    selectedIndex = null;
    activityForm.reset();
    allDayInput.checked = true;
    reminderInput.value = "none";
    timeInputsDiv.style.display = "none";
    renderActivities();
    renderCalendar();
  }
});

// 📋 Activiteitenlijst tonen
function renderActivities() {
  activityList.innerHTML = "";
  activities.forEach((act, index) => {
    const li = document.createElement("li");
    let timeText = act.allDay
      ? "Hele dag"
      : `${act.startTime || "??"} - ${act.endTime || "??"}`;
    let reminderText = act.reminder === "none" ? "" : ` [Herinnering: ${act.reminder} min voor]`;
    li.textContent = `${act.date} (${timeText}): ${act.description}${reminderText}`;

    li.addEventListener("click", () => {
      dateInput.value = act.date;
      descriptionInput.value = act.description;
      allDayInput.checked = act.allDay;
      reminderInput.value = act.reminder || "none";
      if (act.allDay) {
        timeInputsDiv.style.display = "none";
        startTimeInput.value = "";
        endTimeInput.value = "";
      } else {
        timeInputsDiv.style.display = "block";
        startTimeInput.value = act.startTime;
        endTimeInput.value = act.endTime;
      }
      selectedIndex = index;
    });

    activityList.appendChild(li);
  });
}

// 🔔 Reminder check
function checkReminders() {
  const now = new Date();
  activities.forEach(act => {
    if (act.reminder !== "none" && !act.reminded) {
      let eventDateTime;
      if (act.allDay) {
        eventDateTime = new Date(`${act.date}T09:00`); // standaard 9:00 voor hele dag
      } else {
        eventDateTime = new Date(`${act.date}T${act.startTime || "09:00"}`);
      }

      const reminderMinutes = parseInt(act.reminder, 10);
      const reminderTime = new Date(eventDateTime.getTime() - reminderMinutes * 60000);

      if (now >= reminderTime && now < eventDateTime) {
        alert(`Herinnering: ${act.description}\nDatum: ${act.date}\nTijd: ${act.allDay ? "Hele dag" : `${act.startTime} - ${act.endTime}`}`);
        act.reminded = true; // zodat het niet blijft poppen
      }
    }
  });
}

// Controleer reminders elke minuut
setInterval(checkReminders, 60000);

// 🔄 Navigatie maanden
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Start
renderActivities();
renderCalendar();
