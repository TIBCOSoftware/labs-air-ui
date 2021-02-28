import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReteModule } from "rete-angular-render-plugin";
import { NumberNgControl } from "./controls/number-ng.control";
import { ImageControlDisplay } from './controls/image-control.display';

@NgModule({
  declarations: [
    NumberNgControl,
    ImageControlDisplay
  ],
  imports: [CommonModule, ReteModule],
  exports: [ReteModule]
})
export class ReteEditorModule {}