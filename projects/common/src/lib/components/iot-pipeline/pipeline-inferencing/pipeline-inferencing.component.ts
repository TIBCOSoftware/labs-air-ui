import { Component, OnChanges, OnInit, Input, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';

import { NestedTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

import { Device, FiltersConfig, ModelConfig } from '../../../models/iot.model';
import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Model } from '@TIBCOSoftware/labs-air-graph-client';
import { debounceTime, distinctUntilChanged, Observable, Subscription } from 'rxjs';

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
    selector: 'app-common-pipeline-inferencing',
    templateUrl: './pipeline-inferencing.component.html',
    styleUrls: ['./pipeline-inferencing.component.css']
})
export class PipelineInferencingComponent implements OnInit, OnChanges, OnDestroy {


    @Input() devices: Device[];
    @Input() models: Model[];
    @Input() filters: any[];
    @Input() model: any;
    @Output() formUpdatedEvent = new EventEmitter<Model>();
    formChangeSubscription: Subscription;
    modelForm: FormGroup;
    @Input() nodeChangeEvent: Observable<any>;
    nodeChangeSubscription: Subscription;

    // Added to prevent compile error in oss version
    activeNode: Node;

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
        private graphService: GraphService,
        private formBuilder: FormBuilder) {

    }

    ngOnInit(): void {
        // this.devicesDataSource.data = TREE_DATA;
        this.initForm();
        this.initializeDataSource();
        console.log('PipelineInferencing - ngOnInit - devices: ', this.devices);
        this.onFormChanges();
        if (this.model) {
            this.updateInferencingForm(this.model.data['customdata']);
        }
    }

    ngOnDestroy(): void {
        this.formChangeSubscription.unsubscribe();
        this.nodeChangeSubscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log('PipelineInferencing - ngOnChanges - devices: ', this.devices);
        this.initializeDataSource();
    }

    hasChild = (_: number, node: DeviceNode) => !!node.deviceResources && node.deviceResources.length > 0;

    initializeDataSource() {

        console.log('Devices used in initialize: ', this.devices);

        // Clear deviceNodeList
        this.deviceNodeList = [];

        // Add device to device node list
        this.devices.forEach((dev, index) => {

            const resources = [];
            dev.profile.deviceResources.forEach((dr) => {

                resources.push({
                    name: dr.name,
                    parent: dev.name
                });
            });

            // Add resources
            this.deviceNodeList.push({
                name: dev.name,
                parent: 'ROOT',
                deviceResources: resources
            });
        });

        console.log('updated device node list: ', this.deviceNodeList);

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

        console.log('selectNode: ', parent, ' ', name);
        console.log('deviceDataSource.data: ', this.devicesDataSource.data);
        console.log('deviceDataSource.data length: ', this.devicesDataSource.data.length);
        console.log('deviceDataSource.data[0]: ', this.devicesDataSource.data[0]);

        console.log('deviceNodeList length: ', this.deviceNodeList.length);
        console.log('deviceNodeList[0]: ', this.deviceNodeList[0]);

        for (const parentNode of this.devicesDataSource.data) {

            console.log('comparing to parentNode: ', parentNode.name, ' ', parent);
            if (parentNode.name == parent) {

                for (const node of parentNode.deviceResources) {

                    console.log('comparing to node: ', node);

                    if (node.parent == parent && node.name == name) {

                        console.log('found node and updating if not selected');


                        if (!this.checklistSelection.isSelected(node)) {
                            console.log('selecting node: ', node);

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

        });

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

        });

        // for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
        //   if(!this.checklistSelection.isSelected(this.treeControl.dataNodes[i]))
        //     this.checklistSelection.toggle(this.treeControl.dataNodes[i]);
        //   this.treeControl.expand(this.treeControl.dataNodes[i])
        // }

    }

    onModelSelected(event) {
        const model = this.getModelById(event.value);
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
        console.log('Selected model: ', model.name);
        // Update model Form
        this.modelForm.patchValue(
            {
                name: model.name,
                description: model.description,
                inputType: model.inputType,
                url: model.url,
                inputTemplate: model.inputTemplate,
                method: model.method,
                base64Encoded: model.base64Encoded
            },
            { emitEvent: false }
        );
        const modelHeaderObjArray = JSON.parse(atob(model.headers))
        const formGroups = modelHeaderObjArray.map(y => this.formBuilder.group(y)) as [];
        const formGroupsArray = this.formBuilder.array(formGroups) as FormArray;
        const headers = new FormArray([]);
        headers.push(formGroupsArray);
        this.modelForm.setControl('headers', headers);
    }

    onFormChanges(): void {
        this.nodeChangeSubscription = this.nodeChangeEvent.subscribe(node => {
            this.updateInferencingForm(node.data['customdata']);
        });

        this.formChangeSubscription = this.modelForm.valueChanges.pipe(
            debounceTime(200),
            distinctUntilChanged()
        )
        .subscribe( () => {
            console.log('Emitting', this.modelForm.value);
            this.formUpdatedEvent.emit(this.modelForm.value)
        });
    }

    getFilters(): any {
        console.log('PipelineInferencing-Getting filters');

        const filters = [];

        for (const item of this.checklistSelection.selected) {
            console.log('Filtered item: ', item.name, item.parent);

            if (item.parent != 'ROOT') {
                const filter = {
                    'deviceName': item.parent,
                    'resourceName': item.name
                };
                filters.push(filter);
            }
        }

        return filters;

    }

    setupFilters() {
        console.log('PipelineInferencing-setupFilters:', this.filters);


        this.filters.forEach(element => {
            this.selectNode(element.deviceName, element.resourceName);
        });
    }

    initForm() {
        this.modelForm = this.formBuilder.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            inputType: ['', Validators.required],
            url: ['', Validators.required],
            inputTemplate: ['', Validators.required],
            logLevel: ['INFO', Validators.required],
            method: ['PUT', Validators.required],
            headers: this.formBuilder.array([]),
            base64Encoded: [true, Validators.required]
        });
    }

    updateInferencingForm(context) {

        if (context != null || context != undefined) {
            console.log('Updating inferencing component with context: ', context);

            // this.filters = context.filters;

            this.modelForm.patchValue({
                name: context.name,
                description: context.description,
                url: context.url,
                inputTemplate: context.inputTemplate,
                LogLevel: context.logLevel,
                method: context.method,
                base64Encoded: context.base64Encoded
            });

            const formGroups = context.headers.map(x => this.formBuilder.array(x.map(y => this.formBuilder.group(y)))) as [];
            const headersArray = this.formBuilder.array(formGroups) as FormArray
            this.modelForm.setControl('headers', headersArray);

        }
    }
}
