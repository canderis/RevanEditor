import { Component, ViewChild, ElementRef } from "@angular/core";

import { of as observableOf } from "rxjs";
import { FlatTreeControl } from "@angular/cdk/tree";
import { LotorService, KotorFileNode } from "../../lotor/lotor.service";
import { PreferenceService } from "../../shared/services/preference.service";
import { Game } from "../../lotor/game";
import { TPCLoader, TPCTexture } from "../../lotor/file-types/tpc";
import { KotorFile } from "../../lotor/file-types/archive";
import { writeTGA } from "../../lotor/file-types/tga";


@Component({
	selector: "file-browser",
	templateUrl: "./file-browser.component.html",
	styleUrls: ["./file-browser.component.scss"]
})
export class FileBrowserComponent {
	img: TPCTexture = null;

	game: KotorFileNode[] = [];

	selectedGame: KotorFileNode = null;

	sidebarSelected = 'k1';

	@ViewChild("previewArea", { static: false }) previewArea: ElementRef;

	constructor(
		private lotorService: LotorService,
		private preferenceService: PreferenceService
	) {
		preferenceService.getPreferences().subscribe(pref => {
			pref.directories.forEach(directory => lotorService.openDir(directory));
			this.loadGameTree();
		});
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
	}

	// select(node: FlatTreeNode) {
	// 	this.selectedFile = node;

	// 	const buffer = this.selectedFile.file.extract();
	// 	if (this.selectedFile.file.fileExtension === "tpc") {
	// 		const tpcLoader = new TPCLoader();
	// 		console.log(buffer);
	// 		const f = tpcLoader.load(
	// 			buffer,
	// 			texture => {
	// 				console.log(texture, this.previewArea, this.img);
	// 				if (this.img) {
	// 					this.previewArea.nativeElement.removeChild(this.img.image);
	// 				}

	// 				this.previewArea.nativeElement.appendChild(texture.image);

	// 				this.img = texture;

	// 				// writeTGA(texture.image, fileNames.filePath, { pixel_size: texture.pixelDepth });
	// 			},
	// 			error => {
	// 				console.log(error);
	// 			}
	// 		);
	// 		console.log(f);
	// 	}
	// 	console.log("select", node);
	// }

	// async extractTga() {

	// 	const remote = require("electron").remote;
	// 	const dialog = remote.dialog;
	// 	const fs = require("fs");

	// 	const fileNames = await dialog.showSaveDialog({
	// 		defaultPath: `${this.selectedFile.name.substr(0, this.selectedFile.name.length - 3)}tga`
	// 	});

	// 	if (!fileNames) {
	// 		return false;
	// 	}

	// 	writeTGA(this.img.image, fileNames.filePath, {
	// 		pixel_size: this.img.pixelDepth
	// 	});
	// }

	// async extract() {
	// 	console.log(this.selectedFile);

	// 	const remote = require("electron").remote;
	// 	const dialog = remote.dialog;
	// 	const fs = require("fs");

	// 	const fileNames = await dialog.showSaveDialog({
	// 		defaultPath: this.selectedFile.name
	// 	});

	// 	if (!fileNames) {
	// 		return false;
	// 	}

	// 	const buffer = this.selectedFile.file.extract();

	// 	// if (this.selectedFile.file.fileExtension === "tpc" && this.img) {
	// 	// 	// const tpcLoader = new TPCLoader();
	// 	// 	// console.log(buffer);
	// 	// 	// const f = tpcLoader.load(
	// 	// 	// 	buffer,
	// 	// 	// 	texture => {
	// 	// 	// 		console.log(texture);
	// 	// 			writeTGA(this.img.image, fileNames.filePath, {
	// 	// 				pixel_size: this.img.pixelDepth
	// 	// 			});
	// 	// 	// 	},
	// 	// 	// 	error => {
	// 	// 	// 		console.log(error);
	// 	// 	// 	}
	// 	// 	// );
	// 	// 	// console.log(f);
	// 	// } else {
	// 		fs.writeFileSync(fileNames.filePath, buffer);
	// 	// }
	// }

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
