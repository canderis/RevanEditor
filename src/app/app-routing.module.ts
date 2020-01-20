import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'browse',
		pathMatch: 'full'
	},
	{
		path: 'settings',
		loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
	},
	{
		path: 'browse',
		loadChildren: () => import('./browse/browse.module').then(m => m.BrowseModule),
	},
	{
		path: '**',
		component: PageNotFoundComponent
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	exports: [RouterModule]
})
export class AppRoutingModule {}
