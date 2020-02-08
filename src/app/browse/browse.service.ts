import { Injectable, ApplicationRef } from "@angular/core";
import { KotorFile, FileNode, isArchiveNode, ArchiveNode } from "../lotor/kotor-types";

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
		});
		ipcRenderer.on('save', (event, arg) => {
			console.log('save', this.selectedFile);
			this.selectedFile.save();
		});
		ipcRenderer.on('save-as', (event, arg) => {
			console.log('save-as');
		});
		ipcRenderer.on('nav-prefs', (event, arg) => {
			console.log('nav-prefs');
			this.selectFile(this.prefFile);
			this.ref.tick();
		});

	}

	selectFile(file: FileNode) {
		if (isArchiveNode(file)) {
			this.selectedFile = (file as ArchiveNode).extract();

			if (!this.openTabs.includes(this.selectedFile)) {
				this.openTabs.unshift(this.selectedFile);
			}

			this.tabHistory.unshift(this.selectedFile);
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
