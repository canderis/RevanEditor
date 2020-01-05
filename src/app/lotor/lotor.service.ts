import { Injectable } from '@angular/core';
import { Game } from './game';
import { BifArchive } from './file-types/bif-archive';
import { BifFile } from './file-types/bif-file';
import { ErfArchive } from './file-types/erf-archive';
import { Archive, KotorFile } from './file-types/archive';

export interface KotorFileNode {
	fileName: string;
	files: (KotorFile | KotorFileNode)[];
}

@Injectable({
	providedIn: 'root'
})
export class LotorService {
	games: Map<string, Game> = new Map();

	k1: Map<string, Game> = new Map();
	k2: Map<string, Game> = new Map();

	constructor() {}

	openDir(dir: string) {
		let g = this.k1.get(dir) || this.k2.get(dir);
		if (!g) {
			g = new Game(dir);
			if (g.game === 'KOTOR') {
				this.k1.set(dir, g);
			}
			else {
				this.k2.set(dir, g);
			}
			// this.games.set(dir, new Game(dir));
		}

		console.log(g);
		return g;

	}

	getTree(game: Game): KotorFileNode {
		console.log(this);
		return {
			fileName: game.game,
			files: this.format(game.files.filter(f => f.fileName !== 'chitin.key')).sort(f => f.fileExtension? 1 : -1)
		};
	}

	format(files: (KotorFile | Archive)[]) {
		return files.map(archive => {
			if (this.isKotorArchive(archive) && archive.files.length > 100) {
				return { ...archive, files: this.formatByExt(archive.files) };
			}

			return archive;
		});
	}
	formatByExt(files: (KotorFile | Archive)[] ) {
		const out: KotorFileNode[] = [];

		const sorted = new Map<string, (KotorFile | Archive)[]>();
		files.forEach(file => {

			if (file.fileExtension) {
				// const ext = file.fileName.substring( file.fileName.lastIndexOf('.') + 1);
				// file.fileExtension = ext;

				if ( !sorted.has(file.fileExtension) ) {
					sorted.set(file.fileExtension, []);
				}
				sorted.get(file.fileExtension).push(file);
			}
			else {
				// console.log(file);
				out.unshift({
					fileName: file.fileName,
					files: this.formatByExt((file as Archive).files)
				})
			}
		});

		sorted.forEach((sortedFiles, key) => {
			if (sortedFiles.length > 50) {
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

	isKotorArchive(object: any): object is Archive {
		return 'files' in object;
	}

	formatByAlphabet(files: (KotorFile | Archive)[]) {
		const sorted = new Map<string, (KotorFile | Archive)[]>();
		files.forEach(file => {
			if ( !sorted.has(file.fileName.charAt(0).toLowerCase()) ) {
				sorted.set(file.fileName.charAt(0).toLowerCase(), []);
			}
			sorted.get(file.fileName.charAt(0).toLowerCase()).push(file);
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
