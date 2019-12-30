import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsComponent } from './settings.component';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from '../shared/components';

const routes: Routes = [
	{
		path: '',
		component: SettingsComponent,
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
export class SettingsRoutingModule {}
