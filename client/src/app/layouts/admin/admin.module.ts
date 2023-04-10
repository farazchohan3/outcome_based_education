import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AttainmentComponent } from '../../sub-layouts/attainment/attainment.component';
import { HomeComponent } from '../../pages/home/home.component';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { CurriculumComponent } from 'src/app/sub-layouts/curriculum/curriculum.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UsersComponent } from '../../pages/users/users.component';
import { AssessmentsComponent } from '../../pages/assessments/assessments.component';
import { AttainmentModule } from 'src/app/sub-layouts/attainment/attainment.module';
import { CurriculumModule } from 'src/app/sub-layouts/curriculum/curriculum.module';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  declarations: [
    CurriculumComponent,
    AttainmentComponent,
    HomeComponent,
    DashboardComponent,
    UserProfileComponent,
    UsersComponent,
    AssessmentsComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AttainmentModule,
    CurriculumModule,
    ComponentsModule,
    NgbModule
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule { }
