import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Resource } from '../../../models/iot.model';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Observable, Subscription } from 'rxjs';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-common-pipeline-rule-text-matching',
  templateUrl: './pipeline-rule-text-matching.component.html',
  styleUrls: ['./pipeline-rule-text-matching.component.css']
})
export class PipelineRuleTextMatchingComponent implements OnInit {

  @Output() formUpdatedEvent = new EventEmitter<any>();
  @Input() nodeChangeEvent: Observable<any>;
  @Input() ruleTextMatching: any;
  nodeChangeSubscription: Subscription;
  formChangeSubscription: Subscription;
  ruleTextMatchingForm: UntypedFormGroup;

  resources: Resource[];

  private subscr1: Subscription;

  logLevels: SelectItem[] = [
    { value: 'INFO', viewValue: 'INFO' },
    { value: 'WARN', viewValue: 'WARN' },
    { value: 'ERROR', viewValue: 'ERROR' },
    { value: 'DEBUG', viewValue: 'DEBUG' }
  ];

  operations: SelectItem[] = [
    { value: '==', viewValue: '==' },
    { value: '>', viewValue: '>' },
    { value: '>=', viewValue: '>=' },
    { value: '<', viewValue: '<' },
    { value: '<=', viewValue: '<=' },
    { value: 'contains', viewValue: 'contains' }
  ];

  constructor(private formBuilder: UntypedFormBuilder) { }

  ngOnInit(): void {
    this.initForm()
    this.onFormChanges();
    if (this.ruleTextMatching) {
      this.updateRuleTextMatchingForm(this.ruleTextMatching.data['customdata'])
    }
  }

  ngOnDestroy(): void {
    this.formChangeSubscription.unsubscribe();
    this.nodeChangeSubscription.unsubscribe();
}

  onFormChanges(): void {
    this.nodeChangeSubscription = this.nodeChangeEvent.subscribe(node => {
      this.updateRuleTextMatchingForm(node.data['customdata']);
    });
    this.formChangeSubscription = this.ruleTextMatchingForm.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(() => {
        this.formUpdatedEvent.emit(this.ruleTextMatchingForm.value)
      })
  }

  initForm() {
    this.ruleTextMatchingForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      compareTarget: ['', Validators.required],
      compareOp: ['', Validators.required],
      compareToValue: ['', Validators.required],
      logLevel: ['INFO', Validators.required]
    });
  }

  updateRuleTextMatchingForm(context) {

    if (context != null || context != undefined) {
      console.log('Updating rules component with context: ', context);

      this.ruleTextMatchingForm.patchValue({
        name: context.name,
        description: context.description,
        compareTarget: context.compareTarget,
        compareOp: context.compareOp,
        compareToValue: context.compareToValue,
        logLevel: context.logLevel,
      });

    }
  }
}
