import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StartPageComponent } from './start-page/start-page.component';
import { RulesPageComponent } from './rules-page/rules-page.component';
import { CharacterNameComponent } from './character-name/character-name.component';

const routes: Routes = [
  { path: '', component: StartPageComponent },
  { path: 'rules', component: RulesPageComponent },
  { path: 'character-name', component: CharacterNameComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
