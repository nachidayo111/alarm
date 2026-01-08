// Service Worker 登録
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

// 通知許可
Notification.requestPermission();

let reminders = JSON.parse(localStorage.getItem("reminders") || "[]");
render();
// ページ読み込み時に既存の予定を再スケジュール
reminders.forEach(schedule);

// 予定追加
function addReminder() {
  const title = document.getElementById("title").value;
  const time = new Date(document.getElementById("datetime").value);
  const repeat = document.getElementById("repeat").value;

  if (!title || !time) return alert("入力してください");

  const offsets = [];
  if (before10.checked) offsets.push(-10);
  if (before5.checked) offsets.push(-5);
  offsets.push(0);

  const reminder = {
    id: Date.now(),
    title,
    time: time.getTime(),
    repeat,
    offsets
  };

  reminders.push(reminder);
  localStorage.setItem("reminders", JSON.stringify(reminders));
  schedule(reminder);
  render();
}

// 通知予約
function schedule(rem) {
  navigator.serviceWorker.ready.then(reg => {
    rem.offsets.forEach(min => {
      const notifyTime = rem.time + min * 60000;
      const delay = notifyTime - Date.now();
      if (delay < 0) return;

      setTimeout(() => {
        const title = min === 0 ? rem.title : `${Math.abs(min)}分前：${rem.title}`;
        if (reg && typeof reg.showNotification === "function") {
          reg.showNotification(title, {
            body: title,
            icon: "icon.png"
          });
        } else if (window.Notification && Notification.permission === "granted") {
          new Notification(title, { body: title, icon: "icon.png" });
        }

        // 繰り返しの再スケジュール（クライアント側で行う）
        if (rem.repeat === "daily") {
          rem.time = rem.time + 86400000;
          localStorage.setItem("reminders", JSON.stringify(reminders));
          schedule(rem);
        }
        if (rem.repeat === "weekly") {
          rem.time = rem.time + 604800000;
          localStorage.setItem("reminders", JSON.stringify(reminders));
          schedule(rem);
        }
      }, delay);
    });
  });
}

// 一覧表示
function render() {
  const ul = document.getElementById("list");
  ul.innerHTML = "";

  reminders.forEach(r => {
    const li = document.createElement("li");
    li.textContent =
      r.title + " - " + new Date(r.time).toLocaleString();
    ul.appendChild(li);
  });
}
