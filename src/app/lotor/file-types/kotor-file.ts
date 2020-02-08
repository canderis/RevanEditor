import { KotorFile } from "../kotor-types";
import { Twoda } from "./twoda";


export function kotorFileFactory(
	fileName: string,
	fileExtension: string,
	buffer: Buffer
): KotorFile {
	switch (fileExtension) {
		case "2da":
			return new Twoda(fileName, fileExtension, buffer);

		default:
			return {
				fileName: this.fileName,
				fileExtension: this.fileExtension,
				save: () => {},
				open: () => {},
				buffer
			};
	}
}
