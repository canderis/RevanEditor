import { Component, OnInit, Input } from "@angular/core";
import { KotorFile, Archive } from "../../../lotor/file-types/archive";
import { BrowseService } from "../../browse.service";

@Component({
	selector: "app-file-browser-sidebar",
	templateUrl: "./file-browser-sidebar.component.html",
	styleUrls: ["./file-browser-sidebar.component.scss"]
})
export class FileBrowserSidebarComponent implements OnInit {
	@Input() node: (Archive & KotorFile);
	@Input() expanded: boolean;
	@Input() top: boolean = false;

	constructor(public browseService: BrowseService) {}

	ngOnInit() {}
}
