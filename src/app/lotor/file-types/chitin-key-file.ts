import { BifFile } from './bif-file';
import { BifArchive } from './bif-archive';
import * as fs from 'fs';

/*
	The chitin header gives information on how to parse the contents of the bif file.

	When read from a buffer, this is how to parse the information:
	number_of_bif_files: buffer.readUInt32LE(8),
	number_of_entries_in_chitin_key: buffer.readUInt32LE(12),
	offset_to_table_of_files: buffer.readUInt32LE(16),
	offset_to_table_of_keys: buffer.readUInt32LE(20),
	build_year: buffer.readUInt32LE(24),
	build_day: buffer.readUInt32LE(28),
	header_length: 60
*/

export class Chitin {
	_directory: string;

	__HEADER_LENGTH__ = 60;

	number_of_bif_files: number;
	number_of_entries_in_chitin_key: number;
	offset_to_table_of_files: number;
	offset_to_table_of_keys: number;
	build_year: number;
	build_day: number;

	fileTable: BifArchive[];

	constructor(directory: string, fd: number) {
		this._directory = directory;

		this.readChitinHeader(fd);
	}

	readChitinHeader(fd: number) {
		const buffer = Buffer.alloc(this.__HEADER_LENGTH__);
		fs.readSync(fd, buffer, 0, this.__HEADER_LENGTH__, 0);

		this.number_of_bif_files = buffer.readUInt32LE(8);
		this.number_of_entries_in_chitin_key = buffer.readUInt32LE(12);
		this.offset_to_table_of_files = buffer.readUInt32LE(16);
		this.offset_to_table_of_keys = buffer.readUInt32LE(20);
		this.build_year = buffer.readUInt32LE(24);
		this.build_day = buffer.readUInt32LE(28);
	}

	getBifArchives(fd: number) {
		if (!this.fileTable) {
			this.parseBifArchives(fd);
		}
		return this.fileTable;
	}
	parseBifArchives(fd: number) {
		this.fileTable = [];
		for (let i = 0; i < this.number_of_bif_files; i++) {
			const buffer = Buffer.alloc(12);
			fs.readSync(
				fd,
				buffer,
				0,
				12,
				this.offset_to_table_of_files + i * 12
			);

			const size_of_file = buffer.readUInt32LE(0);
			const offset_into_filename_table_for_filename = buffer.readUInt32LE(
				4
			);
			const length_of_filename = buffer.readUInt16LE(8);
			const bif_drive = buffer.readUInt16LE(10);

			const filenameBuffer = Buffer.alloc(length_of_filename);

			fs.readSync(
				fd,
				filenameBuffer,
				0,
				length_of_filename,
				offset_into_filename_table_for_filename
			);

			const bif_filename = filenameBuffer.toString();

			this.fileTable.push(
				new BifArchive(
					size_of_file,
					offset_into_filename_table_for_filename,
					length_of_filename,
					bif_drive,
					bif_filename,
					this._directory
				)
			);
		}
		this.parseTableOfKeys(fd);
	}

	parseTableOfKeys(fd: number) {
		for (let i = 0; i < this.number_of_entries_in_chitin_key; i++) {
			const buffer = Buffer.alloc(22);
			fs.readSync(
				fd,
				buffer,
				0,
				22,
				this.offset_to_table_of_keys + i * 22
			);
			const resref = buffer.toString('utf8', 0, 16);
			const file_extension_code = buffer.readUInt16LE(16);
			const uniqueId = buffer.readUInt32LE(18);

			const file = new BifFile(resref, file_extension_code, uniqueId);

			this.fileTable[file.bifIndex].addBif(file);
		}
	}
}
