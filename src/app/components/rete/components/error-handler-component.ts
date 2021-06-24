import { Component, Input, Output } from "rete";
import { errorSocket } from "../sockets";
import { ImageControl } from "../controls/image-control";

export class ErrorHandlerComponent extends Component {

    data: any;
    constructor() {
        super("Error Handler");
    }

    builder(node) {
        const inp1 = new Input("err", "Error", errorSocket);
        const control = new ImageControl(this.editor, "event", "Icon_Error_Handler.svg");

        return node.addControl(control)
                    .addInput(inp1);
    }

    worker(node, inputs, outputs) {
        
    }
}
