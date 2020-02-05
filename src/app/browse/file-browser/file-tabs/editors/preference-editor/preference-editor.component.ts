import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { PreferenceService } from "../../../../../shared/services/preference.service";

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
		const remote = require("electron").remote;

		const dialog = remote.dialog;
		dialog.showOpenDialog(
			{ properties: ["openDirectory"], title: "Browse for game" },
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
		this.preferenceService.directories = this.directories;
	}
}
