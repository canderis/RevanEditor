
import { readSync } from 'fs';
import { RimArchive } from './rim-archive';
import { ArchiveNode } from '../kotor-types';
import { KotorFile } from '../file-types/kotor-file';
import { kotorFileFactory } from "../file-types/kotor-file-factory";

export class RimArchiveNode implements ArchiveNode {
	archive: RimArchive;
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
