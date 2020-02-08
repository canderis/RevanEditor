import { Injectable } from '@angular/core';
import { Game } from './game';
import { FolderNode, FileNode, isFolderNode, Archive } from './kotor-types';


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

	getTree(game: Game): FolderNode {
		const tree = {
			fileName: game.game,
			files: this.formatArchives(game.files.filter(f => f.fileName !== 'chitin.key')).sort(f => f.fileExtension? 1 : -1),
			fileExtension: ''
		};

		return tree;
	}

	formatArchives(files: FileNode[]): FileNode[] {
		return this.formatByExtension(files.map(f => {
			if (isFolderNode(f)) {
				f.files = this.formatArchives(f.files);
			}

			return f;
		}));
	}

	formatByExtension(files: FileNode[]): FileNode[] {
		if (files.length > 20) {
			const sorted = new Map<string, FileNode[]>();

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

	format(files: FileNode[]) {
		return files.map(archive => {
			if (isFolderNode(archive)) {
				return { ...archive, files: this.formatByExt(archive.files) };
			}

			return archive;
		});
	}
	formatByExt(files: FileNode[] ) {
		const out: FileNode[] = [];

		const sorted = new Map<string, FileNode[]>();
		files.forEach(file => {

			if (isFolderNode(file)) {
				// const ext = file.fileName.substring( file.fileName.lastIndexOf('.') + 1);
				// file.fileExtension = ext;

				out.unshift({
					fileName: file.fileName,
					files: this.format(file.files),
					fileExtension: ''
				} as FolderNode)
			}
			else {
				if ( !sorted.has(file.fileExtension) ) {
					sorted.set(file.fileExtension, []);
				}
				sorted.get(file.fileExtension).push(file);
			}
		});

		sorted.forEach((sortedFiles, key) => {
			if (sortedFiles.length > 50) {
				out.push({
					fileName: key,
					files: this.formatByAlphabet(sortedFiles),
					fileExtension: ''
				} as FolderNode);
			} else {
				out.push({
					fileName: key,
					files: sortedFiles,
					fileExtension: ''
				} as FolderNode);
			}
		});

		return out;
	}



	formatByAlphabet(files: FileNode[]) {
		const sorted = new Map<string, FileNode[]>();
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
