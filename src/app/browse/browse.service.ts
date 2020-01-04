import { Injectable } from "@angular/core";
import { KotorFile } from "../lotor/file-types/archive";
import { TPCLoader } from "../lotor/file-types/tpc";

@Injectable({
	providedIn: "root"
})
export class BrowseService {
	selectedFile: KotorFile;

	constructor() {}


}
