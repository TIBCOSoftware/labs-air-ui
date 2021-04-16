import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NodeService, ReteModule } from "rete-angular-render-plugin";
import { NumberNgControl } from "./controls/number-ng.control";
import { ImageControlDisplay } from './controls/image-control.display';
import { NodePrimaryComponent } from './nodes/node-primary/node-primary.component';

@NgModule({
  declarations: [
    NumberNgControl,
    ImageControlDisplay,
    NodePrimaryComponent
  ],
  providers: [NodeService],
  imports: [CommonModule, ReteModule]
})
export class ReteEditorModule {}