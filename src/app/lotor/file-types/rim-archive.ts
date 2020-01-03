import * as fs from 'fs';
import * as path from 'path';
import { FileExtensions } from '../file-extensions';
import { Archive } from './archive';
import { RimFile } from './rim-file';


interface RimHeader {
	type: string;
	version_string: string;
	entry_count: number;
	offset_to_key_list: number;
	offset_to_resource_list: number;
}
interface RimKey {
	fileName: string;
	// res_id: number;
	fileExtension: string;
}

export class RimArchive extends Archive {
	static sizes = {
		header: 44,
		key: 32,
		resource: 8,
	};

	fileExtension = 'rim';

	header: RimHeader;

	fd: number;
	files: RimFile[];

	constructor(public fileName: string, private archivePath: string, private game: 'KOTOR' | 'TSL') {
		super();

		this.readHeader();
		this.parseFileList();
	}

	open() {
		// already opened, nothing to do
		if (this.fd) {
			return false;
		}

		this.fd = fs.openSync(this.archivePath, 'r');
		// this call opened the file, indicate that by returning true
		return true;
	}
	close(opened = true) {
		// if false value given, caller did not actually open
		if (!opened) {
			return false;
		}
		fs.closeSync(this.fd);
		this.fd = null;
	}

	load() {
		const opened = this.open();

		this.readHeader();
		// if (this.header.language_count) {
		// 	this.readStrings();
		// }
		this.parseFileList();

		this.close(opened);
	}
	readHeader() {
		const opened = this.open();

		const buffer = Buffer.alloc(RimArchive.sizes.header);
		fs.readSync(this.fd, buffer, 0, RimArchive.sizes.header, 0);

		this.header = {
			type: buffer.toString('utf-8', 0, 4).trim().toLowerCase(),
			version_string: buffer.toString('utf-8', 4, 8).trim().toLowerCase(),
			entry_count: buffer.readUInt32LE(12),
			offset_to_resource_list: buffer.readUInt32LE(16),
			offset_to_key_list: 120
		};

		this.close(opened);
	}
	// readStrings() {
	// 	const opened = this.open();

	// 	const buffer = Buffer.alloc(this.header.localized_string_size);

	// 	fs.readSync(
	// 		this.fd, buffer, 0,
	// 		this.header.entry_count * (RimArchive.sizes.key + RimArchive.sizes.resource),
	// 		this.header.offset_to_key_list
	// 	);


	// 	// read a string
	// 	let lang_id = buffer.readUInt32LE(0);
	// 	let feminine = false;
	// 	if (lang_id % 2) {
	// 		feminine = true;
	// 		lang_id -= 1;
	// 	}
	// 	lang_id /= 2;
	// 	// TODO select an encoding based on language ID
	// 	// let str_size = buf.readUInt32LE(4, 8);
	// 	// let s = buf.slice(8, 8 + str_size);
	// 	// if (s.charCodeAt(s.length - 1) === 0) {
	// 	// 	s = s.slice(0, -1);
	// 	// }

	// 	this.close(opened);
	// }
	parseFileList() {
		const opened = this.open();

		this.files = [];

		if (!this.header.entry_count) {
			return;
		}
		const buffer = Buffer.alloc(this.header.entry_count * (RimArchive.sizes.key + RimArchive.sizes.resource));
		fs.readSync(
			this.fd, buffer, 0,
			this.header.entry_count * (RimArchive.sizes.key + RimArchive.sizes.resource),
			this.header.offset_to_key_list
		);

		this.files = [];
		for (let i = 0; i < this.header.entry_count; i++) {
			const keypos = i * RimArchive.sizes.key;

			const fileName = buffer.toString('utf-8', keypos, keypos + 16).replace(/\0+$/, '');
			// const res_id = buffer.readUInt32LE(keypos + 20);

			const key: RimKey = {
				fileName,
				// res_id,
				fileExtension: FileExtensions[`${buffer.readUInt16LE(keypos + 16)}`]
			};

			// const respos = this.header.entry_count * RimArchive.sizes.key + (i * RimArchive.sizes.resource);

			const res = new RimFile(
				`${key.fileName}.${key.fileExtension}`,
				key.fileExtension,
				buffer.readUInt32LE(keypos + 24),
				buffer.readUInt32LE(keypos + 28),
			);
			res.archive = this;

			this.files.push(res);
		}

		this.close(opened);
	}
}
