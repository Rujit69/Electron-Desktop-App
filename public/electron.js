const { app, BrowserWindow } = require("electron");
const url = require("url");
const path = require("path");
const { ipcMain } = require("electron");

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: "workFaster",
    width: 400,
    height: 430,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Path to preload script
      contextIsolation: true, // Keeps context isolated for security
      nodeIntegration: false, // Disables Node.js in the renderer (security best practice)
    },
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, "../build/index.html"),
    protocol: "file",
    slashes: true,
  });
  //   mainWindow.setWindowButtonVisibility(false);
  //   mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(startUrl);

  ipcMain.on("close-app", () => {
    app.quit();
  });
}

app.whenReady().then(createMainWindow);
