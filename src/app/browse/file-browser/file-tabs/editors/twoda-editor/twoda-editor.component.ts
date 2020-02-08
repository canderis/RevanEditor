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

const ipcRenderer = require('electron').ipcRenderer;


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

	constructor() {
		ipcRenderer.on('undo', (event, arg) => {
			console.log('undo');
		});
	}

	ngOnInit() {}

	ngAfterViewInit(): void {
		this._file.open();

		this.view = jexcel(this.table.nativeElement, {
			data: this.file.data,
			columns: this.file.columns,
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
			onafterchanges: this.fileChanged.bind(this)
		});
	}

	fileChanged(el: any, records: JExcelChangedRecord[]) {
		console.log("File Changed", records, el);
		records.forEach(record =>
			this.file.changeRow(record.row, record.col, record.newValue)
		);
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
