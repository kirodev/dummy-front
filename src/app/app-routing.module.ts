import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FarLicencesComponent } from './far-licences/far-licences.component';
import { IpPortfoliosComponent } from './ip-portfolios/ip-portfolios.component';
import { RoiComponent } from './roi/roi.component';
import { ComparablesComponent } from './comparables/comparables.component';
import { MobileComponent } from './mobile/mobile.component';
import { AutomotiveComponent } from './automotive/automotive.component';
import { IotComponent } from './iot/iot.component';
import { SpiderChartComponent } from './spider-chart/spider-chart.component';
import { AdvMobileComponent } from './adv-mobile/adv-mobile.component';
import { AudiovisualComponent } from './audiovisual/audiovisual.component';
import { TopDownComponent } from './top-down/top-down.component';
import { SpiderChartResultComponent } from './spider-chart-result/spider-chart-result.component';
import { BottomUpComponent } from './bottom-up/bottom-up.component';
import { EstimateComponent } from './estimate/estimate.component';
import { Focallicences2Component } from './focallicences2/focallicences2.component';
import { LicenseTableComponent } from './license-table-component/license-table-component.component';
import { PaymentTableComponent } from './payment-table/payment-table.component';
import { SechomeComponent } from './sechome/sechome.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { BoardUserComponent } from './board-user/board-user.component';
import { BoardModeratorComponent } from './board-moderator/board-moderator.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { RegisterComponent } from './register/register.component';
import { SalesComponent } from './sales/sales.component';
import { RevenuesComponent } from './revenues/revenues.component';
import { LibraryComponent } from './library/library.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'adv-mobile', component: AdvMobileComponent },
  { path: 'mobile', component: MobileComponent },
  { path: 'top-down', component: TopDownComponent },
  { path: 'bottom-up', component: BottomUpComponent },
  { path: 'estimate', component: EstimateComponent },
  { path: 'spider-chart-result', component: SpiderChartResultComponent },
  {
    path: 'far-licences', component: FarLicencesComponent,
    children: [
      { path: 'mobile', component: MobileComponent },
      { path: 'automotive', component: AutomotiveComponent },
      { path: 'iot', component: IotComponent },
      { path: 'audiovisual', component: AudiovisualComponent },
      { path: '', redirectTo: 'mobile', pathMatch: 'full' }
    ]
  },
  { path: 'audiovisual', component: AudiovisualComponent },
  { path: 'automotive', component: AutomotiveComponent },
  { path: 'comparables/:dynamicTitle', component: ComparablesComponent },
  { path: 'iot', component: IotComponent },
  { path: 'ip-portfolios', component: IpPortfoliosComponent },
  { path: 'roi', component: RoiComponent },
  { path: 'spider-chart', component: SpiderChartComponent },
  { path: 'focallicences2/:dynamicTitle', component: Focallicences2Component },
  { path: 'license', component: LicenseTableComponent },
  { path: 'payment', component: PaymentTableComponent },
  { path: 'sechome', component: SechomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'user', component: BoardUserComponent },
  { path: 'mod', component: BoardModeratorComponent },
  { path: 'admin', component: BoardAdminComponent },
  { path: 'sales', component: SalesComponent },
  { path: 'revenues', component: RevenuesComponent },
  { path: 'library', component: LibraryComponent },


  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: '**', redirectTo: '/register', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
