import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from "@angular/core";
import { KotorFile } from "../../../../../lotor/file-types/archive";
const jexcel = require('jexcel');

@Component({
	selector: "app-twoda-editor",
	templateUrl: "./twoda-editor.component.html",
	styleUrls: ["./twoda-editor.component.scss"]
})
export class TwodaEditorComponent implements OnInit, AfterViewInit {
	@ViewChild("table", { static: false }) table: ElementRef;

	data: any;
	columns: any[];
	_file: KotorFile;
	@Input() set file(file: KotorFile) {
		this._file = file;

		const buffer = this._file.extract();
		const format = buffer.toString("utf-8", 0, 8);
		console.log(format);

		const startOfHeaders = ("2DA V2.b" + "\n").length;
		const endOfHeaders = buffer.indexOf("\x00", startOfHeaders);
		const labels = buffer
			.slice(startOfHeaders, endOfHeaders)
			.toString()
			.split(/\s/)
			.filter(Boolean);

		this.columns = labels.map (label => {
			return {
				type: 'text',
				title: label,
				width: 100
			}
		})

		let position = endOfHeaders + 1;

		const rowCt = buffer.readUInt32LE(position);
		// console.log(labels, rowCt);

		position += 4;

		for (let i = 0; i < rowCt; i++) {
			let jump = buffer.indexOf("\t", position);
			if (jump !== -1) {
				//console.log('jump ' + jump);
				position = jump + 1;
			} else {
				console.error(
					"malformed 2da: missed tab at " + i + ", " + position
				);
				return;
			}
		}

		const indices = buffer
			.slice(endOfHeaders + 5, position - 1)
			.toString()
			.split(/\t/)
			.filter(Boolean)
			.map(Number);

		const offsets = [];
		let temp = [];
		for (let i = 0; i < labels.length * rowCt; i++) {
			temp.push(buffer.readUInt16LE(position));
			if ((i + 1) % labels.length == 0) {
				offsets.push(temp);
				temp = [];
			}
			position += 2;
		}

		position += 2;

		let max_offset = 0;
		let end;
		const out = []
		for (let r in offsets) {
			let rows = offsets[r];
			let values: any = {};
			for (let c in rows) {
				let p = position + rows[c];
				end = buffer.indexOf(0, p);
				if (rows[c] > max_offset) {
					max_offset = end - position;
				}
				if (end !== -1 && end > p) {
					values[labels[c]] = buffer.slice(p, end).toString();
				} else {
					values[labels[c]] = "****";
				}
			}
			out.push(values);
		}

		this.data = out;

		// console.log(out);
	}
	constructor() {}

	ngOnInit() {}

	ngAfterViewInit(): void {
		console.log(this.table)
		jexcel(this.table.nativeElement, {
			data: this.data,
			columns: this.columns
		})
	}
}
