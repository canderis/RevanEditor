import { dialog } from "electron";
import { writeFileSync } from "fs";

export class KotorFile {
	opened: boolean = false;

	constructor(public fileName: string, public fileExtension: string, public buffer: Buffer) {}

	// Override this method in child classes
	async compile(): Promise<Buffer> {
		return this.buffer;
	}

	// Override this method in child classes
	decompile(): void {}

	async save(): Promise<Buffer> {
		return await this.compile();
	};


	open() {
		if(!this.opened) {
			this.decompile();
		}
		this.opened = true;
	};
}
