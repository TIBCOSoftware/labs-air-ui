import { Component, Input, OnInit } from '@angular/core';
import { GraphService } from '../../../services/graph/graph.service';

@Component({
  selector: 'app-ige-resources',
  templateUrl: './ige-resources.component.html',
  styleUrls: ['./ige-resources.component.css']
})
export class IgeResourcesComponent implements OnInit {

  @Input() gatewayId: string;

  constructor(private graphService: GraphService) { }

  ngOnInit(): void {
    this.getResources();

  }

  getResources() {
    this.graphService.getResources(this.gatewayId);
  }

}
