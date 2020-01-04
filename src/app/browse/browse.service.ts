import { Injectable } from "@angular/core";
import { KotorFile } from "../lotor/file-types/archive";
import { TPCLoader } from "../lotor/file-types/tpc";
import { KotorFileNode } from "../lotor/lotor.service";

@Injectable({
	providedIn: "root"
})
export class BrowseService {
	selectedFile: KotorFile;
	openTabs: KotorFile[] = [];

	tabHistory: KotorFile[] = [];

	constructor() {}

	selectFile(file: KotorFile & KotorFileNode) {
		if (!file.files) {
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
		this.tabHistory.filter(file => file === f);

		if (this.selectedFile === f) {
			if (this.tabHistory.length > 0) {
				this.selectedFile = this.tabHistory[0];
			}
		}
	}

}
