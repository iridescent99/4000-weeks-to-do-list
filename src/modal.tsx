import {App, Modal} from "obsidian";
import {MonthlyAgenda} from "./monthlyAgenda";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {createRoot} from "react-dom/client";

export class AgendaModal extends Modal {

    constructor(app: App) {
        super(app)
    }

    onOpen () {
        const root = createRoot(this.containerEl.children[1]);
        // @ts-ignore
        root.render(<React.StrictMode><MonthlyAgenda /></React.StrictMode>)
    }

    async onClose() {
        ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
    }

}