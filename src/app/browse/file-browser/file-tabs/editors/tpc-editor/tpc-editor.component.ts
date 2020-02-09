import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from "@angular/core";

import { KotorFile } from "../../../../../lotor/file-types/kotor-file";
import { TPC } from "../../../../../lotor/file-types/tpc";


@Component({
	selector: "app-tpc-editor",
	templateUrl: "./tpc-editor.component.html",
	styleUrls: ["./tpc-editor.component.scss"]
})
export class TpcEditorComponent implements OnInit, AfterViewInit {
	_file: TPC;
	@ViewChild("previewArea", { static: false }) previewArea: ElementRef;

	@Input() set file(file: TPC) {
		this._file = file;

		console.log(this._file);
		file.open();
		this.previewArea?.nativeElement.removeChild(this.previewArea.nativeElement.firstChild);
		this.previewArea?.nativeElement.appendChild(this.file.texture.image);

		// const buffer = this._file.extract();
		// if (this._file.fileExtension === "tpc") {
		// 	const tpcLoader = new TPCLoader();
		// 	console.log(buffer);
		// 	setTimeout( () => {
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

		// 	}, 10)

		// }
	};

	get file() {
		return this._file;
	}

	constructor() {}

	ngOnInit() {}

	ngAfterViewInit() {
		if(this.file.texture) {
			this.previewArea.nativeElement.appendChild(this.file.texture.image);
		}
	}
}
