// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const clipboardy = require("clipboardy");
const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 350,
    height: 200,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });.
  mainWindow.loadFile("index.html");

}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
   
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  mainWindow.webContents.on("did-finish-load", () => {
    let ytbPath = path.join(__dirname, "youtube-dl", "youtube-dl.exe");

    if (__dirname.includes("app.asar")) {
      ytbPath = path.join(
        __dirname.replace("app.asar", "app.asar.unpacked"),
        "youtube-dl",
        "youtube-dl.exe"
      );
    }

    ipcMain.on("clipboard", (e, value) => {
      const ytb = spawn(ytbPath, [
        "--extract-audio",
        "--audio-format",
        "mp3",
        value,
        "-o",
        `${process.env.USERPROFILE}\\Downloads\\%(title)s.%(ext)s`,
      ]);
      ytb.stdout.on("data", (data) => {
        let stringifyData = data.toString();
        if (stringifyData.includes("%")) {
          const regex = /([0-9.]+)%/;
          const progress = regex.exec(stringifyData)[1];
          mainWindow.webContents.send("progress", progress);
        }
      });
      ytb.stderr.on("data", (data) => {});
      ytb.on("error", (error) => {
        app.quit();
      });

      ytb.on("close", (code) => {
        app.quit();
      });
    });
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

