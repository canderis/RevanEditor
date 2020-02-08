import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { TPCLoader, TPCTexture } from "../../../../../lotor/file-types/tpc";
import { KotorFile } from "../../../../../lotor/kotor-types";

@Component({
	selector: "app-tpc-editor",
	templateUrl: "./tpc-editor.component.html",
	styleUrls: ["./tpc-editor.component.scss"]
})
export class TpcEditorComponent implements OnInit {
	_file: KotorFile;
	img: TPCTexture = null;
	@ViewChild("previewArea", { static: false }) previewArea: ElementRef;

	@Input() set file(file: KotorFile) {
		this._file = file;

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
	constructor() {}

	ngOnInit() {}
}
