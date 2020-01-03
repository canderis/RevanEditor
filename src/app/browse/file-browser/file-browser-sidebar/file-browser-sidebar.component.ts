import { Component, OnInit, Input } from "@angular/core";
import { FileNode, KotorFile, Archive } from "../../../lotor/file-types/archive";

@Component({
	selector: "app-file-browser-sidebar",
	templateUrl: "./file-browser-sidebar.component.html",
	styleUrls: ["./file-browser-sidebar.component.scss"]
})
export class FileBrowserSidebarComponent implements OnInit {
	@Input() node: (Archive & KotorFile);
	@Input() expanded: boolean;

	constructor() {}

	ngOnInit() {}
}
