

import { BifArchive } from "./bif-archive";

import { openSync, readSync } from "original-fs";

import { FileExtensions } from "../file-extensions";
import { ArchiveNode } from "../kotor-types";

import { KotorFile } from '../file-types/kotor-file';
import { kotorFileFactory } from "../file-types/kotor-file-factory";

export class BifArchiveNode implements ArchiveNode {
	archive: BifArchive;
	file: KotorFile;

	fileName: string;
	fileExtension: string;


	bifIndex: number;
	indexOfFileInBif: number;


	extract() {
		const fd = openSync(this.archive.directory, 'r');

		let buffer = Buffer.alloc(20);
		readSync(fd, buffer, 0, 20, 0);

		const bifHeader = {
			number_of_variable_resources: buffer.readUInt32LE(8),
			number_of_fixed_resouces: buffer.readUInt32LE(12),
			offset_to_variable_resouces: buffer.readUInt32LE(16)
		};

		buffer = Buffer.alloc(16);
		readSync(
			fd,
			buffer,
			0,
			16,
			bifHeader.offset_to_variable_resouces + 16 * this.indexOfFileInBif
		);

		const variableTable = {
			id: buffer.readUInt32LE(0),
			offset_into_variable_resource_raw_data: buffer.readUInt32LE(4),
			size_of_raw_data_chunk: buffer.readUInt32LE(8),
			resource_type: buffer.readUInt32LE(12)
		};

		buffer = Buffer.alloc(variableTable.size_of_raw_data_chunk);
		readSync(
			fd,
			buffer,
			0,
			variableTable.size_of_raw_data_chunk,
			variableTable.offset_into_variable_resource_raw_data
		);

		this.file =  kotorFileFactory(this.fileName, this.fileExtension, buffer);
		return this.file;

	}

	constructor(public resref: string, public file_extension_code: number, public uniqueId: number) {
		this.bifIndex = this.uniqueId >> 20;
		this.indexOfFileInBif = this.uniqueId - (this.bifIndex << 20);
		this.fileExtension = FileExtensions[this.file_extension_code];
		this.fileName = (`${this.resref}.${this.fileExtension}`).trim().replace(/\0/g, '');
	}

}
