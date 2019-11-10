import { ErfArchive } from './file-types/erf-archive';

import * as fs from 'fs';
import * as path from 'path';
// const fs = require('fs');

export class Erf {
	directory: string;
	game: 'KOTOR' | 'TSL';

	erfArchives: ErfArchive[];

	constructor(directory, game: 'KOTOR' | 'TSL') {
		this.directory = directory;
		this.game = game;

		const texturesPath = path.join(directory, 'TexturePacks');
		const dir = fs.readdirSync(texturesPath);

		this.erfArchives = dir.map( v => new ErfArchive(path.join(texturesPath, v), this.game));

		console.log(this);
	}
}
