import { Component } from "@angular/core";
import { ElectronService } from "./core/services";
import { TranslateService } from "@ngx-translate/core";
import { AppConfig } from "../environments/environment";
let ipcRenderer = require('electron').ipcRenderer;

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	constructor(
		public electronService: ElectronService,
		private translate: TranslateService
	) {
		translate.setDefaultLang("en");
		console.log("AppConfig", AppConfig);

		if (electronService.isElectron) {
			console.log(process);
			console.log("Mode electron");
			console.log("Electron ipcRenderer", electronService.ipcRenderer);
			console.log("NodeJS childProcess", electronService.childProcess);
		} else {
			console.log("Mode web");
		}

		ipcRenderer.on('goto-pref', (event, arg) => {
            console.log('goto pref');
		});

		// const log = console.log;
		// console.log = (message?: any, ...optionalParams: any[]) => {
		// 	log('hello!')
		// 	log(message, ...optionalParams);
		// }
	}
}
