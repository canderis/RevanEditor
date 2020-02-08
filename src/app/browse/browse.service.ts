import { Injectable, ApplicationRef } from "@angular/core";
import { FileNode, isArchiveNode, ArchiveNode } from "../lotor/kotor-types";
import { KotorFile } from "../lotor/file-types/kotor-file";
import { writeFileSync, readFileSync } from "fs";
import { remote } from 'electron';
import * as path from 'path';
import { kotorFileFactory } from "../lotor/file-types/kotor-file-factory";

const dialog = remote.dialog;
let ipcRenderer = require('electron').ipcRenderer;

@Injectable({
	providedIn: "root"
})
export class BrowseService {
	selectedFile: KotorFile;
	openTabs: KotorFile[] = [];

	tabHistory: KotorFile[] = [];

	prefFile: FileNode = {
		fileName: 'Preferences',
		fileExtension: 'pref',
	}

	constructor(private ref: ApplicationRef) {
		ipcRenderer.on('open', (event, arg) => {
			console.log('open');
			dialog.showOpenDialog( {
				properties: ['openFile']
			}).then(selection => {
				selection.filePaths.forEach( filepath => {
					const buffer = readFileSync(filepath);
					const filetype = path.extname(filepath).substring(1);
					const filename = path.basename(filepath);
					this.openFile(kotorFileFactory(filename, filetype, buffer));
					this.ref.tick();
				})
			})
		});
		ipcRenderer.on('save', async (event, arg) => {
			console.log('save-as');
		});

		ipcRenderer.on('save-as', async (event, arg) => {
			const file = this.selectedFile;
			const buffer = await file.save();

			dialog.showSaveDialog({
				defaultPath: `${file.fileName.substr(0, file.fileName.length - 3)}${file.fileExtension}`
			}).then(saveResult => {
				if(!saveResult.canceled) {
					writeFileSync(saveResult.filePath, buffer);
				}
			});
		});
		ipcRenderer.on('nav-prefs', (event, arg) => {
			console.log('nav-prefs');
			this.selectFile(this.prefFile);
			this.ref.tick();
		});

	}

	openFile(file: KotorFile) {
		this.selectedFile = file;
		if (!this.openTabs.includes(this.selectedFile)) {
			this.openTabs.unshift(this.selectedFile);
		}

		this.tabHistory.unshift(this.selectedFile);
	}

	selectFile(file: FileNode) {
		if (isArchiveNode(file)) {
			this.openFile((file as ArchiveNode).extract());
		}
	}

	closeTab(i: number) {
		const f = this.openTabs[i];

		this.openTabs.splice(i, 1);
		this.tabHistory = this.tabHistory.filter(file => file !== f);

		if (this.selectedFile === f) {
			if (this.tabHistory.length > 0) {
				this.selectFile(this.tabHistory[0]);
				this.tabHistory.splice(0, 1);
			}
			else {
				this.selectedFile = null;
			}
		}
	}

}
