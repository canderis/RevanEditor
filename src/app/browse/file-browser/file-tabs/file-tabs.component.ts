import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { KotorFileNode, LotorService } from "../../../lotor/lotor.service";
import { KotorFile } from "../../../lotor/file-types/archive";
import { TPCLoader, TPCTexture } from "../../../lotor/file-types/tpc";
import { writeTGA } from "../../../lotor/file-types/tga";

@Component({
	selector: "app-file-tabs",
	templateUrl: "./file-tabs.component.html",
	styleUrls: ["./file-tabs.component.scss"]
})
export class FileTabsComponent implements OnInit {

	selectedFile: KotorFile;
	img: TPCTexture = null;

	constructor(public lotorService: LotorService) {}

	ngOnInit() {}

	select(node: KotorFile) {

	}
	async extractTga() {

		const remote = require("electron").remote;
		const dialog = remote.dialog;
		const fs = require("fs");

		const fileNames = await dialog.showSaveDialog({
			defaultPath: `${this.selectedFile.fileName.substr(0, this.selectedFile.fileName.length - 3)}tga`
		});

		if (!fileNames) {
			return false;
		}

		writeTGA(this.img.image, fileNames.filePath, {
			pixel_size: this.img.pixelDepth
		});
	}

	async extract() {
		console.log(this.selectedFile);

		const remote = require("electron").remote;
		const dialog = remote.dialog;
		const fs = require("fs");

		const fileNames = await dialog.showSaveDialog({
			defaultPath: this.selectedFile.fileName
		});

		if (!fileNames) {
			return false;
		}

		const buffer = this.selectedFile.extract();

		if (this.selectedFile.fileExtension === "tpc" && this.img) {
			// const tpcLoader = new TPCLoader();
			// console.log(buffer);
			// const f = tpcLoader.load(
			// 	buffer,
			// 	texture => {
			// 		console.log(texture);
					writeTGA(this.img.image, fileNames.filePath, {
						pixel_size: this.img.pixelDepth
					});
			// 	},
			// 	error => {
			// 		console.log(error);
			// 	}
			// );
			// console.log(f);
		} else {
			fs.writeFileSync(fileNames.filePath, buffer);
		}
	}
}
