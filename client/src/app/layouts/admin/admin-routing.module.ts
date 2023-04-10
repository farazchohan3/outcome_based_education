import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from 'src/app/pages/dashboard/dashboard.component';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { UserProfileComponent } from 'src/app/pages/user-profile/user-profile.component';
import { UsersComponent } from 'src/app/pages/users/users.component';
import { AssessmentsComponent } from 'src/app/pages/assessments/assessments.component';
import { AttainmentComponent } from 'src/app/sub-layouts/attainment/attainment.component';
import { CurriculumComponent } from 'src/app/sub-layouts/curriculum/curriculum.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'faculty', component: UsersComponent },
  { path: 'assessments', component: AssessmentsComponent },
  {
    path: 'curriculum',
    component: CurriculumComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./../../sub-layouts/curriculum/curriculum.module').then(e => e.CurriculumModule)
      }
    ]
  },
  {
    path: 'attainment',
    component: AttainmentComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./../../sub-layouts/attainment/attainment.module').then(e => e.AttainmentModule)
      }
    ]
  },
  { path: 'profile', component: UserProfileComponent },
  { path: 'change-password', component: UserProfileComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
