'use strict';

const config = require('./config.json');

const electron = require('electron');
const { app, protocol } = require('electron');
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
            nodeIntegration: true
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