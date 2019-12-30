import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from '../shared/components';
import { FileBrowserComponent } from './file-browser/file-browser.component';

const routes: Routes = [
	{
		path: '',
		component: FileBrowserComponent,
		pathMatch: 'full',
	},
	{
		path: '**',
		component: PageNotFoundComponent
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class BrowseRoutingModule {}
