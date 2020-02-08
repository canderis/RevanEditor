export interface FileNode {
	fileName: string;
	fileExtension: string;
}

export interface ArchiveNode extends FileNode {
	archive: Archive;
	extract: () => KotorFile;
	file?: KotorFile;
}

export interface FolderNode extends FileNode {
	files: FileNode[];
}

export abstract class Archive implements FolderNode {
	files: FileNode[];
	fileName: string;
	fileExtension: string;
	archivePath: string;

	constructor() {}
}

export abstract class KotorFile implements FileNode {
	fileName: string;
	fileExtension: string;
	buffer: Buffer;

	constructor(fileName: string, fileExtension: string, buffer: Buffer) {}

	abstract save(): void;
	abstract open(): void;
}

export function isFolderNode(object: any): object is FolderNode {
	return "files" in object;
}

export function isArchiveNode(object: any): object is ArchiveNode {
	return "extract" in object;
}
