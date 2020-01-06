import { KotorFile } from './archive';
import * as fs from 'fs';
import { RimArchive } from './rim-archive';

export class RimFile implements KotorFile {
	archive: RimArchive;

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
