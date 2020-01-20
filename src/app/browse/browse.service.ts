import { Injectable } from "@angular/core";
import { KotorFile } from "../lotor/file-types/archive";
import { KotorFileNode } from "../lotor/lotor.service";
let ipcRenderer = require('electron').ipcRenderer;

@Injectable({
	providedIn: "root"
})
export class BrowseService {
	selectedFile: KotorFile;
	openTabs: KotorFile[] = [];

	tabHistory: KotorFile[] = [];

	constructor() {
		ipcRenderer.on('open', (event, arg) => {
			console.log('open');
		});
		ipcRenderer.on('save', (event, arg) => {
			console.log('save');
		});
		ipcRenderer.on('save-as', (event, arg) => {
			console.log('save-as');
        });
	}

	isKotorFileNode(object: any): object is KotorFileNode {
		return 'files' in object;
	}


	selectFile(file: KotorFile | KotorFileNode) {
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
