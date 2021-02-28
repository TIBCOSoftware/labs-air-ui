import { Component, Input, Output } from "rete";
import { eventSocket, sqlResultSocket, errorSocket } from "../sockets";
import { ImageControl } from "../controls/image-control";

export class DataStoreComponent extends Component {
    data: any;
    constructor() {
        super("Data Store");
    }

    builder(node) {
        const inp1 = new Input("event", "Event", eventSocket);
        const out = new Output("event", "Event", eventSocket);
        // const out = new Output("event", "Result", sqlResultSocket);
        // const err = new Output("error", "Error", errorSocket);
        const control = new ImageControl(this.editor, "event", "registry.png");
        
        return node.addControl(control)
                    .addInput(inp1)
                    .addOutput(out);
                    // .addOutput(err);
    }

    worker(node, inputs, outputs) {
        outputs["event"] = node.data.event;
    }

}
