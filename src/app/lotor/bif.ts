import { Chitin } from "./kotor-archives/chitin-key-file";
import { BifArchive } from "./kotor-archives/bif-archive";

const fs = require('fs');

export class Bif {
	directory: string;
	game: 'KOTOR' | 'TSL';

	chitin: Chitin;

	bifFiles: BifArchive[];

	constructor(directory: string, game: 'KOTOR' | 'TSL') {

		this.directory = directory;
		this.game = game;

		const fd = fs.openSync(`${directory}/chitin.key`, 'r');

		this.chitin = new Chitin(this.directory, fd);

		this.bifFiles = this.chitin.getBifArchives(fd);

		fs.closeSync(fd);
	}
}
