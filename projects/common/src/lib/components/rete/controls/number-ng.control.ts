import { Component, Input, OnInit } from '@angular/core';

@Component({
    template: `
    <input
      type="number"
      [value]="value"
      [readonly]="readonly"
      (change)="change(+$event.target)"
    />
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
    `
    ]
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class NumberNgControl implements OnInit {
  @Input() value: number;
  @Input() readonly: boolean;
  @Input() change: Function;
  @Input() mounted: Function;
  ngOnInit() {
      this.mounted();
  }
}
