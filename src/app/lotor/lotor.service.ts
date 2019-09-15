import { Injectable } from '@angular/core';
import { Game } from './game';

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

}
