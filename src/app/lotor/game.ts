import { Bif } from "./bif";
import { Erf } from "./erf";
import * as path from "path";
import * as fs from "fs";
import { Rim } from "./rim";
import { ErfArchive } from "./file-types/erf-archive";
import { RimArchive } from "./file-types/rim-archive";
import { Archive, KotorFile } from "./file-types/archive";
import { KotorFileNode } from "./lotor.service";

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
	files: (KotorFile | Archive)[];

	game: "KOTOR" | "TSL";

	constructor(dir: string) {
		const directory = dir;

		if (!fs.existsSync(directory)) {
			console.log("directory does not exist");
			return;
		}

		const data = fs.readdirSync(directory);

		const key = data.find(row => {
			return row === "chitin.key";
		});

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

		// console.log(fList);

		this.files = this.buildTree(directory);

		console.log(this.files);

		// this.bif = new Bif(directory, this.game);
		// this.erf = new Erf(directory, this.game);
		// this.rim = new Rim(directory, this.game);

		// this.erf = new erf(directory, fs);
	}

	buildTree(directory: string): (KotorFile | Archive)[] {
		const fList = fs.readdirSync(directory);

		return fList
			.map(p => {
				const archivePath = path.join(directory, p);
				const fileExtension = path.extname(p).substring(1);
				if (fs.lstatSync(archivePath).isDirectory()) {
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
					fileExtension
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
