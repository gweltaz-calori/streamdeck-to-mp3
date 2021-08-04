const { ipcRenderer } = require("electron");

let $progress = document.querySelector(".progress-text");
let $progressInner = document.querySelector(".progress-inner");

navigator.clipboard.readText().then((v) => {
  ipcRenderer.send("clipboard", v);
});

ipcRenderer.on("progress", (evt, value) => {
  $progress.textContent = value + "%";
  $progressInner.style.width = value + "%";
});

ipcRenderer.on("ev", (e, message) => {
  console.log(message);
});
