import { Component } from "@angular/core";
import { LotorService, KotorFileNode } from "../../lotor/lotor.service";
import { PreferenceService } from "../../shared/services/preference.service";

@Component({
	selector: "file-browser",
	templateUrl: "./file-browser.component.html",
	styleUrls: ["./file-browser.component.scss"]
})
export class FileBrowserComponent {

	game: KotorFileNode[] = [];

	selectedGame: KotorFileNode = null;

	sidebarSelected = 'k1';

	constructor(
		private lotorService: LotorService,
		preferenceService: PreferenceService,
	) {

		preferenceService.directories.forEach(directory => lotorService.openDir(directory));
		this.loadGameTree();
	}

	loadGameTree() {
		this.game = [];
		if (this.sidebarSelected === 'k1') {
			this.game = [...this.lotorService.k1.values()].map(g => this.lotorService.getTree(g));
		}
		else if (this.sidebarSelected === 'k2') {
			this.game = [...this.lotorService.k2.values()].map(g => this.lotorService.getTree(g));
		}

		this.selectedGame = this.game[0];
		console.log(this.selectedGame);
	}

	selectView(v: string) {
		if (this.sidebarSelected === v) {
			this.sidebarSelected = '';
		}
		else {
			this.sidebarSelected = v;
		}

		this.loadGameTree();

	}
}
