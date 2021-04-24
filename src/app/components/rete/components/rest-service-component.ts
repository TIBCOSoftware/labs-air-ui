import { Component, Input, Output } from "rete";
import { eventSocket, sqlResultSocket, errorSocket } from "../sockets";
import { ImageControl } from "../controls/image-control";

export class RestServiceComponent extends Component {
    data: any;
    constructor() {
        super("REST Service");
    }

    builder(node) {
        const inp1 = new Input("evt1", "Event", eventSocket);
        const out = new Output("event", "Event", eventSocket);
        // const err = new Output("error", "Error", errorSocket);
        const control = new ImageControl(this.editor, "event", "Icon_Pipeline.svg");

        return node.addControl(control)
            .addInput(inp1)
            .addOutput(out);
            // .addOutput(err);
    }

    worker(node, inputs, outputs) {
        outputs["event"] = node.data.event;
    }
}
