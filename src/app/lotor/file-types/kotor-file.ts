import { dialog } from "electron";
import { writeFileSync } from "fs";

export class KotorFile {
	constructor(public fileName: string, public fileExtension: string, public buffer: Buffer) {}

	// Override this method in child classes
	async compile(): Promise<Buffer> {
		return this.buffer;
	}

	async save(): Promise<Buffer> {
		return await this.compile();
	};


	open() {};
}
