import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {StarterAppComponent} from './routes/starter-app/starter-app.component';
import { SplashComponent } from './routes/splash/splash.component';

@NgModule({
  declarations: [
    AppComponent,

    StarterAppComponent,
    SplashComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
