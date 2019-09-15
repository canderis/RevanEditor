import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';



@NgModule({
	declarations: [PageNotFoundComponent, WebviewDirective],
	imports: [
		CommonModule,
		TranslateModule,
		MatToolbarModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatCardModule
	],
	exports: [
		TranslateModule,
		WebviewDirective,
		MatToolbarModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatCardModule
	]
})
export class SharedModule {}
