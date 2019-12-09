import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileBrowserComponent } from './file-browser/file-browser.component';
import { AngularSplitModule } from 'angular-split';
import { SharedModule } from '../shared/shared.module';
import { BrowseRoutingModule } from './browse-routing.module';

@NgModule({
	declarations: [FileBrowserComponent],
	imports: [CommonModule,  SharedModule, BrowseRoutingModule, AngularSplitModule.forRoot()]
})
export class BrowseModule {}
