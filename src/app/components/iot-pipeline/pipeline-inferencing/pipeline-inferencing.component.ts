import { Component, OnChanges, OnInit, Input, SimpleChanges } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';

import { NestedTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '../../../services/graph/graph.service';

import { Device, FiltersConfig, Gateway, Model } from '../../../shared/models/iot.model';
import { FormGroup } from '@angular/forms';
import { platform } from 'chart.js';

export interface SelectItem {
  value: string;
  viewValue: string;
}

interface DeviceNode {
  name: string;
  parent: string;
  deviceResources?: DeviceNode[];
}

@Component({
  selector: 'app-pipeline-inferencing',
  templateUrl: './pipeline-inferencing.component.html',
  styleUrls: ['./pipeline-inferencing.component.css']
})
export class PipelineInferencingComponent implements OnInit, OnChanges  {

 
  @Input() devices: Device[];
  @Input() models: Model[];
  @Input() modelForm: FormGroup;
  @Input() filters: any[];

  logLevels: SelectItem[] = [
    { value: 'INFO', viewValue: 'INFO' },
    { value: 'WARN', viewValue: 'WARN' },
    { value: 'ERROR', viewValue: 'ERROR' },
    { value: 'DEBUG', viewValue: 'DEBUG' }
  ];
  
  deviceNodeList: DeviceNode[] = [];

  filtersConfig: FiltersConfig[] = [];

  treeControl = new NestedTreeControl<DeviceNode>(node => node.deviceResources);
  devicesDataSource = new MatTreeNestedDataSource<DeviceNode>();

  /** The selection for checklist */
  checklistSelection = new SelectionModel<DeviceNode>(true /* multiple */);

  constructor(private edgeService: EdgeService,
    private graphService: GraphService) {

  }

  ngOnInit(): void {
    // this.devicesDataSource.data = TREE_DATA;
    this.initializeDataSource();

    console.log("PipelineInferencing - ngOnInit - devices: ", this.devices);

    this.onFormChanges();
  }

  ngOnChanges(changes: SimpleChanges) {

    this.initializeDataSource();

    console.log("PipelineInferencing - ngOnChanges - devices: ", this.devices);

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
      this.setupFilters();
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

    })

    // for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
    //   if(!this.checklistSelection.isSelected(this.treeControl.dataNodes[i]))
    //     this.checklistSelection.toggle(this.treeControl.dataNodes[i]);
    //   this.treeControl.expand(this.treeControl.dataNodes[i])
    // }

  }

  onModelSelected(event) {
    let model = this.getModelById(event.value);

    this.setForm(model);
  }

  getModelById(id) {
    let model = null;

    for (let i = 0; i < this.models.length; i++) {
      if (this.models[i].name == id) {
        model = this.models[i];
        break;
      }
    }

    return model;

  }

  setForm(model) {

    console.log("Selected model: ", model.name);

    // Update model Form
    this.modelForm.patchValue(
      {
        name: model.name,
        description: model.description,
        inputType: model.inputType,
        url: model.url,
        platform: model.platform
      },
      { emitEvent: false }
    );

  }

  onFormChanges(): void {
    this.modelForm.valueChanges.subscribe(val => {
      console.log("modelForm has changed for: ", val);

      if (this.modelForm.get('name').value == "") {


      }

    });
  }

  getFilters(): any {
    console.log("PipelineInferencing-Getting filters");

    let filters = [];

    for (let item of this.checklistSelection.selected) {
      console.log("Filtered item: ", item.name, item.parent);

      if (item.parent != "ROOT") {
        let filter = {
          "device": item.parent,
          "name": item.name
        };
        filters.push(filter);
      }
    }

    return filters;

  }

  setupFilters() {
    console.log("PipelineInferencing-setupFilters:", this.filters);
    

    this.filters.forEach(element => {
      this.selectNode(element.device, element.name);
    });
  }

}