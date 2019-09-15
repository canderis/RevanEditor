import { Game } from './game';
import { fileExtensionLookup } from './file-extensions';

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
interface ChitinHeader {
	number_of_bif_files: number;
	number_of_entries_in_chitin_key: number;
	offset_to_table_of_files: number;
	offset_to_table_of_keys: number;
	build_year: number;
	build_day: number;
	header_length: 60;
}

export class Bif {
	directory: string;
	game: Game;

	chitinHeader: ChitinHeader;

	bifFiles: any;

	constructor(directory, game: Game) {
		const fs = require('fs');

		this.directory = directory;
		this.game = game;

		const fd = fs.openSync(directory + '/chitin.key', 'r');

		this.chitinHeader = this.readChitinHeader(fd);
		this.bifFiles = this.parseBifFileDataInChitin(fd, this.chitinHeader);
		this.bifFiles = this.parseTableOfKeys(
			fd,
			this.bifFiles
		);

		fs.closeSync(fd);
	}

	parseTableOfKeys(fd, bifFiles) {
		const fs = require('fs');

		for (let i = 0; i < this.chitinHeader.number_of_entries_in_chitin_key; i++) {
			const buffer = Buffer.alloc(22);
			fs.readSync(
				fd,
				buffer,
				0,
				22,
				this.chitinHeader.offset_to_table_of_keys + i * 22
			);

			const file = {
				resref: buffer.toString('utf8', 0, 16),
				file_extension_code: buffer.readUInt16LE(16),
				uniqueId: buffer.readUInt32LE(18),
				leaf: true,
				game: this.game.game,
				bifIndex: null,
				indexOfFileInBif: null,
				fileExtension: null,
				fileName: null,
			};

			file.bifIndex = file.uniqueId >> 20;
			file.indexOfFileInBif = file.uniqueId - (file.bifIndex << 20);

			file.fileExtension = fileExtensionLookup[file.file_extension_code].fileExtension;
			file.fileName = file.resref + '.' + file.fileExtension;
			file.fileName = file.fileName.trim().replace(/\0/g, '');

			if (!bifFiles[file.bifIndex]) { console.log('Error File!!!', file); }

			if (!bifFiles[file.bifIndex].files) {
				bifFiles[file.bifIndex].files = [];
			}

			bifFiles[file.bifIndex].files.push(file);
		}

		bifFiles.forEach(function(ele) {
			if (ele.files.length >= 100) {
				const sorted = {};
				ele.files.forEach(function(file) {
					if (!sorted[file.fileExtension]) {
						sorted[file.fileExtension] = [];
					}
					sorted[file.fileExtension].push(file);
				});

				// _.forEach(sorted, function(resourceType){
				for (const resourceTypeKey in sorted) {
					if (sorted[resourceTypeKey].length >= 100) {
						// alphabetize
						const alphabetized = {};
						sorted[resourceTypeKey].forEach(function(file) {
							const letterKey = file.fileName.charAt(0);
							if (!alphabetized[letterKey]) {
								alphabetized[letterKey] = [];
							}
							alphabetized[letterKey].push(file);
						});

						const alphabetizedFiles = [];
						for (const key in alphabetized) {
							if (alphabetized[key]){
								alphabetizedFiles.push({
									files: alphabetized[key],
									fileName:
										key + ' (' + alphabetized[key].length + ')'
								});
							}
						}

						sorted[resourceTypeKey] = alphabetizedFiles;
					}
				}

				const files = [];
				for (const key in sorted) {
					if (sorted[key]){
						files.push({ files: sorted[key], fileName: key });
					}
				}

				ele.files = files;
			}
		});

		return bifFiles;
	}

	parseBifFileDataInChitin(fd, chitinHeader) {
		const bifFiles = [];
		const fs = require('fs');

		for (let i = 0; i < chitinHeader.number_of_bif_files; i++) {
			const buffer = Buffer.alloc(12);
			fs.readSync(
				fd,
				buffer,
				0,
				12,
				chitinHeader.offset_to_table_of_files + i * 12
			);

			const bif = {
				size_of_file: buffer.readUInt32LE(0),
				offset_into_filename_table_for_filename: buffer.readUInt32LE(4),
				length_of_filename: buffer.readUInt16LE(8),
				bif_drive: buffer.readUInt16LE(10),
				bif_filename: '',
				fileName: ''
			};

			const filenameBuffer = Buffer.alloc(bif.length_of_filename);
			fs.readSync(
				fd,
				filenameBuffer,
				0,
				bif.length_of_filename,
				bif.offset_into_filename_table_for_filename
			);

			const fileName = filenameBuffer.toString();
			bif.bif_filename = fileName;
			bif.fileName = fileName
				.replace('data\\', '')
				.trim()
				.replace(/\0/g, '');

			bifFiles.push(bif);
		}

		return bifFiles;
	}

	readChitinHeader(fd): ChitinHeader {
		const fs = require('fs');

		const buffer = Buffer.alloc(60);
		fs.readSync(fd, buffer, 0, 60, 0);

		return {
			number_of_bif_files: buffer.readUInt32LE(8),
			number_of_entries_in_chitin_key: buffer.readUInt32LE(12),
			offset_to_table_of_files: buffer.readUInt32LE(16),
			offset_to_table_of_keys: buffer.readUInt32LE(20),
			build_year: buffer.readUInt32LE(24),
			build_day: buffer.readUInt32LE(28),
			header_length: 60
		};
	}

	extractBif(file, path, index) {
		const fs = require('fs');

		const fd = fs.openSync(
			path +
				'/' +
				this.bifFiles[index].files[0].files[file.bifIndex].bif_filename
					.trim()
					.replace(/\\/g, '/')
					.replace(/\0/g, ''),
			'r'
		);

		let buffer = new Buffer(20);
		fs.readSync(fd, buffer, 0, 20, 0);

		const bifHeader = {
			number_of_variable_resources: buffer.readUInt32LE(8),
			number_of_fixed_resouces: buffer.readUInt32LE(12),
			offset_to_variable_resouces: buffer.readUInt32LE(16)
		};

		buffer = Buffer.alloc(16);
		fs.readSync(
			fd,
			buffer,
			0,
			16,
			bifHeader.offset_to_variable_resouces + 16 * file.indexOfFileInBif
		);
		const variableTable = {
			id: buffer.readUInt32LE(0),
			offset_into_variable_resource_raw_data: buffer.readUInt32LE(4),
			size_of_raw_data_chunk: buffer.readUInt32LE(8),
			resource_type: buffer.readUInt32LE(12)
		};

		buffer = Buffer.alloc(variableTable.size_of_raw_data_chunk);
		fs.readSync(
			fd,
			buffer,
			0,
			variableTable.size_of_raw_data_chunk,
			variableTable.offset_into_variable_resource_raw_data
		);

		return buffer;
	}

	extractErf(file, path, gameIndex) {
		const resoucePath = this.bifFiles[gameIndex].files[1];

		// let index = _.findIndex(resoucePath, 'fileName', file.erfFileName);

		// let fd = this.fs.openSync(
		// 	path + '/' + 'TexturePacks/' + file.erfFileName,
		// 	'r'
		// );

		// const buf = new Buffer(file.size);
		// this.fs.readSync(fd, buf, 0, file.size, file.offset);
		// return buf;
	}

	getBifTree() {
		// if (!this.bifTree) {
		// 	this.buildBifTree();
		// }

		// return this.bifTree;
	}
}
