import { Control } from "rete";
import { AngularControl } from "rete-angular-render-plugin";
import { Type } from "@angular/core";
import { ImageControlDisplay } from "./image-control.display";

export class ImageControl extends Control implements AngularControl {
    component: Type<ImageControlDisplay>;
    props: { [key: string]: unknown };

    constructor(public emitter, public key, public imageName, readonly = false) {
        super(key);

        console.log("ImageControl key:" , key);
        // console.log("Image control get data:", this.getData(key));
        console.log("ImageControl data:", this.data);
        

        this.component = ImageControlDisplay;
        this.props = {
            readonly,
            change: v => this.onChange(v),
            imageName: imageName,
            value: 0,
            mounted: () => {
                console.log("ImageControl mounted");
                
                this.setValue(+(this.getData(key) as any) || 0);
            }
        };
    }

    onChange(val: number) {
        this.setValue(val);
        this.emitter.trigger("process");
    }

    setValue(val: number) {
        this.props.value = +val;
        this.putData(this.key, this.props.value);
    }
}
