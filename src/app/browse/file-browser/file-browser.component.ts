import { Component } from '@angular/core';
import {
	MatTreeFlatDataSource,
	MatTreeFlattener
} from '@angular/material/tree';
import { of as observableOf } from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { LotorService } from '../../lotor/lotor.service';
import { PreferenceService } from '../../shared/services/preference.service';
import { Game } from '../../lotor/game';

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
}

@Component({
	selector: 'file-browser',
	templateUrl: './file-browser.component.html',
	styleUrls: ['./file-browser.component.scss']
})
export class FileBrowserComponent {
	/** The TreeControl controls the expand/collapse state of tree nodes.  */
	treeControl: FlatTreeControl<FlatTreeNode>;

	/** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
	treeFlattener: MatTreeFlattener<FileNode, FlatTreeNode>;

	/** The MatTreeFlatDataSource connects the control and flattener to provide data. */
	dataSource: MatTreeFlatDataSource<FileNode, FlatTreeNode>;

	constructor(private lotorService: LotorService, private preferenceService: PreferenceService) {
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

		const games: any[] = [];

		preferenceService.getPreferences().subscribe(pref => {
			pref.directories.forEach(directory => {
				const game = lotorService.openDir(directory);

				games.push(game.getTree());

			});
			this.dataSource.data = games as FileNode[];
		});


	}

	/** Transform the data to something the tree can read. */
	transformer(node: any, level: number) {
		return {
			name: node.fileName,
			type: node.files ? 'folder' : 'file',
			level: level,
			expandable: node.files
		};
	}

	/** Get the level of the node */
	getLevel(node: FlatTreeNode) {
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
}
