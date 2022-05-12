import { Component, Input, Output } from 'rete';
import { eventSocket } from '../sockets';
import { ImageControl } from '../controls/image-control';

export class MQTTRequestReplyComponent extends Component {
    data: any;
    constructor() {
        super('MQTT Request Reply');
    }

    builder(node) {
        const inp1 = new Input('event', 'Event', eventSocket);
        const out = new Output('event', 'Event', eventSocket);
        // const err = new Output("error", "Error", errorSocket);
        const control = new ImageControl(this.editor, 'event', 'Icon_Pipeline.svg');

        return node.addControl(control)
            .addInput(inp1)
            .addOutput(out);
        // .addOutput(err);
    }

    worker(node, inputs, outputs) {
        // inputs['event'] = inputs['event'].length ? inputs['event'][0] : undefined;
        outputs['event'] = node.data.event;
    }
}
