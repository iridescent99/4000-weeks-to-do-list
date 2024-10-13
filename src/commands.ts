import WorkflowAssistant from "./main";


export function addCommands(plugin: WorkflowAssistant) {

    plugin.addCommand({
        id: "add-task",
        name: "Add open list task",
        callback: async () => {
            plugin.taskOrganizer.open();
        },
    })


}