
import { join, extname } from 'path';
import { existsSync, readdirSync, openSync, closeSync, readFileSync, lstatSync} from 'fs';
import { ErfArchive } from './kotor-archives/erf-archive';
import { RimArchive } from './kotor-archives/rim-archive';
import { Chitin } from './kotor-archives/chitin-key-file';
import { FileNode, FolderNode, ArchiveNode } from './kotor-types';

const FILE_TYPES: { [key: string]: any } = {
	// 'bif': Bif,
	"erf": ErfArchive,
	"rim": RimArchive,
	"mod": ErfArchive
};

export class Game {
	// bif: Bif;
	// erf: Erf;
	// rim: Rim;
	files: FileNode[];

	game: "KOTOR" | "TSL";
	chitin: Chitin;

	constructor(dir: string) {
		const directory = dir;

		if (!existsSync(directory)) {
			console.log("directory does not exist");
			return;
		}

		const data = readdirSync(directory);

		const key = data.find(row => {
			return row === "chitin.key";
		});

		console.log(data);

		if (!key) {
			console.log("invalid directory");
			return;
		}

		const game = data.find(row => {
			return row === "swkotor2.ini";
		});

		if (game === "swkotor2.ini") {
			this.game = "TSL";
		} else {
			this.game = "KOTOR";
		}

		const fd = openSync(`${directory}/chitin.key`, 'r');
		this.chitin = new Chitin(directory, fd);

		const bifFiles = this.chitin.getBifArchives(fd);

		closeSync(fd);
		// console.log(fList);

		this.files = this.buildTree(directory).filter(f => f.fileName !== 'data');
		this.files.unshift({
			fileName: 'data',
			files: bifFiles,
			archivePath: join(directory, 'data'),
			fileExtension: 'bif'
		} as FileNode) ;
	}

	buildTree(directory: string): FileNode[] {
		const fList = readdirSync(directory);

		return fList
			.map(p => {
				const archivePath = join(directory, p);
				const fileExtension = extname(p).substring(1);
				if (lstatSync(archivePath).isDirectory()) {
					return {
						archivePath,
						fileName: p,
						files: this.buildTree(archivePath),
						fileExtension
					};
				}

				if (FILE_TYPES[fileExtension]) {
					return new FILE_TYPES[fileExtension](
						p,
						archivePath,
						this.game,
						fileExtension
					)
				}
				return {
					archivePath,
					fileName: p,
					fileExtension,
					extract: () => readFileSync(archivePath, {encoding: 'utf-8'})
				};
			})
			// .filter(p => fs.lstatSync(p.archivePath).isDirectory())
			// .map(p => {
			// 	return {
			// 		...p,
			// 		files: fs.readdirSync(p.archivePath).map(f => {

			// 			if (FILE_TYPES[path.extname(f)]) {
			// 				return new FILE_TYPES[path.extname(f)](
			// 					f,
			// 					path.join(p.archivePath, f),
			// 					this.game
			// 				)
			// 			}

			// 			const d = path.join(p.archivePath, f)
			// 				?
			// 				: {
			// 						fileName: f
			// 				}
			// 		}

			// 		)
			// 	};
			// });
	}
}
