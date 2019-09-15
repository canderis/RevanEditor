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

	set directoryPaths(paths: string[]) {
		const fs = require('fs');

		this._preferences.directories = paths;
		fs.writeFileSync(this.preferenceFile,  JSON.stringify(this._preferences) );
	}

	getPreferences() {
		return new Observable<Preferences>( observer => {
			if (!this._preferences) {
				this.loadFile();
			}

			observer.next(this._preferences);
			observer.complete();
		});
	}

	loadFile() {
		const remote = require('electron').remote;
		const fs = require('fs');

		const app = remote.app;
		const path = require('path');

		this.preferenceFile = path.join(app.getPath('userData'), '/RevanEditorPreferences.json');

		if ( !fs.existsSync(this.preferenceFile) ) {
			fs.writeFileSync(this.preferenceFile, JSON.stringify({directories: []}) );
		}

		const settings = JSON.parse(fs.readFileSync(this.preferenceFile) );
		this._preferences = settings;
	}

	constructor() {}

}
