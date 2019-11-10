export interface KotorFile {
	fileName: string;
	fileExtension: string;
}
export class Archive {
	files: KotorFile[];
	fileName: string;
	fileExtension: string;

	constructor() {}
}
