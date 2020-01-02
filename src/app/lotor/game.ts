import { Bif } from "./bif";
import { Erf } from "./erf";
import * as path from "path";
import * as fs from "fs";
import { Rim } from "./rim";
import { ErfArchive } from "./file-types/erf-archive";
import { RimArchive } from "./file-types/rim-archive";

const FILE_TYPES: { [key: string]: any } = {
	// 'bif': Bif,
	".erf": ErfArchive,
	'.rim': RimArchive,
	'.mod': RimArchive,
};

export class Game {
	bif: Bif;
	erf: Erf;
	rim: Rim;

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

		const dirs = fList
			.map(p => {
				return {
					path: path.join(directory, p),
					dir: p
				};
			})
			.filter(p => fs.lstatSync(p.path).isDirectory())
			.map(p => {
				return {
					...p,
					files: fs
						.readdirSync(p.path)
						.map(f =>
							FILE_TYPES[path.extname(f)]
								? new FILE_TYPES[path.extname(f)](
										f,
										path.join(p.path, f),
										this.game
								)
								: f
						)
				};
			});

		console.log(dirs);

		this.bif = new Bif(directory, this.game);
		this.erf = new Erf(directory, this.game);
		// this.rim = new Rim(directory, this.game);

		// this.erf = new erf(directory, fs);
	}
}
