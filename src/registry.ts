import WorkflowAssistant from "./main";
import {TFile} from "obsidian";
import {Category, Heading} from "./category";
import {Task} from "./Task";
import {InteractiveViewMode} from "./interactiveViewMode";
import FourThousandWeeks from "src";

interface Register {
    [key: string]: Category;
}

export class Registry {
    plugin: FourThousandWeeks;
    registry: Register;
    basePath: string;
    closedListPath: string;
    closedListContent: string[];
    vaultFiles: TFile[] = [];
    reload: Function|null|undefined;
    nameToPathMap: any = {};
    closedListFile: TFile;
    closedListViewMode: InteractiveViewMode;
    tasks: Task[] = [];
    headings: Heading[] =[];
    labels: string[] = [];

    constructor(plugin: FourThousandWeeks, closedListPath: string) {
        this.registry = {};
        this.plugin = plugin;
        this.vaultFiles = plugin.app.vault.getFiles();
        this.basePath = plugin.settings.openToDoListFolder;
        this.closedListFile = plugin.app.vault.getAbstractFileByPath(plugin.settings.closedToDoListLocation) as TFile;
        plugin.app.vault.read(this.closedListFile).then((content) => this.closedListContent = content ? content.split("\n") : []);
    }

    async loadAllTasks() {
        let allOpenLists = this.plugin.app.vault.getFiles().filter((file: TFile) => file.path.startsWith(this.basePath));
        for (let file of allOpenLists) {
            const cat = new Category(file.path, this.plugin, this);
            await cat.retrieveTasks().then((tasks: []) => this.tasks = [...this.tasks, ...tasks]).then(() => {
                this.headings = [...new Set([...this.headings, ...cat.headings])];
                this.labels = [...new Set([...this.labels, ...cat.labels])];
            });
        }
    }

    createCategoryFile() {
        
    }

    createCategory(name: string, fileExists = true) {
        if (fileExists) return new Category(this.nameToPathMap[name], this.plugin, this);
        else {
            let category = new Category(name, this.plugin, this);
            this.createCategoryFile
        }
    }

    getCategories() {
        this.plugin.tools.getFiles(this.basePath).forEach((file) => {
            this.nameToPathMap[file.basename] = file.path;
        });
        return Object.keys(this.nameToPathMap).sort();
    }

    moveTask(registry: Registry, category: Category, task: Task, check=false) {
        registry._insertIntoClosedList(registry, category, task);
        console.log(registry.closedListContent)
        if (check) category.tasks = category.tasks.filter((tsk: Task) => tsk !== task);
        task.inClosedList = true;
        registry.plugin.app.vault.modify(registry.closedListFile, registry.closedListContent.join("\n"));
    }

    _insertIntoClosedList(registry: Registry, category: Category, task: Task): void {
        // Formats labels as headings and checks if they're present in CL. Otherwise, insert.
        let formattedLabels: string[] = [...category.labels, task.anchorHeading].map((text, i:number) => `${"#".repeat(1 + i)} ${text}`);
        console.log(registry.closedListContent)
        let lastLabelIndex = registry.closedListContent.length;
        for (let label of formattedLabels) {
            const loc = registry.closedListContent.indexOf(label);
            if (loc === -1) {
                registry.closedListContent.splice(lastLabelIndex, 0, label);
                lastLabelIndex += 1;
            } else {
                lastLabelIndex = loc + 1;
            }
        }

        if (registry.closedListContent.indexOf(task.md) === -1) registry.closedListContent.splice(lastLabelIndex, 0, task.md);
    }

    removeTaskFromClosed(registry: Registry, task: Task) {
        const indexToRemove = registry.closedListContent.indexOf(task.md);
        if (indexToRemove !== -1) registry.closedListContent.splice(indexToRemove, 1);
        registry.plugin.app.vault.modify(registry.closedListFile, registry.closedListContent.join("\n"));
    }

    removeHeadingFromClosed(registry: Registry, heading: string) {
        const indexToRemove = registry.closedListContent.indexOf(heading);
        console.log(indexToRemove)
        if (indexToRemove !== -1) registry.closedListContent.splice(indexToRemove, 1);
        registry.plugin.app.vault.modify(registry.closedListFile, registry.closedListContent.join("\n"));
    }

    _findIndexOfSubstring(registry: Registry) {
        let index = -1;
        registry.closedListContent.forEach((line: string, i: number) => {

        })
    }

    setInteractiveViewMode() {
        this.loadAllTasks().then(() => {
            this.closedListViewMode = new InteractiveViewMode(this, this.closedListFile)
        });
    }

}