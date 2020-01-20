import {
	Component,
	OnInit,
	Input,
	ElementRef,
	ViewChild,
	AfterViewInit
} from "@angular/core";
import { KotorFile } from "../../../../../lotor/file-types/archive";
const jexcel = require("jexcel");

@Component({
	selector: "app-twoda-editor",
	templateUrl: "./twoda-editor.component.html",
	styleUrls: ["./twoda-editor.component.scss"]
})
export class TwodaEditorComponent implements OnInit, AfterViewInit {
	@ViewChild("table", { static: false }) table: ElementRef;

	view: any;
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

		this.columns = labels.map(label => {
			return {
				type: "text",
				title: label,
				width: 100
			};
		});

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
		const out = [];
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

		// if(this.view) {
		// 	this.view = jexcel(this.table.nativeElement, {
		// 		data: this.data,
		// 		columns: this.columns
		// 	})
		// }
		// console.log(out);
	}
	constructor() {}

	ngOnInit() {}

	ngAfterViewInit(): void {
		this.view = jexcel(this.table.nativeElement, {
			data: this.data,
			columns: this.columns
		});

		console.log(this.view);
	}

	async save() {

		const remote = require("electron").remote;
		const dialog = remote.dialog;
		const fs = require("fs");


		const labels = this.view.getHeaders(true);
		const rows = this.view.options.data.map( (row: any) => {
			const r: any = {};
			for ( let i = 0; i < labels.length; i++) {
				r[labels[i]] = row[i];
			}

			return r;
		});

		const indices = Array.from(Array(rows.length).keys());

		console.log(rows, labels, indices);

		const BINARY_PROLOGUE = '2DA V2.b';

		let preamble_size =
			(BINARY_PROLOGUE + "\n").length +
			labels.join("\t").length +
			1 + // trailing \t
			1 + // null pad
			4 + // numRows
			//([...twoDA.rows.keys()].join('\t')).length + // row indices
			indices.join("\t").length + // row indices
			1 + // trailing \t
			2 * (rows.length * labels.length) + // offsets
			2; // 2x null pad
		console.log("preamble size: " + preamble_size);
		let value_pos = 0;
		let value_hash: any = {};
		for (let row of rows) {


			for (let index of labels) {

				console.log(index)
				let val = row[index] === "****" ? "" : row[index];
				if (value_hash[val] !== undefined) {
					continue;
				}
				console.log(val);
				value_hash[val] = value_pos;
				value_pos += val.length;
				value_pos += 1; // null pad
			}
		}
		console.log("empty element offset: " + value_hash[""]);
		console.log("data size: " + value_pos);
		let buf = new Buffer(preamble_size + value_pos);
		let buf_pos = 0;
		// prologue
		buf.write(BINARY_PROLOGUE + "\n", buf_pos);
		buf_pos += (BINARY_PROLOGUE + "\n").length;
		// labels
		buf.write(labels.join("\t") + "\t\0", buf_pos);
		buf_pos +=
			labels.join("\t").length +
			1 + // trailing \t
			1; // null pad
		// numRows
		buf.writeUInt32LE(rows.length, buf_pos);
		buf_pos += 4;
		// row indices
		//buf.write([...twoDA.rows.keys()].join('\t') + '\t', buf_pos);
		buf.write(indices.join("\t") + "\t", buf_pos);
		buf_pos +=
			[...rows.keys()].join("\t").length + 1; // trailing \t
		// offsets
		for (let row of rows) {
			//console.log(row);
			for (let index of labels) {
				let val = row[index] === "****" ? "" : row[index];
				buf.writeUInt16LE(value_hash[val], buf_pos);
				buf_pos += 2;
			}
		}
		buf.write("\0\0", buf_pos);
		buf_pos += 2;
		// values
		let values = Object.keys(value_hash);
		values.sort((a, b) => {
			return value_hash[a] - value_hash[b];
		});
		//console.log(values);
		buf.write(values.join("\0") + "\0", buf_pos);

		const fileNames = await dialog.showSaveDialog({
			defaultPath: `${this._file.fileName.substr(0, this._file.fileName.length - 3)}2da`
		});

		fs.writeFileSync(fileNames.filePath, buf);

		// const buffer = this._file.extract();
		// const format = buffer.toString("utf-8", 0, 8);
		// console.log(format);

		// const startOfHeaders = ("2DA V2.b" + "\n").length;
		// const endOfHeaders = buffer.indexOf("\x00", startOfHeaders);
		// const labels = buffer
		// 	.slice(startOfHeaders, endOfHeaders)
		// 	.toString()
		// 	.split(/\s/)
		// 	.filter(Boolean);

		// this.columns = labels.map (label => {
		// 	return {
		// 		type: 'text',
		// 		title: label,
		// 		width: 100
		// 	}
		// })

		// let position = endOfHeaders + 1;

		// const rowCt = buffer.readUInt32LE(position);
		// // console.log(labels, rowCt);

		// position += 4;

		// for (let i = 0; i < rowCt; i++) {
		// 	let jump = buffer.indexOf("\t", position);
		// 	if (jump !== -1) {
		// 		//console.log('jump ' + jump);
		// 		position = jump + 1;
		// 	} else {
		// 		console.error(
		// 			"malformed 2da: missed tab at " + i + ", " + position
		// 		);
		// 		return;
		// 	}
		// }

		// const indices = buffer
		// 	.slice(endOfHeaders + 5, position - 1)
		// 	.toString()
		// 	.split(/\t/)
		// 	.filter(Boolean)
		// 	.map(Number);

		// const offsets = [];
		// let temp = [];
		// for (let i = 0; i < labels.length * rowCt; i++) {
		// 	temp.push(buffer.readUInt16LE(position));
		// 	if ((i + 1) % labels.length == 0) {
		// 		offsets.push(temp);
		// 		temp = [];
		// 	}
		// 	position += 2;
		// }

		// position += 2;

		// let max_offset = 0;
		// let end;
		// const out = []
		// for (let r in offsets) {
		// 	let rows = offsets[r];
		// 	let values: any = {};
		// 	for (let c in rows) {
		// 		let p = position + rows[c];
		// 		end = buffer.indexOf(0, p);
		// 		if (rows[c] > max_offset) {
		// 			max_offset = end - position;
		// 		}
		// 		if (end !== -1 && end > p) {
		// 			values[labels[c]] = buffer.slice(p, end).toString();
		// 		} else {
		// 			values[labels[c]] = "****";
		// 		}
		// 	}
		// 	out.push(values);
		// }

		// this.data = out;
	}
}
