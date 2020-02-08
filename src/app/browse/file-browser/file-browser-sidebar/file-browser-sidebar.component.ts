import { Component, OnInit, Input } from "@angular/core";

import { BrowseService } from "../../browse.service";
import { FileNode, FolderNode } from "../../../lotor/kotor-types";

@Component({
	selector: "app-file-browser-sidebar",
	templateUrl: "./file-browser-sidebar.component.html",
	styleUrls: ["./file-browser-sidebar.component.scss"]
})
export class FileBrowserSidebarComponent implements OnInit {
	@Input() node: FolderNode;
	@Input() expanded: boolean;
	@Input() top: boolean = false;

	constructor(public browseService: BrowseService) {}

	ngOnInit() {}
}
