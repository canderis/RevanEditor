import { Bif } from "./bif";
import { Erf } from "./erf";
import * as path from "path";
import * as fs from "fs";
import { Rim } from "./rim";
import { ErfArchive } from "./file-types/erf-archive";
import { RimArchive } from "./file-types/rim-archive";
import { Archive } from "./file-types/archive";

const FILE_TYPES: { [key: string]: any } = {
	// 'bif': Bif,
	".erf": ErfArchive,
	'.rim': RimArchive,
	'.mod': RimArchive,
};

export class Game {
	// bif: Bif;
	// erf: Erf;
	// rim: Rim;
	files: Archive[];

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

		// console.log(directory);
		const fList = fs.readdirSync(directory);

		this.files = fList
			.map(p => {
				return {
					archivePath: path.join(directory, p),
					fileName: p,
					files: []
				};
			})
			.filter(p => fs.lstatSync(p.archivePath).isDirectory())
			.map(p => {
				return {
					...p,
					files: fs
						.readdirSync(p.archivePath)
						.map(f =>
							FILE_TYPES[path.extname(f)]
								? new FILE_TYPES[path.extname(f)](
										f,
										path.join(p.archivePath, f),
										this.game
								)
								: {
									fileName: f
								}
						)
				};
			});

			console.log(this.files);

		// this.bif = new Bif(directory, this.game);
		// this.erf = new Erf(directory, this.game);
		// this.rim = new Rim(directory, this.game);

		// this.erf = new erf(directory, fs);
	}
}
