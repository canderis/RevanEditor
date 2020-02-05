export interface FileNode {
	fileName: string;
	fileExtension: string
}
export interface KotorFile extends FileNode {
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
