import { Component, Input, Output } from "rete";
import { errorSocket, eventSocket, numSocket } from "../sockets";
import { ImageControl } from "../controls/image-control";

export class DataSubscriberComponent extends Component {
    data: any;
    constructor() {
        super("Data Subscriber");
    }

    builder(node) {
        const out = new Output("event", "Event", eventSocket);
        // const err = new Output("error", "Error", errorSocket);
        const control = new ImageControl(this.editor, "event", "Icon_Data_Source.svg");

        return node.addControl(control)
            .addOutput(out);
            // .addOutput(err);

    }

    worker(node, inputs, outputs) {
        outputs["event"] = node.data.event;
    }

}
