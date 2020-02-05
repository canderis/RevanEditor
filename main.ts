import { app, BrowserWindow, screen, Menu, remote } from "electron";
import * as path from "path";
import * as url from "url";

let win: BrowserWindow;
let serve: boolean;
const args = process.argv.slice(1);
serve = args.some(val => val === "--serve");

function createWindow() {
	const electronScreen = screen;
	const size = electronScreen.getPrimaryDisplay().workAreaSize;

	// Create the browser window.
	win = new BrowserWindow({
		x: 0,
		y: 0,
		width: size.width,
		height: size.height,
		webPreferences: {
			nodeIntegration: true
		}
	});

	if (serve) {
		require("electron-reload")(__dirname, {
			electron: require(`${__dirname}/node_modules/electron`)
		});
		win.loadURL("http://localhost:4200");
	} else {
		win.loadURL(
			url.format({
				pathname: path.join(__dirname, "dist/index.html"),
				protocol: "file:",
				slashes: true
			})
		);
	}

	if (serve) {
		win.webContents.openDevTools();
	}

	// Emitted when the window is closed.
	win.on("closed", () => {
		// Dereference the window object, usually you would store window
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});

	const isMac = process.platform === "darwin";

	const template = [
		// { role: 'appMenu' }
		...(isMac
			? [
					{
						label: "Menu",
						submenu: [
							{ role: "about" },
							{ type: "separator" },
							{
								label: "Preverences",
								click(item: any, focusedWindow: any) {
									win.webContents.send('nav-prefs');
								}
							},
							{ type: "separator" },
							{ role: "services" },
							{ type: "separator" },
							{ role: "hide" },
							{ role: "hideothers" },
							{ role: "unhide" },
							{ type: "separator" },
							{ role: "quit" }
						]
					}
			  ]
			: []),
		// { role: 'fileMenu' }
		{
			label: "File",
			submenu: [
				{
					label: "Open...",
					accelerator: "CommandOrControl+O",
					click(item: any, focusedWindow: any) {
						win.webContents.send('open');
					}
				},
				{
					label: "Save",
					accelerator: "CommandOrControl+S",
					click(item: any, focusedWindow: any) {
						win.webContents.send('save');
					}
				},
				{
					label: "Save As...",
					accelerator: "Shift+CommandOrControl+S",
					click(item: any, focusedWindow: any) {
						win.webContents.send('save-as');
					}
				},
				{ type: "separator" },
				isMac ? { role: "close" } : { role: "quit" },
			]
		},
		// { role: 'editMenu' }
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				...(isMac
					? [
							{ role: "pasteAndMatchStyle" },
							{ role: "delete" },
							{ role: "selectAll" },
							{ type: "separator" },
							{
								label: "Speech",
								submenu: [
									{ role: "startspeaking" },
									{ role: "stopspeaking" }
								]
							}
					  ]
					: [
							{ role: "delete" },
							{ type: "separator" },
							{ role: "selectAll" }
					  ])
			]
		},
		// { role: 'viewMenu' }
		{
			label: "View",
			submenu: [
				{ role: "reload" },
				{ role: "forcereload" },
				{ role: "toggledevtools" },
				{ type: "separator" },
				{ role: "resetzoom" },
				{ role: "zoomin" },
				{ role: "zoomout" },
				{ type: "separator" },
				{ role: "togglefullscreen" }
			]
		},
		// { role: 'windowMenu' }
		{
			label: "Window",
			submenu: [
				{ role: "minimize" },
				{ role: "zoom" },
				...(isMac
					? [
							{ type: "separator" },
							{ role: "front" },
							{ type: "separator" },
							{ role: "window" }
					  ]
					: [{ role: "close" }])
			]
		},
		{
			role: "help",
			submenu: [
				{
					label: "Learn More",
					click: async () => {
						const { shell } = require("electron");
						await shell.openExternal("https://electronjs.org");
					}
				}
			]
		}
	];

	const menu = Menu.buildFromTemplate(template as any);
	Menu.setApplicationMenu(menu);
}

try {
	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on("ready", createWindow);

	// Quit when all windows are closed.
	app.on("window-all-closed", () => {
		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== "darwin") {
			app.quit();
		}
	});

	app.on("activate", () => {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (win === null) {
			createWindow();
		}
	});
} catch (e) {
	// Catch Error
	// throw e;
}
