import {Modal} from "obsidian";
import WorkflowAssistant from "./index";
import {createRoot, Root} from "react-dom/client";
import {StrictMode} from "react";
import * as ReactDOM from "react-dom";
import {OpenTaskListManager} from "./ui/openTaskListManager";
import { TaskListManager } from "./ui/taskListManager";


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
            <TaskListManager
                plugin={this.assistant}
                closedListPath={this.assistant.settings.closedToDoListLocation}
                open={this.open}
                close={this.close}
            />
        </StrictMode>)
    }

    async onClose() {
        this.root.unmount();
    }


}