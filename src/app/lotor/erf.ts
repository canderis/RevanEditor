

import * as fs from 'fs';
import * as path from 'path';
import { ErfArchive } from './kotor-archives/erf-archive';
// const fs = require('fs');

export class Erf {
	directory: string;
	game: 'KOTOR' | 'TSL';

	erfFiles: ErfArchive[];

	constructor(directory: string, game: 'KOTOR' | 'TSL') {
		this.directory = directory;
		this.game = game;

		const texturesPath = path.join(directory, 'TexturePacks');
		const dir = fs.readdirSync(texturesPath);

		this.erfFiles = dir.map( v => new ErfArchive(v, path.join(texturesPath, v), this.game));
	}
}
