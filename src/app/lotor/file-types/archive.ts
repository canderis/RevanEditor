export interface FileNode {
	fileName: string;
	fileExtension: string
}
// export interface KotorFile extends FileNode {
// 	fileName: string;
// 	fileExtension: string;
// 	extract?: () => Buffer;
// 	archive: Archive;
// }
export abstract class Archive implements FileNode {
	files: (KotorFile | Archive)[];
	fileName: string;
	fileExtension: string;
	archivePath: string;

	constructor() {}
}

export abstract class KotorFile implements FileNode {
	fileName: string;
	fileExtension: string;

	constructor() {}

	abstract extract: any
}
