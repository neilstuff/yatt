'use strict';

const config = require('./config.json');

const electron = require('electron');
const { app, protocol } = require('electron');
const { ipcMain } = electron;

const BrowserWindow = electron.BrowserWindow;

const path = require('path')
const url = require('url')

var mainWindow = null;

app.allowRendererProcessReuse = true;

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1420,
        height: 900,
        resizable: true,
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            nativeWindowOpen: true,
            preload: path.join(__dirname, "preload.js")
        }
    })

    if (config.mode == "debug") {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.setMenu(null);
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.on('closed', () => {
        mainWindow = null
    })

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

ipcMain.on('quit', function(event, arg) {

    app.quit();

});

ipcMain.on('minimize', function(event, arg) {

    mainWindow.minimize();

});

ipcMain.on('isMaximized', function(event, arg) {

    event.returnValue = mainWindow.isMaximized();

});

ipcMain.on('maximize', function(event, arg) {

    mainWindow.maximize();

});

ipcMain.on('unmaximize', function(event, arg) {

    mainWindow.unmaximize();

});