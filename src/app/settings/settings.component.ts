import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PreferenceService } from '../shared/services/preference.service';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
	directories: string[] = [];

	constructor(private preferenceService: PreferenceService, private cdRef: ChangeDetectorRef) {}

	ngOnInit() {
		this.preferenceService.getPreferences().subscribe( preferences => {
			this.directories = preferences.directories;
		});
	}

	browse(i: number) {
		const remote = require('electron').remote;

		const dialog = remote.dialog;
		dialog.showOpenDialog(
			{ properties: ['openDirectory'], title: 'Browse for game' },
			(fileNames: string[]) => {
				if (!fileNames || fileNames.length < 1) {
					return false;
				}
				this.directories[i] = fileNames[0];
				this.cdRef.detectChanges();
			}
		);
	}

	save() {
		this.preferenceService.directoryPaths = this.directories;
	}
}
