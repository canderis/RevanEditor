import {
	Component,
	OnInit,
	Input,
	ElementRef,
	ViewChild,
	AfterViewInit
} from "@angular/core";
import { Twoda } from "../../../../../lotor/file-types/twoda";

const jexcel = require("jexcel");

@Component({
	selector: "app-twoda-editor",
	templateUrl: "./twoda-editor.component.html",
	styleUrls: ["./twoda-editor.component.scss"]
})
export class TwodaEditorComponent implements OnInit, AfterViewInit {
	@ViewChild("table", { static: false }) table: ElementRef;

	view: any;

	_file: Twoda;
	@Input() set file(file: Twoda) {
		this._file = file;
	}

	get file() {
		return this._file;
	}

	constructor() {}

	ngOnInit() {}

	ngAfterViewInit(): void {
		this._file.open();

		this.view = jexcel(this.table.nativeElement, {
			data: this.file.data,
			columns: this.file.columns
		});

		console.log(this.view);
	}
}
