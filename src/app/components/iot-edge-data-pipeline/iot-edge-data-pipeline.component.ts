import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GraphService } from '../../services/graph/graph.service';
import { EdgeService } from '../../services/edge/edge.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Pipeline, DataStore, Protocol, Gateway, Device, Resource } from '../../shared/models/iot.model';
import { SelectionModel } from '@angular/cdk/collections';


interface DeviceNode {
  name: string;
  id: string;
  deviceResources?: DeviceNode[];
}

const TREE_DATA: DeviceNode[] = [
  {
    name: 'Fruit',
    id: 'abc',
    deviceResources: [
      { name: 'Apple', id: 'Fruit' },
      { name: 'Banana', id: 'Fruit' },
      { name: 'Fruit loops', id: 'Fruit' }
    ]
  }, {
    name: 'Vegetables',
    id: 'cde',
    deviceResources: [
      {
        name: 'Green', id: 'Vegetables'
      }
    ]
  },
];

@Component({
  selector: 'app-iot-edge-data-pipeline',
  templateUrl: './iot-edge-data-pipeline.component.html',
  styleUrls: ['./iot-edge-data-pipeline.component.css']
})
export class IotEdgeDataPipelineComponent implements OnInit {

  gatewayId = "";
  gateway = null as Gateway;

  // Form variables
  filteringForm: FormGroup;
  gatewayForm: FormGroup;

  deviceList: Device[] = [];
  deviceNodeList: DeviceNode[] = [];

  treeControl = new NestedTreeControl<DeviceNode>(node => node.deviceResources);
  devicesDataSource = new MatTreeNestedDataSource<DeviceNode>();

  /** The selection for checklist */
  checklistSelection = new SelectionModel<DeviceNode>(true /* multiple */);

  constructor(private graphService: GraphService,
    private edgeService: EdgeService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar) {

    // this.devicesDataSource.data = TREE_DATA;

    // console.log("Devices data source: ", this.devicesDataSource.data);
  }

  /**
   *
   */
  ngOnInit() {

    this.gatewayId = this.route.snapshot.paramMap.get('gatewayId');

    this.createForms();

    this.getGatewayAndDevices(this.gatewayId);
  }

  hasChild = (_: number, node: DeviceNode) => !!node.deviceResources && node.deviceResources.length > 0;

  /**
   * Create forms to configure filters, rules, models
   */
  createForms() {

    this.gatewayForm = this.formBuilder.group(
      {
        deviceNames: this.formBuilder.array([])
      }
    )

  }

  /**
 *
 */
  public getGatewayAndDevices(gatewayId: string) {
    console.log("Getting gateway for: ", gatewayId);

    this.graphService.getGateway(gatewayId)
      .subscribe(res => {
        console.log("Received response for graphService.getGatewayAndDataStores: ", res);
        this.gateway = res[0] as Gateway;

        // Get Devices to be used for filtering
        this.getDevices(this.gateway);

      })
  }

  getDevices(gateway) {
    console.log("In getDevices for: ", gateway);
    this.deviceList = [];
    this.deviceNodeList = [];
    this.edgeService.getDevices(gateway)
      .subscribe(res => {
        this.deviceList = res as Device[];

        console.log("Devices Returned in getDevices: ", res);

        // Add device to device node list
        res.forEach((dev, index) => {

          let resources = [];
          dev.profile.deviceResources.forEach((dr) => {

            resources.push({
              name: dr.name,
              id: dev.id
            })
          });

          // Add resources
          this.deviceNodeList.push({
            name: dev.name,
            id: dev.id,
            deviceResources: resources
          });
        });
        console.log("Updated device list: ", this.deviceList);
        console.log("updated device node list: ", this.deviceNodeList);

        this.devicesDataSource.data = null;
        this.devicesDataSource.data = this.deviceNodeList;
      })
  }


  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  leafItemSelectionToggle(node: DeviceNode): void {
    
    this.checklistSelection.toggle(node);

  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  itemSelectionToggle(node: DeviceNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));

  }


  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: DeviceNode): boolean {

    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: DeviceNode): boolean {

    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }
}
