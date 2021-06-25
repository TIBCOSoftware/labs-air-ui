import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GraphService } from '../../../services/graph/graph.service';
import { Protocol, Publisher } from '../../../shared/models/iot.model';
export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-protocols-view',
  templateUrl: './protocols-view.component.html',
  styleUrls: ['./protocols-view.component.css']
})
export class ProtocolsViewComponent implements OnInit {
  hidePassword = true;

  mqttProtocol = false;
  kafkaProtocol = false;
  httpProtocol = false;

  protocols: Protocol[];
  kafkaAuthModes: SelectItem[] = [
    { value: 'None', viewValue: 'None' },
    { value: 'SASL/Plain', viewValue: 'SASL/Plain' },
    { value: 'SSL', viewValue: 'SSL' }
  ];

  kafkaInitialOffsets: SelectItem[] = [
    { value: 'Oldest', viewValue: 'Oldest' },
    { value: 'Newest', viewValue: 'Newest' }
  ];

  mqttEncriptionModes: SelectItem[] = [
    { value: 'None', viewValue: 'None' },
    { value: 'TLS-Cert', viewValue: 'TLS-Cert' },
    { value: 'TLS-ClientAuth', viewValue: 'TLS-ClientAuth' }
  ];

  @Input() transportForm: FormGroup;
  onKafkaAuthModeSelected(event) {
  }

  onMQTTEncryptionModeSelected(event) {
  }

  constructor(private graphService: GraphService) {

  }

  ngOnInit() {
    console.log("On Protocols ngOnInit. Getting publisher for: ", this.transportForm.get('gateway').value);

    // this.getPublishers(this.transportForm.get('gateway').value);


    this.onFormChanges();
  }

  onFormChanges(): void {
    this.transportForm.valueChanges.subscribe(val => {

      let protocol = this.transportForm.get('protocol').value;

      console.log("On ProtocolView form changed to protocol: ", protocol);

      this.mqttProtocol = false;
      this.kafkaProtocol = false;
      this.httpProtocol = false;

      if (protocol == "MQTT") {

        this.mqttProtocol = true;
      }
      else if (protocol == "Kafka") {

        this.kafkaProtocol = true;
      }
      else if (protocol == "HTTP") {
        this.httpProtocol = true;
      }
    });
  }

}
