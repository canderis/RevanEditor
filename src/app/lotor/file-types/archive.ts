export interface FileNode {
	fileName: string;
}
export interface KotorFile {
	fileName: string;
	fileExtension: string;
	extract: () => Buffer;
	archive: Archive;
}
export class Archive {
	files: (KotorFile | Archive)[];
	fileName: string;
	fileExtension?: string;
	archivePath: string;

	constructor() {}
}
