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
		}

		return g;

	}

	getTree(game: Game): KotorFileNode {
		const tree = {
			fileName: game.game,
			files: this.formatArchives(game.files.filter(f => f.fileName !== 'chitin.key')).sort(f => f.fileExtension? 1 : -1)
		};

		return tree;
	}

	formatArchives(files: (KotorFile | Archive)[]): (KotorFile | Archive)[] {
		return this.formatByExtension(files.map(f => {
			if (this.isKotorArchive(f)) {
				f.files = this.formatArchives(f.files);
			}

			return f;
		}));
	}

	formatByExtension(files: (KotorFile | Archive)[]): (KotorFile | Archive)[] {
		if (files.length > 20) {
			const sorted = new Map<string, (KotorFile | Archive)[]>();

			const out: Archive[] = [];

			files.forEach(file => {
				if (!file.fileExtension) {
					out.push(file as Archive);
				}
				else {
					if ( !sorted.has(file.fileExtension) ) {
						sorted.set(file.fileExtension, []);
					}
					sorted.get(file.fileExtension).push(file);
				}

			})

			sorted.forEach((sortedFiles, key) => {
				if (sortedFiles.length > 50) {
					out.push({
						fileName: key,
						files: this.formatByAlphabet(sortedFiles),
						archivePath: '',
						fileExtension: ''
					});
				} else {
					out.push({
						fileName: key,
						files: sortedFiles,
						archivePath: '',
						fileExtension: ''
					});
				}
			});
			return out;
		}

		return files;
	}

	format(files: (KotorFile | Archive)[]) {
		return files.map(archive => {
			if (this.isKotorArchive(archive)) {
				return { ...archive, files: this.formatByExt(archive.files) };
			}

			return archive;
		});
	}
	formatByExt(files: (KotorFile | Archive)[] ) {
		const out: KotorFileNode[] = [];

		const sorted = new Map<string, (KotorFile | Archive)[]>();
		files.forEach(file => {

			if (!this.isKotorArchive(file)) {
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
					files: this.format((file as Archive).files)
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

		const out: Archive[] = [];
		sorted.forEach((sortedFiles, key) => {
			out.push({
				fileName: key,
				files: sortedFiles,
				archivePath: '',
				fileExtension: ''
			});
		});

		return out;
	}

}
