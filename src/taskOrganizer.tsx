import {Modal} from "obsidian";
import WorkflowAssistant from "./main";
import {createRoot, Root} from "react-dom/client";
import {StrictMode} from "react";
import * as ReactDOM from "react-dom";
import {OpenTaskListManager} from "./openTaskListManager";


export class TaskOrganizer extends Modal {

    assistant: WorkflowAssistant;
    root: Root;

    constructor(plugin: WorkflowAssistant) {
        super(plugin.app);
        this.assistant = plugin;
    }

    async onOpen() {
        this.root = createRoot(this.containerEl.children[1]);
        // @ts-ignore
        this.root.render(<StrictMode>
            <OpenTaskListManager
                plugin={this.assistant}
                closedListPath={this.assistant.dailyNotesManager.todaysTrackingFilePath}
                open={this.open}
                close={this.close}
            />
        </StrictMode>)
    }

    async onClose() {
        this.root.unmount();
    }


}