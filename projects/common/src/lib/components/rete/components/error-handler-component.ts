import { Component, Input, Output } from 'rete';
import { errorSocket, eventSocket } from '../sockets';
import { ImageControl } from '../controls/image-control';

export class ErrorHandlerComponent extends Component {

    data: any;
    constructor() {
        super('Error Handler');
    }

    builder(node) {
        const out = new Output('event', 'Event', eventSocket);
        const control = new ImageControl(this.editor, 'event', 'Icon_Error_Handler.svg');

        return node.addControl(control)
            .addOutput(out);
    }

    worker(node, inputs, outputs) {
        outputs['event'] = node.data.event;
    }
}
