import { Component, OnInit, Input } from "@angular/core";
import { KotorFile } from "../../../../../lotor/file-types/kotor-file";

@Component({
	selector: "app-text-editor",
	templateUrl: "./text-editor.component.html",
	styleUrls: ["./text-editor.component.scss"]
})
export class TextEditorComponent implements OnInit {
	_file: KotorFile;
	@Input() set file(file: KotorFile) {
		this._file = file;

		// const buffer = this._file.extract();
		// this.text = buffer.toString();
	}

	text: string = "";
	constructor() {}

	ngOnInit() {}
}
