import { Injectable } from '@angular/core';
import { Game } from './game';
import { BifArchive } from './file-types/bif-archive';
import { BifFile } from './file-types/bif-file';
import { ErfArchive } from './file-types/erf-archive';
import { Archive, KotorFile } from './file-types/archive';

export interface KotorFileNode {
	fileName: string;
	files: KotorFile[] | KotorFileNode[];
}

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

	getTree(game: Game): KotorFileNode {
		console.log(this);
		return {
			fileName: game.game,
			files: [
				{
					fileName: 'Bifs',
					files: this.format(game.bif.bifFiles)
				},
				{
					fileName: 'Erfs',
					files: this.format(game.erf.erfFiles)
				}
			]
		};
	}

	format(files: Archive[]) {
		return files.map(archive => {
			if (archive.files.length > 100) {
				return { ...archive, files: this.formatByExt(archive.files) };
			}

			return archive;
		});
	}
	formatByExt(files: KotorFile[] ) {
		const sorted = new Map<string, KotorFile[]>();
		files.forEach(file => {
			if ( !sorted.has(file.fileExtension) ) {
				sorted.set(file.fileExtension, []);
			}
			sorted.get(file.fileExtension).push(file);
		});

		const out: KotorFileNode[] = [];
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

	formatByAlphabet(files: KotorFile[]) {
		const sorted = new Map<string, KotorFile[]>();
		files.forEach(file => {
			if ( !sorted.has(file.fileName.charAt(0)) ) {
				sorted.set(file.fileName.charAt(0), []);
			}
			sorted.get(file.fileName.charAt(0)).push(file);
		});

		const out: KotorFileNode[] = [];
		sorted.forEach((sortedFiles, key) => {
			out.push({
				fileName: key,
				files: sortedFiles,
			});
		});

		return out;
	}

}
