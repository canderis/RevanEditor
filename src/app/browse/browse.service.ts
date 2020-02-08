import { Injectable, ApplicationRef } from "@angular/core";
import { FileNode } from "../lotor/file-types/archive";
import { KotorFileNode } from "../lotor/lotor.service";
let ipcRenderer = require('electron').ipcRenderer;

@Injectable({
	providedIn: "root"
})
export class BrowseService {
	selectedFile: FileNode;
	openTabs: FileNode[] = [];

	tabHistory: FileNode[] = [];

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

	isKotorFileNode(object: any): object is KotorFileNode {
		return 'files' in object;
	}


	selectFile(file: FileNode | KotorFileNode) {
		if (!this.isKotorFileNode(file)) {
			this.selectedFile = file;

			if (!this.openTabs.includes(file)) {
				this.openTabs.unshift(file);
			}

			this.tabHistory.unshift(file);
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
