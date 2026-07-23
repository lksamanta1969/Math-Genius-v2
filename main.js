const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1200,
    minHeight: 700,

    title: "Math Genius",

    icon: path.join(__dirname, "assets", "Math-Genius-logo-png.ico"),

    autoHideMenuBar: true,
    fullscreen: false,

    backgroundColor: "#020B2D",

    show: false,

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.center();

  win.once("ready-to-show", () => {
    win.show();
  });

  win.loadFile(
  path.join(__dirname, "resources", "app", "pages", "home.html")
);

  win.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription) => {
      console.error("Page failed:", errorCode, errorDescription);
    }
  );

  win.on("page-title-updated", (e) => {
    e.preventDefault();
  });

  win.setTitle("Math Genius");
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});