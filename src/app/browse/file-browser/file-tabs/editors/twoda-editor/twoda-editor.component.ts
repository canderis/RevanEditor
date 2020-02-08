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

const ipcRenderer = require("electron").ipcRenderer;

@Component({
	selector: "app-twoda-editor",
	templateUrl: "./twoda-editor.component.html",
	styleUrls: ["./twoda-editor.component.scss"]
})
export class TwodaEditorComponent implements OnInit, AfterViewInit {
	@ViewChild("table", { static: false }) table: ElementRef;

	viewInit = false;
	view: any;

	_file: Twoda;
	@Input() set file(file: Twoda) {
		this._file = file;

		if (this.viewInit) {
			this.open();
		}
	}

	get file() {
		return this._file;
	}

	constructor() {
		ipcRenderer.on("undo", (event, arg) => {
			console.log("undo");
		});
	}

	ngOnInit() {}

	open() {
		this._file.open();
		this.view?.destroy();
		console.log("loading");

		setTimeout(() => {
			this.view = jexcel(this.table.nativeElement, {
				data: this._file.data,
				columns: this._file.columns,
				allowExport: false,
				columnSorting: false,
				columnDrag: false,
				columnResize: true,
				rowResize: false,
				rowDrag: false,
				allowInsertRow: true,
				allowManualInsertRow: true,
				allowInsertColumn: false,
				allowManualInsertColumn: false,
				allowDeleteRow: true,
				allowDeletingAllRows: false,
				allowDeleteColumn: false,
				allowRenameColumn: false,
				// lazyLoading:true,
				loadingSpin: true,
				// fullscreen:true,
				onafterchanges: this.fileChanged.bind(this),
				ondeleterow: this.onDeleteRow.bind(this),
				oninsertrow: this.onInsertRow.bind(this)
			});
			console.log(this.view);
		}, 10);
	}

	ngAfterViewInit(): void {
		if (this.file) {
			this.open();
		}
		this.viewInit = true;
	}

	fileChanged(el: any, records: JExcelChangedRecord[]) {
		console.log("File Changed", records, el);
		records.forEach(record =>
			this.file.changeRow(record.row, record.col, record.newValue)
		);
	}

	onDeleteRow(el: any, row: number, deleted: number) {
		this.file.data.splice(row, deleted);
	}

	onInsertRow(el: any, row: number, inserted: number) {
		const blank: any = {};
		this.file.labels.forEach(label => (blank[label] = ""));
		// console.log(blank, Array(inserted), Array(inserted).map(e => ({...blank})));

		console.log(Array(inserted).map(e => "hello"));
		this.file.data.splice(
			row,
			0,
			...Array.from(Array(inserted)).fill({ ...blank })
		);
		console.log(this.file);
	}
}

interface JExcelChangedRecord {
	x: number;
	y: number;
	col: number;
	row: number;
	newValue: string;
	oldValue: string;
}
