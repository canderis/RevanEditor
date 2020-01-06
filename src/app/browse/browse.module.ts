import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileBrowserComponent } from './file-browser/file-browser.component';
import { AngularSplitModule } from 'angular-split';
import { SharedModule } from '../shared/shared.module';
import { BrowseRoutingModule } from './browse-routing.module';
import { FileBrowserSidebarComponent } from './file-browser/file-browser-sidebar/file-browser-sidebar.component';
import { FileTabsComponent } from './file-browser/file-tabs/file-tabs.component';
import { TpcEditorComponent } from './file-browser/file-tabs/editors/tpc-editor/tpc-editor.component';
import { NoEditorComponent } from './file-browser/file-tabs/editors/no-editor/no-editor.component';
import { TextEditorComponent } from './file-browser/file-tabs/editors/text-editor/text-editor.component';

@NgModule({
	declarations: [FileBrowserComponent, FileBrowserSidebarComponent, FileTabsComponent, TpcEditorComponent, NoEditorComponent, TextEditorComponent],
	imports: [CommonModule,  SharedModule, BrowseRoutingModule, AngularSplitModule.forRoot()]
})
export class BrowseModule {}
