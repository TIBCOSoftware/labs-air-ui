import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as YAML from 'yaml';
import { FlogoDeployService } from '../../../services/deployment/flogo-deploy.service';



@Component({
    selector: 'app-common-infra-registration',
    templateUrl: './infra-registration.component.html',
    styleUrls: ['./infra-registration.component.css']
})
export class InfraRegistrationComponent implements OnInit {
  @Input() name = '';
  @Input() error = '';
  registrationForm: FormGroup;
  projectForm: FormGroup;
  parsedFile: any;
  items = [];
  properties = new Set();
  dockerFile:any;
  envProperties= {};

  constructor(private flogoDeployService: FlogoDeployService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar) {

  }

  ngOnInit(): void {
      this.createForm();
      this.projectForm = this.formBuilder.group({
          projectName: [null, Validators.required],
          projectDescription: [null, Validators.required]
      });
  }
  /*
parse uploaded files to add properties forms
*/

  onFileSelected(event) {
      //make sure user uploads only 2 files

      const files = event.target.files;
      if(files.length>2){
          alert('You are only allowed to upload a maximum of 2 files at a time');
      }


      if (event && event.target && event.target.files) {
      //check if file is json
          const validateJSON = data => {
              try { JSON.parse(data); }
              catch { return false; }
              return true;
          };
          //declare the 2 files
          let dockerfile: File;
          let jsonfile: File;
          if(files.length==1){
              dockerfile = event.target.files[0];
          }
          else{
              if(validateJSON(event.target.files[0])){
                  dockerfile = event.target.files[1];
                  jsonfile= event.target.files[0];
              }
              else{
                  dockerfile = event.target.files[0];
                  jsonfile = event.target.files[1];
              }
              //get environment file values

              if (jsonfile) {
                  console.log('Selected file: ', jsonfile.name);
                  const envFileReader = new FileReader();
                  envFileReader.readAsText(jsonfile, 'UTF-8');
                  envFileReader.onload = () => {
                      this.envProperties = JSON.parse(envFileReader.result as string);
                      envFileReader.onerror = (error) => { console.log(error); };
                  };
              }
          }
          //parse yml file to add properties

          if (dockerfile) {
              console.log('Selected file: ', dockerfile.name);
              const fileReader = new FileReader();
              fileReader.onload = (e) => {
                  this.dockerFile = fileReader.result;
                  this.parsedFile = YAML.parse(fileReader.result as string);

                  //test if file is empty
                  try {
                      if (this.parsedFile==null) {
                          alert('file is empty');
                          return;
                      }
                  }
                  catch (e) {
                      console.log(e);
                  }

                  //add containers to items list
                  if (this.parsedFile.services) {
                      for (const key in this.parsedFile.services) {
                          this.items.push(this.parsedFile.services[key]);
                      }
                      console.log(this.items);
                      this.name = 'Custom Properties:';

                      this.addform();
                  }
                  else{
                      alert('enter a valid docker-compose file: add services');
                  }
              };
              fileReader.readAsText(dockerfile);
          }
      }
  }
  /*
parse environment file and add list of properties there to the input forms
*/
  // onEnvSelected(event) {
  //   //parse yml file
  //     const file: File = event.target.files[1];

  //     if (file) {
  //       console.log("Selected file: ", file.name);
  //       let envFileReader = new FileReader();
  //       envFileReader.readAsText(file, "UTF-8");
  //       envFileReader.onload = () => {
  //       this.envProperties = JSON.parse(envFileReader.result as string);
  //       console.log(this.envProperties);
  //       envFileReader.onerror = (error) => {
  //         console.log(error);
  //       }

  //       for (let key in this.envProperties){
  //         // this.addParameterItem(key, this.envProperties[key]);
  //         this.getParameters()[key]= this.envProperties[key];
  //         // console.log(this.getParameters())
  //       }
  //       console.log(this.getParameters());


  //       }
  //     }
  // }
  //add input fields for every container
  addform() {
      this.getParameters().clear();
      this.properties.clear();
      if (this.items) {
          for (const container of this.items) {
              const item = container.environment;
              // console.log(item)
              if (item) {
                  for (const key in item) {
                      // console.log(item[key]);
                      if (item[key]) {
                          const field = item[key];
                          if (field[0] == '$') {
                              const lastIndex = field.length - 1;
                              const propety = field.slice(2, lastIndex);
                              if (this.properties.has(propety) == false) {
                                  let value='';
                                  //add property values from the env file
                                  if (propety in this.envProperties){
                                      value= this.envProperties[propety];
                                  }
                                  this.properties.add(propety);
                                  this.addParameterItem(propety,value);
                              }
                          }
                      }
                  }
              }
          }
      }
      else{
          alert('enter a valid docker-compose file: add containers');
      }
  }
  //make dynamic forms
  createForm() {
      console.log('Creating form');
      this.registrationForm = this.formBuilder.group({
          parameters: this.formBuilder.array([], Validators.required)
      });

  }
  createParameter(name,value): FormGroup {
      console.log('Creating form with param name: ', name);

      return this.formBuilder.group({
          name: [name, Validators.required],
          value: [value, Validators.required]
      });
  }

  getParameters(): FormArray {
      return <FormArray>this.registrationForm.get('parameters');
  }

  addParameterItem(name,value) {
      this.getParameters().push(this.createParameter(name,value));
  }
  validateAllFormFields(formGroup: FormGroup) {         //{1}
      Object.keys(formGroup.controls).forEach(field => {  //{2}
          const control = formGroup.get(field);             //{3}
          if (control instanceof FormControl) {             //{4}
              control.markAsTouched({ onlySelf: true });
          } else if (control instanceof FormGroup) {        //{5}
              this.validateAllFormFields(control);            //{6}
          }
      });
  }
  /*
  register a device
  */

  register() {
      const systemEnv = {};

      // Build dynamic parameters
      const parameters = this.getParameters();
      const numParams = parameters.length;

      for (let i = 0; i < numParams; i++) {

          const control = parameters.at(i);

          const paramName = control.get('name').value;
          const paramValue = control.get('value').value;

          // console.log("Param: ", paramName, " Value: ", paramValue);
          systemEnv[paramName] = paramValue;
      }
      /*
build registration request
*/
      const registrationRequest = {
          'Description': this.projectForm.get('projectDescription').value,
          'Deployable': {
              'Name': this.projectForm.get('projectName').value,
              'Configuration': this.dockerFile,
              'PredefinedVariables': JSON.stringify(systemEnv)
          }
      };
      if (this.registrationForm.valid) {
          console.log('form submitted');
      } else {
          this.error= 'Enter all required fields';
          this.validateAllFormFields(this.registrationForm); //{7}
      }


      /*
  call registrattion service
  */
      this.flogoDeployService.registerInfra(registrationRequest,this.projectForm.get('projectName').value)
          .subscribe(res => {
              console.log('Received Registration response: ', res);

              let message = 'Success';
              if (res == undefined || res.Success == false) {
                  message = 'Failure';
              }

              this._snackBar.open(message, 'in project registeration', {
                  duration: 3000,
              });

          });

  }
}
