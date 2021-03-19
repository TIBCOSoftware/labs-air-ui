import { Component, Input } from '@angular/core';

@Component({
  template: `
  <img  class="rete-image" [src]="imageUrl"/>
  `,
  styles: [
    `
      input {
        border-radius: 30px;
        background-color: white;
        padding: 2px 6px;
        border: 1px solid #999;
        font-size: 110%;
        width: 140px;
        box-sizing: border-box;
      }

      .rete-image {
        filter: invert(100%) sepia(6%) saturate(2%) hue-rotate(297deg) brightness(106%) contrast(100%);
        // greens
        // filter: invert(89%) sepia(10%) saturate(1779%) hue-rotate(54deg) brightness(102%) contrast(96%);
        // filter: invert(86%) sepia(21%) saturate(761%) hue-rotate(92deg) brightness(99%) contrast(107%);
        // to black
        // filter: invert(1);
        // or to blue
        // filter: invert(1) sepia(1) saturate(5) hue-rotate(175deg);
      }
    `
  ]
})
export class ImageControlDisplay {
  @Input() value: number;
  @Input() readonly: boolean;
  @Input() imageName: string;
  @Input() change: Function;
  @Input() mounted: Function;

  imageUrl = '';

  ngOnInit() {
    console.log("ImageControlDisplay Initializing control with: ", this.value);
    this.imageUrl = '/assets/img/' + this.imageName;
    this.mounted();
  }

}
