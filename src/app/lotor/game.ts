import { Bif, } from './bif';
import { Erf } from './erf';

import * as fs from 'fs';

export class Game {
	bif: Bif;
	erf: Erf;

	game: 'KOTOR' | 'TSL';

	constructor(dir: string) {
		const directory = dir;

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
		this.erf = new Erf(directory, this.game);
		// this.erf = new erf(directory, fs);
	}
}
