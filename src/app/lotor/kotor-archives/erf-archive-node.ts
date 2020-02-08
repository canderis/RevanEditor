
import { readSync } from 'fs';
import { ErfArchive } from './erf-archive';
import { ArchiveNode, KotorFile } from '../kotor-types';
import { kotorFileFactory } from '../file-types/kotor-file';

export class ErfArchiveNode implements ArchiveNode {
	archive: ErfArchive;
	file: KotorFile;

	constructor(
		public fileName: string,
		public fileExtension: string,
		public offset: number,
		public size: number
	) {}

	extract() {
		const opened = this.archive.open();

		const buffer = Buffer.alloc(this.size);
		readSync(this.archive.fd, buffer, 0, this.size, this.offset);

		this.archive.close(opened);

		this.file =  kotorFileFactory(this.fileName, this.fileExtension, buffer);
		return this.file;
	}
}
