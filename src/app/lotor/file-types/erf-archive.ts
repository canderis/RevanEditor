import * as fs from 'fs';
import * as path from 'path';
import { FileExtensions } from '../file-extensions';
import { Archive } from './archive';
import { ErfFile } from './erf-file';


interface ErfHeader {
	type: string;
	version_string: string;
	language_count: number;
	localized_string_size: number;
	entry_count: number;
	offset_to_localized_string: number;
	offset_to_key_list: number;
	offset_to_resource_list: number;
	build_year: number;
	build_day: number;
	description_str_ref: number;
}
interface ErfKey {
	fileName: string;
	res_id: number;
	fileExtension: string;
}

export class ErfArchive extends Archive {
	static sizes = {
		header: 44,
		key: 24,
		resource: 8,
	};

	fileExtension = 'erf';

	header: ErfHeader;

	fd: number;
	files: ErfFile[];

	constructor(public fileName, private archivePath: string, private game: 'KOTOR' | 'TSL') {
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
		if (this.header.language_count) {
			this.readStrings();
		}
		this.parseFileList();

		this.close(opened);
	}
	readHeader() {
		const opened = this.open();

		const buffer = Buffer.alloc(ErfArchive.sizes.header);
		fs.readSync(this.fd, buffer, 0, ErfArchive.sizes.header, 0);

		this.header = {
			type: buffer.toString('utf-8', 0, 4).trim().toLowerCase(),
			version_string: buffer.toString('utf-8', 4, 8).trim().toLowerCase(),
			language_count: buffer.readUInt32LE(8),
			localized_string_size: buffer.readUInt32LE(12),
			entry_count: buffer.readUInt32LE(16),
			offset_to_localized_string: buffer.readUInt32LE(20),
			offset_to_key_list: buffer.readUInt32LE(24),
			offset_to_resource_list: buffer.readUInt32LE(28),
			build_year: buffer.readUInt32LE(32),
			build_day: buffer.readUInt32LE(36),
			description_str_ref: buffer.readUInt32LE(40),
		};

		this.close(opened);
	}
	readStrings() {
		const opened = this.open();

		const buffer = Buffer.alloc(this.header.localized_string_size);

		fs.readSync(
			this.fd, buffer, 0,
			this.header.entry_count * (ErfArchive.sizes.key + ErfArchive.sizes.resource),
			this.header.offset_to_key_list
		);


		// read a string
		let lang_id = buffer.readUInt32LE(0);
		let feminine = false;
		if (lang_id % 2) {
			feminine = true;
			lang_id -= 1;
		}
		lang_id /= 2;
		// TODO select an encoding based on language ID
		// let str_size = buf.readUInt32LE(4, 8);
		// let s = buf.slice(8, 8 + str_size);
		// if (s.charCodeAt(s.length - 1) === 0) {
		// 	s = s.slice(0, -1);
		// }

		this.close(opened);
	}
	parseFileList() {
		const opened = this.open();

		this.files = [];

		if (!this.header.entry_count) {
			return;
		}
		const buffer = Buffer.alloc(this.header.entry_count * (ErfArchive.sizes.key + ErfArchive.sizes.resource));
		fs.readSync(
			this.fd, buffer, 0,
			this.header.entry_count * (ErfArchive.sizes.key + ErfArchive.sizes.resource),
			this.header.offset_to_key_list
		);

		this.files = [];
		for (let i = 0; i < this.header.entry_count; i++) {
			const keypos = i * ErfArchive.sizes.key;

			const key: ErfKey = {
				fileName: buffer.toString('utf-8', keypos, keypos + 16).replace(/\0+$/, ''),
				res_id: buffer.readUInt32LE(keypos + 16),
				fileExtension: FileExtensions[buffer.readUInt16LE(keypos + 20)]
			};

			const respos = this.header.entry_count * ErfArchive.sizes.key + (i * ErfArchive.sizes.resource);

			const res = new ErfFile(
				key.fileName + '.' + key.fileExtension,
				key.fileExtension,
				buffer.readUInt32LE(respos),
				buffer.readUInt32LE(respos + 4),
			);
			res.archive = this;

			this.files.push(res);
		}

		this.close(opened);
	}

	// extract(savepath, filenathis = null) {

	// }
}
