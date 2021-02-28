import { Component, Input, Output } from "rete";
import { eventSocket, errorSocket } from "../sockets";
import { ImageControl } from "../controls/image-control";

export class FiltersComponent extends Component {

    data: any;
    constructor() {
        super("Filters");
    }

    builder(node) {
        const inp = new Input("event", "Event", eventSocket);
        const out = new Output("fe", "Filtered Event", eventSocket);
        // const err = new Output("error", "Error", errorSocket);
        const control = new ImageControl(this.editor, "event", "digitaltwin.png");

        return node.addControl(control)
            .addInput(inp)
            .addOutput(out);
            // .addOutput(err);

    }

    worker(node, inputs, outputs) {
        outputs["fe"] = node.data.fe;
    }
}
