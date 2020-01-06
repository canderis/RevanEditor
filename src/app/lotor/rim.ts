
import * as fs from 'fs';
import * as path from 'path';
import { RimArchive } from './file-types/rim-archive';
// const fs = require('fs');

export class Rim {
	directory: string;
	game: 'KOTOR' | 'TSL';

	rimFiles: RimArchive[];

	constructor(directory: string, game: 'KOTOR' | 'TSL') {
		this.directory = directory;
		this.game = game;

		const rimsPath = path.join(directory, 'rims');
		const dir = fs.readdirSync(rimsPath);

		this.rimFiles = dir.map( v => new RimArchive(v, path.join(rimsPath, v), this.game));
	}
}
