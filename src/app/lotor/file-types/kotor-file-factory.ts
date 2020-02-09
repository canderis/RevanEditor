import { KotorFile } from "./kotor-file";
import { Twoda } from "./twoda";
import { TPC } from "./tpc";

export function kotorFileFactory(
	fileName: string,
	fileExtension: string,
	buffer: Buffer
): KotorFile {
	switch (fileExtension) {
		case "2da":
			return new Twoda(fileName, fileExtension, buffer);
		case "tpc":
			return new TPC(fileName, fileExtension, buffer);
		default:
			return new KotorFile(fileName, fileExtension, buffer);
	}
}
