import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomepageComponent} from "./pages/homepage/homepage.component";
import {NotfoundComponent} from "./pages/notfound/notfound.component";
import {VerifyEmailComponent} from "./pages/verify-email/verify-email.component";
import {ResetPasswordComponent} from "./pages/reset-password/reset-password.component";

const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomepageComponent },
  // precisa vir antes de ':id'
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: ':id', component: HomepageComponent },
  {
    path: '404',
    component: NotfoundComponent,
  },
  {
    path: '**',
    redirectTo: '/404',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
