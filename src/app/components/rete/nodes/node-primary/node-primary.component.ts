import { Component, ChangeDetectorRef, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { NodeEditor, Node, Input as ReteInput, Output as ReteOutput, Control as ReteControl } from 'rete';
import { NodeComponent, NodeService,  } from 'rete-angular-render-plugin';

@Component({
  selector: 'app-node-primary',
  templateUrl: './node-primary.component.html',
  styleUrls: ['./node-primary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodePrimaryComponent extends NodeComponent implements OnInit {
  @Input() editor!: NodeEditor;
  @Input() node!: Node;
  @Input() bindSocket!: Function;
  @Input() bindControl!: Function;

  constructor(protected nodeService: NodeService, protected cdr: ChangeDetectorRef) {
    super(nodeService, cdr);
  }

  ngOnInit(): void {
    this.service.setBindings(this.bindSocket, this.bindControl);
    this.node.update = () => this.cdr.detectChanges();
  }

  Inputs() {
    return Array.from(this.node.inputs.values());
  }

  Outputs() {
    return Array.from(this.node.outputs.values());
  }

  Controls() {
    return Array.from(this.node.controls.values());
  }

  selected() {
    return this.editor.selected.contains(this.node) ? 'selected' : '';
  }

}
