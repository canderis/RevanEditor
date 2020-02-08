import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { PreferenceService } from "../../../../../shared/services/preference.service";
import { remote } from 'electron'

@Component({
	selector: "app-preference-editor",
	templateUrl: "./preference-editor.component.html",
	styleUrls: ["./preference-editor.component.scss"]
})
export class PreferenceEditorComponent implements OnInit {
	directories: string[] = [];

	constructor(
		private preferenceService: PreferenceService,
		private cdRef: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.directories = this.preferenceService.directories;
	}

	browse(i: number) {
		const dialog = remote.dialog;
		dialog.showOpenDialog(
			{ properties: ["openDirectory"], title: "Browse for game" },
		).then( res => {
			if (!res.filePaths || res.filePaths.length < 1) {
				return false;
			}
			this.directories[i] = res.filePaths[0];
			this.cdRef.detectChanges();
		});
	}

	save() {
		this.preferenceService.directories = this.directories;
	}
}
