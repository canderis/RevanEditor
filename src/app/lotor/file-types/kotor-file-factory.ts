import { KotorFile } from "./kotor-file";
import { Twoda } from "./twoda";

export function kotorFileFactory(
	fileName: string,
	fileExtension: string,
	buffer: Buffer
): KotorFile {
	console.log(arguments);
	switch (fileExtension) {
		case "2da":
			return new Twoda(fileName, fileExtension, buffer);
		default:
			return new KotorFile(fileName, fileExtension, buffer);
	}
}
