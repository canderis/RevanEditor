import { Component, ViewChild, ElementRef } from "@angular/core";
import {
	MatTreeFlatDataSource,
	MatTreeFlattener
} from "@angular/material/tree";
import { of as observableOf } from "rxjs";
import { FlatTreeControl } from "@angular/cdk/tree";
import { LotorService, KotorFileNode } from "../../lotor/lotor.service";
import { PreferenceService } from "../../shared/services/preference.service";
import { Game } from "../../lotor/game";
import { TPCLoader, TPCTexture } from "../../lotor/file-types/tpc";
import { KotorFile } from "../../lotor/file-types/archive";
import { writeTGA } from "../../lotor/file-types/tga";

/** File node data with possible child nodes. */
export interface FileNode {
	name: string;
	type: string;
	children?: FileNode[];
}

/**
 * Flattened tree node that has been created from a FileNode through the flattener. Flattened
 * nodes include level index and whether they can be expanded or not.
 */
export interface FlatTreeNode {
	name: string;
	type: string;
	level: number;
	expandable: boolean;
	file: KotorFile;
}

@Component({
	selector: "file-browser",
	templateUrl: "./file-browser.component.html",
	styleUrls: ["./file-browser.component.scss"]
})
export class FileBrowserComponent {
	/** The TreeControl controls the expand/collapse state of tree nodes.  */
	treeControl: FlatTreeControl<FlatTreeNode>;

	/** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
	treeFlattener: MatTreeFlattener<KotorFileNode, FlatTreeNode>;

	/** The MatTreeFlatDataSource connects the control and flattener to provide data. */
	dataSource: MatTreeFlatDataSource<KotorFileNode, FlatTreeNode>;

	selectedFile: FlatTreeNode = null;

	img: TPCTexture = null;

	@ViewChild("previewArea", { static: false }) previewArea: ElementRef;

	constructor(
		private lotorService: LotorService,
		private preferenceService: PreferenceService
	) {
		this.treeFlattener = new MatTreeFlattener(
			this.transformer,
			this.getLevel,
			this.isExpandable,
			this.getChildren
		);

		this.treeControl = new FlatTreeControl(
			this.getLevel,
			this.isExpandable
		);
		this.dataSource = new MatTreeFlatDataSource(
			this.treeControl,
			this.treeFlattener
		);

		const games: KotorFileNode[] = [];

		preferenceService.getPreferences().subscribe(pref => {
			pref.directories.forEach(directory => {
				const game = lotorService.openDir(directory);

				games.push(lotorService.getTree(game));
			});
			this.dataSource.data = games;
		});
	}

	/** Transform the data to something the tree can read. */
	transformer(node: KotorFileNode, level: number) {
		return {
			name: node.fileName,
			type: node.files ? "folder" : "file",
			level,
			expandable: node.files,
			file: node
		};
	}

	/** Get the level of the node */
	getLevel(node: any) {
		return node.level;
	}

	/** Get whether the node is expanded or not. */
	isExpandable(node: FlatTreeNode) {
		return node.expandable;
	}

	/** Get whether the node has children or not. */
	hasChild(index: number, node: FlatTreeNode) {
		return node.expandable;
	}

	/** Get the children for the node. */
	getChildren(node: any) {
		return observableOf(node.files);
	}

	clicked(node: FlatTreeNode) {
		console.log("node", node);
	}

	select(node: FlatTreeNode) {
		this.selectedFile = node;

		const buffer = this.selectedFile.file.extract();
		if (this.selectedFile.file.fileExtension === "tpc") {
			const tpcLoader = new TPCLoader();
			console.log(buffer);
			const f = tpcLoader.load(
				buffer,
				texture => {
					console.log(texture, this.previewArea, this.img);
					if (this.img) {
						this.previewArea.nativeElement.removeChild(this.img.image);
					}

					this.previewArea.nativeElement.appendChild(texture.image);

					this.img = texture;

					// writeTGA(texture.image, fileNames.filePath, { pixel_size: texture.pixelDepth });
				},
				error => {
					console.log(error);
				}
			);
			console.log(f);
		}
		console.log("select", node);
	}

	async extractTga() {

		const remote = require("electron").remote;
		const dialog = remote.dialog;
		const fs = require("fs");

		const fileNames = await dialog.showSaveDialog({
			defaultPath: `${this.selectedFile.name.substr(0, this.selectedFile.name.length - 3)}tga`
		});

		if (!fileNames) {
			return false;
		}

		writeTGA(this.img.image, fileNames.filePath, {
			pixel_size: this.img.pixelDepth
		});
	}

	async extract() {
		console.log(this.selectedFile);

		const remote = require("electron").remote;
		const dialog = remote.dialog;
		const fs = require("fs");

		const fileNames = await dialog.showSaveDialog({
			defaultPath: this.selectedFile.name
		});

		if (!fileNames) {
			return false;
		}

		const buffer = this.selectedFile.file.extract();

		// if (this.selectedFile.file.fileExtension === "tpc" && this.img) {
		// 	// const tpcLoader = new TPCLoader();
		// 	// console.log(buffer);
		// 	// const f = tpcLoader.load(
		// 	// 	buffer,
		// 	// 	texture => {
		// 	// 		console.log(texture);
		// 			writeTGA(this.img.image, fileNames.filePath, {
		// 				pixel_size: this.img.pixelDepth
		// 			});
		// 	// 	},
		// 	// 	error => {
		// 	// 		console.log(error);
		// 	// 	}
		// 	// );
		// 	// console.log(f);
		// } else {
			fs.writeFileSync(fileNames.filePath, buffer);
		// }
	}
}
