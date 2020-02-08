import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Preferences {
	directories: string[];
}

@Injectable({
	providedIn: 'root'
})
export class PreferenceService {
	_preferences: Preferences;
	preferenceFile: string;
	_directories: string[];

	set directories(paths: string[]) {
		localStorage.setItem('paths', JSON.stringify(paths));
		this._directories = [...paths];


	}

	get directories() {
		if(!this._directories) {
			const d = localStorage.getItem('paths');
			if (d) {
				this._directories = JSON.parse(d);
			}
			else {
				this._directories = [];
			}
		}

		return [...this._directories];
	}

	constructor() {}

}
