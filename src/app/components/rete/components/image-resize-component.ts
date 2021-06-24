import { Component, Input, Output } from "rete";
import { errorSocket, eventSocket, numSocket } from "../sockets";
import { ImageControl } from "../controls/image-control";

export class ImageResizeComponent extends Component {
    data: any;
    constructor() {
        super("Image Resize");
    }

    builder(node) {
        const inp = new Input("event", "Event", eventSocket);
        const out = new Output("event", "Event", eventSocket);
        // const err = new Output("error", "Error", errorSocket);
        const control = new ImageControl(this.editor, "event", "Icon_Image_Resize.svg");

        return node.addControl(control)
            .addInput(inp)
            .addOutput(out);
            // .addOutput(err);

    }

    worker(node, inputs, outputs) {
        outputs["event"] = node.data.event;
    }

}
