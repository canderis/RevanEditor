import { KotorFile } from './archive';
import * as fs from 'fs';
import { ErfArchive } from './erf-archive';

export class ErfFile implements KotorFile {
	archive: ErfArchive;

	constructor(
		public fileName: string,
		public fileExtension: string,
		public offset: number,
		public size: number
	) {}

	extract() {
		const opened = this.archive.open();

		const buffer = Buffer.alloc(this.size);
		fs.readSync(this.archive.fd, buffer, 0, this.size, this.offset);

		this.archive.close(opened);

		return buffer;
	}
}
