import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FarLicencesComponent } from './far-licences/far-licences.component';
import { IpPortfoliosComponent } from './ip-portfolios/ip-portfolios.component';
import { RoiComponent } from './roi/roi.component';
import { MobileComponent } from './mobile/mobile.component';
import { AutomotiveComponent } from './automotive/automotive.component';
import { CommonModule } from '@angular/common';
import { SpiderChartComponent } from './spider-chart/spider-chart.component';
import { AdvMobileComponent } from './adv-mobile/adv-mobile.component';
import { AudiovisualComponent } from './audiovisual/audiovisual.component';
import { TopDownComponent } from './top-down/top-down.component';
import { SpiderChartResultComponent } from './spider-chart-result/spider-chart-result.component';
import { DataSharingService } from './data-sharing-service.service';
import { BottomUpComponent } from './bottom-up/bottom-up.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { PopupDialogComponent } from './popup-dialog/popup-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { EstimateComponent } from './estimate/estimate.component';
import { Focallicences2Component } from './focallicences2/focallicences2.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LicenseTableComponent } from './license-table-component/license-table-component.component';
import { ExamplePdfViewerComponent } from './example-pdf-viewer/example-pdf-viewer.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PaymentTableComponent } from './payment-table/payment-table.component';
import { SechomeComponent } from './sechome/sechome.component';
import { FeedbackPopupComponent } from './feedback-popup/feedback-popup.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SalesComponent } from './sales/sales.component';
import { RevenuesComponent } from './revenues/revenues.component';
import { LibraryComponent } from './library/library.component';
import { KeysPipe } from './keys.pipe';
import { NotFoundComponent } from './not-found/not-found.component';
import { EquationsPaymentsComponent } from './equations-payments/equations-payments.component';
import { KnownlicensesComponent } from './knownlicenses/knownlicenses.component';
import { CloudinaryModule } from '@cloudinary/ng';
import { QuarterlyRevenuesComponent } from './quarterly-revenues/quarterly-revenues.component';
import { SafePipe } from './safe-pipe.pipe';
import { LIBComponent } from './lib/lib.component';
import { LicensingRevenuesComponent } from './licensing-revenues/licensing-revenues.component';
import { TimelineOverviewComponent } from './timelineoverview/timelineoverview.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FarLicencesComponent,
    IpPortfoliosComponent,
    RoiComponent,
    MobileComponent,
    AutomotiveComponent,
    AdvMobileComponent,
    AudiovisualComponent,
    SpiderChartComponent,
    SpiderChartResultComponent,
    TopDownComponent,
    BottomUpComponent,
    PopupDialogComponent,
    EstimateComponent,
    Focallicences2Component,
    LicenseTableComponent,
    ExamplePdfViewerComponent,
    PaymentTableComponent,
    SechomeComponent,
    FeedbackPopupComponent,
    LoginComponent,
    RegisterComponent,
    SalesComponent,
    RevenuesComponent,
    LibraryComponent,
    KeysPipe,
    NotFoundComponent,
    EquationsPaymentsComponent,
    KnownlicensesComponent,
    QuarterlyRevenuesComponent,
    LIBComponent,
    SafePipe,
    LicensingRevenuesComponent,
    TimelineOverviewComponent,
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatDialogModule,
    FormsModule,
    HttpClientModule,
    NgxExtendedPdfViewerModule,
    CloudinaryModule,
  ],
  providers: [DataSharingService, LicenseTableComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
