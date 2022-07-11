import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from "@angular/core";
import { FormBuilder, Validators, UntypedFormGroup } from "@angular/forms";
import { debounceTime, Subscription, distinctUntilChanged, Observable } from "rxjs";

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: "app-common-pipeline-error-handler",
  templateUrl: "./pipeline-error-handler.component.html",
  styleUrls: ["./pipeline-error-handler.component.css"],
})
export class PipelineErrorHandlerComponent implements OnInit, OnDestroy {
  @Input() errorHandler;
  @Output() formUpdatedEvent = new EventEmitter<any>();
  formChangeSubscription: Subscription;
  @Input() nodeChangeEvent: Observable<any>;
  nodeChangeSubscription: Subscription;

  @Input() errorHandlerForm: UntypedFormGroup;

  logLevels: SelectItem[] = [
    { value: "INFO", viewValue: "INFO" },
    { value: "WARN", viewValue: "WARN" },
    { value: "ERROR", viewValue: "ERROR" },
    { value: "DEBUG", viewValue: "DEBUG" },
  ];

  constructor(private formBuilder: FormBuilder) {
    console.log("constructor streaming component config");
  }

  ngOnInit(): void {
    this.initForm();
    this.onFormChanges();
    if (this.errorHandler) {
      this.updateErrorHandlerForm(this.errorHandler.data['customdata'])
    }
  }

  ngOnDestroy(): void {
      this.formChangeSubscription.unsubscribe();
      this.nodeChangeSubscription.unsubscribe();
  }

  onFormChanges(): void {
    this.nodeChangeSubscription = this.nodeChangeEvent.subscribe( node => {
      this.updateErrorHandlerForm(node.data['customdata']);
    });

    this.formChangeSubscription = this.errorHandlerForm.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(() => {
      this.formUpdatedEvent.emit(this.errorHandlerForm.value);
    });
  }

  initForm() {
    this.errorHandlerForm = this.formBuilder.group({
      logLevel: ['INFO', Validators.required]
    });
  }

  updateErrorHandlerForm(context) {
    if (context != null || context != undefined) {
      console.log("Updating error handler component with context: ", context);

      this.errorHandlerForm.patchValue({
        logLevel: context.logLevel,
      });
    }
  }

}
