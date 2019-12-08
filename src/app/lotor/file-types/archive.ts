export interface KotorFile {
	fileName: string;
	fileExtension: string;
	extract: () => Buffer;
	archive: Archive;
}
export class Archive {
	files: KotorFile[];
	fileName: string;
	fileExtension: string;

	constructor() {}
}
