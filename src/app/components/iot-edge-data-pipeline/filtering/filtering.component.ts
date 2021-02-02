import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NestedTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '../../../services/graph/graph.service';

import { Device, Filter, FiltersConfig, Gateway, GatewayFiltersConfig } from '../../../shared/models/iot.model';

interface DeviceNode {
  name: string;
  parent: string;
  deviceResources?: DeviceNode[];
}

const TREE_DATA: DeviceNode[] = [
  {
    name: 'Fruit',
    parent: 'ROOT',
    deviceResources: [
      { name: 'Apple', parent: 'Fruit' },
      { name: 'Banana', parent: 'Fruit' },
      { name: 'Fruit loops', parent: 'Fruit' }
    ]
  }, {
    name: 'Vegetables',
    parent: 'ROOT',
    deviceResources: [
      {
        name: 'Green', parent: 'Vegetables'
      }
    ]
  },
];

@Component({
  selector: 'app-filtering',
  templateUrl: './filtering.component.html',
  styleUrls: ['./filtering.component.css']
})
export class FilteringComponent implements OnInit, OnChanges {

  @Input() devices: Device[];
  @Input() gateway: Gateway;

  deviceNodeList: DeviceNode[] = [];
  gatewayFiltersConfig: GatewayFiltersConfig = {
    uid: 0,
    deviceNames: ""
  };

  applyDisabled = true;

  filtersConfig: FiltersConfig[] = [];

  treeControl = new NestedTreeControl<DeviceNode>(node => node.deviceResources);
  devicesDataSource = new MatTreeNestedDataSource<DeviceNode>();

  /** The selection for checklist */
  checklistSelection = new SelectionModel<DeviceNode>(true /* multiple */);

  constructor(private edgeService: EdgeService,
    private graphService: GraphService,
    private _snackBar: MatSnackBar) {

  }

  ngOnInit(): void {
    // this.devicesDataSource.data = TREE_DATA;
    this.initializeDataSource();

    console.log("Devices used in initialize: ", this.devices);

  }

  ngOnChanges(changes: SimpleChanges) {

    this.initializeDataSource();

  }

  hasChild = (_: number, node: DeviceNode) => !!node.deviceResources && node.deviceResources.length > 0;

  initializeDataSource() {

    console.log("Devices used in initialize: ", this.devices);

    // Clear deviceNodeList
    this.deviceNodeList = [];

    // Add device to device node list
    this.devices.forEach((dev, index) => {

      let resources = [];
      dev.profile.deviceResources.forEach((dr) => {

        resources.push({
          name: dr.name,
          parent: dev.name
        })
      });

      // Add resources
      this.deviceNodeList.push({
        name: dev.name,
        parent: "ROOT",
        deviceResources: resources
      });
    });

    console.log("updated device node list: ", this.deviceNodeList);

    // this.devicesDataSource.data = null;
    this.devicesDataSource.data = this.deviceNodeList;

    // Get filters config when devices available
    if (this.devices.length > 0)
      this.getFiltersConfig();
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  leafItemSelectionToggle(node: DeviceNode): void {

    this.checklistSelection.toggle(node);

    this.applyDisabled = false;

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

    this.applyDisabled = false;

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

  getFiltersConfig() {

    this.graphService.getFiltersConfig(this.gateway.uuid)
      .subscribe(res => {
        
        console.log("FiltersConfig received: ", res);
        
        if (res.length > 0) {
          let config = res[0] as GatewayFiltersConfig;

          this.gatewayFiltersConfig.uid = config.uid;

          if (this.gatewayFiltersConfig.deviceNames != config.deviceNames) {
            this.gatewayFiltersConfig.deviceNames = config.deviceNames;
            
            // Update tree selection
            this.updateFiltersTreeSelection(this.gatewayFiltersConfig.deviceNames);

            this.applyDisabled = false;
          }
        }
        else {
          this.gatewayFiltersConfig.uid = 0;

          if (this.gatewayFiltersConfig.deviceNames != "") {
            
            // Update tree selection
            this.updateFiltersTreeSelection(this.gatewayFiltersConfig.deviceNames);

            this.applyDisabled = false;
          }
        }

      })
  }

  

  applyFilters() {
    console.log("Applying filters");

    let filters = [];
    let deviceNames = "";

    for (let item of this.checklistSelection.selected) {
      console.log("Filtered item: ", item.name, item.parent);

      if (item.parent != "ROOT") {
        let filter = {
          "device": item.parent,
          "resource": item.name
        };

        filters.push(filter);

        if (deviceNames != "")
          deviceNames = deviceNames + "|"
        deviceNames = deviceNames + item.parent + "|" + item.name;
      }
    }

    this.gatewayFiltersConfig.deviceNames = deviceNames;

    // Check if add to graph is needed.  Otherwise, update
    if (this.gatewayFiltersConfig.uid == 0) {
      this.graphService.addFiltersConfig(this.gateway.uid, this.gatewayFiltersConfig)
        .subscribe(res => {
          console.log("Result from add filtersConfig to dgraph", res);
        });
    }
    else {
      this.graphService.updateFiltersConfig(this.gatewayFiltersConfig)
        .subscribe(res => {
          console.log("Result from update filtersConfig to dgraph", res);
        });
    }

    let filtersConfig = new FiltersConfig();

    filtersConfig.filters = filters;

    console.log("Filters config: ", filtersConfig)

    this.edgeService.setFiltersConfig(this.gateway, filtersConfig)
      .subscribe(res => {
        console.log("Result from setting filtersConfig: ", res);

        let message = 'Success'
        if (res == undefined) {
          message = 'Failure';
        }

        this._snackBar.open(message, "Set Filters Config", {
          duration: 3000,
        });

      });

    this.applyDisabled = true;

  }

  updateFiltersTreeSelection(deviceNames: string) {

    console.log("updateFiltersTreeSelection: ", deviceNames);
    

    let splitted = deviceNames.split("|");
    let nunFilters = splitted.length;

    for (let i = 0; i < nunFilters; i = i +  2) {
      console.log ("processing filter: ", splitted[i], " ", splitted[i+1]);

      this.selectNode(splitted[i], splitted[i+1])
    }    

  }

  selectNode(parent: string, name: string) {

    console.log("selectNode: ", parent, " ", name);
    console.log("deviceDataSource.data: ", this.devicesDataSource.data);
    console.log("deviceDataSource.data length: ", this.devicesDataSource.data.length);
    console.log("deviceDataSource.data[0]: ", this.devicesDataSource.data[0]);

    console.log("deviceNodeList length: ", this.deviceNodeList.length);
    console.log("deviceNodeList[0]: ", this.deviceNodeList[0]);

    for(const parentNode of this.devicesDataSource.data) {

      console.log("comparing to parentNode: ", parentNode.name, " ", parent);
      if (parentNode.name == parent) {

        for (const node of parentNode.deviceResources) {

          console.log("comparing to node: ", node);
  
          if (node.parent == parent && node.name == name) {
  
            console.log("found node and updating if not selected");
            
    
            if (!this.checklistSelection.isSelected(node)) {
              console.log("selecting node: ", node);
              
              this.checklistSelection.toggle(node);
            }
            break;
          }
        }
      }
    }
  }

  unselectAll() {

    this.devicesDataSource.data.forEach((node) => {

      if (this.checklistSelection.isSelected(node)) {
        this.checklistSelection.toggle(node);
      }

      const descendants = this.treeControl.getDescendants(node);
      this.checklistSelection.deselect(...descendants);

      // Force update for the parent
      descendants.forEach(child => this.checklistSelection.isSelected(child));

      this.treeControl.expand(node);

      this.applyDisabled = false;

    })

    // for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
    //   if (this.checklistSelection.isSelected(this.treeControl.dataNodes[i]))
    //     this.checklistSelection.deselect(this.treeControl.dataNodes[i]);

    //   this.treeControl.expand(this.treeControl.dataNodes[i])
    // }
  }

  selectAll() {

    this.devicesDataSource.data.forEach((node) => {

      if (!this.checklistSelection.isSelected(node)) {
        this.checklistSelection.toggle(node);
      }

      const descendants = this.treeControl.getDescendants(node);
      this.checklistSelection.select(...descendants);

      // Force update for the parent
      descendants.forEach(child => this.checklistSelection.isSelected(child));

      this.treeControl.expand(node);

      this.applyDisabled = false;

    })

    // for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
    //   if(!this.checklistSelection.isSelected(this.treeControl.dataNodes[i]))
    //     this.checklistSelection.toggle(this.treeControl.dataNodes[i]);
    //   this.treeControl.expand(this.treeControl.dataNodes[i])
    // }

  }
}
