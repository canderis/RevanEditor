import { Injectable } from '@angular/core';
import { Game } from './game';
import { BifArchive } from './file-types/bif-archive';
import { BifFile } from './file-types/bif-file';

@Injectable({
	providedIn: 'root'
})
export class LotorService {
	games: Map<string, Game> = new Map();

	constructor() {}

	openDir(dir: string) {
		if (!this.games.has(dir)) {
			this.games.set(dir, new Game(dir));
		}
		return this.games.get(dir);

	}

	getTree(game: Game) {
		console.log(this);
		return {
			fileName: game.game,
			files: [
				{
					fileName: 'Bifs',
					files: this.format(game.bif.bifFiles)
				}
			]
		};
	}

	format(files: BifArchive[]) {
		return files.map(archive => {
			if (archive.files.length > 100) {
				return { ...archive, files: this.formatByExt(archive.files) };
			} else {
				return archive;
			}
		});
	}
	formatByExt(files: BifFile[]) {
		const sorted = new Map<string, BifFile[]>();
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
					files: sortedFiles
				});
			}
		});

		return out;
	}

	formatByAlphabet(files: BifFile[]) {
		const sorted = new Map<string, BifFile[]>();
		files.forEach(file => {
			if ( !sorted.has(file.fileName.charAt(0)) ) {
				sorted.set(file.fileName.charAt(0), []);
			}
			sorted.get(file.fileName.charAt(0)).push(file);
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
