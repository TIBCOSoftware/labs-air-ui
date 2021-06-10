import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { StarterAppComponent } from './routes/starter-app/starter-app.component';
import { SplashComponent } from './routes/splash/splash.component';

import {HomeComponent} from './routes/home/home.component';
import { IotHomeCockpitComponent } from './components/iot-home-cockpit/iot-home-cockpit.component';
import { IotGatewayComponent } from './components/iot-gateway/iot-gateway.component';

@NgModule({
  declarations: [
    AppComponent,

    StarterAppComponent,
    SplashComponent,
    HomeComponent,
    IotHomeCockpitComponent,
    IotGatewayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
