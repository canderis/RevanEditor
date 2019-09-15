import { Bif, BifDef, BifFile } from './bif';

interface BifFileExt extends BifFile{
	bif?: Bif;
}

export class Game {
	bif: Bif;
	game: 'KOTOR' | 'TSL';

	constructor(dir: string) {
		const directory = dir;

		const fs = require('fs');

		if (!fs.existsSync(directory)) {
			console.log('directory does not exist');
			return;
		}

		const data = fs.readdirSync(directory);

		const key = data.find((row) => {
			return row === 'chitin.key';
		});

		if (!key) {
			console.log('invalid directory');
			return;
		}

		const game = data.find((row) => {
			return row === 'swkotor2.ini';
		});

		if (game === 'swkotor2.ini') {
			this.game = 'TSL';
		} else {
			this.game = 'KOTOR';
		}

		this.bif = new Bif(directory, this.game);
		// this.erf = new erf(directory, fs);
	}

	getTree() {
		console.log(this);
		return {
			fileName: this.game,
			files: [
				{
					fileName: 'Bifs',
					files: this.format(this.bif.bifFiles)
				}
			]
		};
	}

	format(files: BifDef[]) {
		return files.map(file => {
			if (file.files.length > 100) {
				return { ...file, files: this.formatByExt(file.files as BifFileExt[]) };
			} else {
				return {...file, bif: this.bif};
			}
		});
	}
	formatByExt(files: BifFileExt[]) {
		const sorted = new Map<string, BifFileExt[]>();
		files.forEach(file => {
			if ( !sorted.has(file.fileExtension) ) {
				sorted.set(file.fileExtension, []);
			}
			sorted.get(file.fileExtension).push(file);
		});

		const out = [];
		sorted.forEach((sortedFiles, key) => {
			if (sortedFiles.length > 100) {
				out.push({
					fileName: key,
					files: this.formatByAlphabet(sortedFiles)
				});
			} else {
				out.push({
					fileName: key,
					files: sortedFiles,
					bif: this.bif
				});
			}
		});

		return out;
	}

	formatByAlphabet(files: BifFileExt[]) {
		const sorted = new Map<string, BifFileExt[]>();
		files.forEach(file => {
			if ( !sorted.has(file.fileName.charAt(0)) ) {
				sorted.set(file.fileName.charAt(0), []);
			}
			sorted.get(file.fileName.charAt(0)).push({...file, bif: this.bif});
		});

		const out = [];
		sorted.forEach((sortedFiles, key) => {
			out.push({
				fileName: key,
				files: sortedFiles,
			});
		});

		return out;
	}
}
