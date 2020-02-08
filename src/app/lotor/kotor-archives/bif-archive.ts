
import { BifArchiveNode } from './bif-archive-node';
import { Archive } from '../kotor-types';

export class BifArchive extends Archive {
	fileName: string;
	directory: string;
	files: BifArchiveNode[] = [];

	constructor(
		public size_of_file: number,
		public offset_into_filename_table_for_filename: number,
		public length_of_filename: number,
		public bif_drive: number,
		public bif_filename: string,
		directory: string) {
			super();
		this.fileName = bif_filename.replace('data\\', '').trim().replace(/\0/g, '');

		this.directory = `${directory}/${bif_filename}`
			.trim()
			.replace(/\\/g, '/')
			.replace(/\0/g, '');
	}

	addBif(file: BifArchiveNode) {

		file.archive = this;
		this.files.push(file);
	}
}
