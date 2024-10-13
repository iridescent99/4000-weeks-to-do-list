import {App, TFile} from "obsidian";
import {Task} from "./Task";
import WorkflowAssistant from "./main";
import {Registry} from "./registry";

export class Heading {
    level: number = 0;
    heading: string;
    raw: string;
    lineNumber: number;

    constructor(line: string, lineNumber: number) {
        this.raw = line;
        let [hashes, ...heading] = line.split(" ");
        this.heading = heading.join(" ");
        this.lineNumber = lineNumber;
        this.hashCounter(hashes);
    }

    hashCounter(hashes: string) {
        hashes.split("").forEach((_) => this.level = this.level + 1);
    }
}


export class Category {
    plugin: WorkflowAssistant;
    registry: Registry;
    path: string;
    name: string;
    depth: number;
    basePath: string;
    labels: string[];
    file: TFile;
    gradient: string[] = [];
    tasks: Task[] = [];
    headings: Heading[] = [];
    fileContent: string[] = [];
    ARCHIVE_FOLDER: string = '_workflow/_archive/tracking/';
    archivePath: string;
    archiveContent: string[] = [];
    archiveFile: TFile;

    constructor(path: string, plugin: WorkflowAssistant, registry: Registry) {
        this.plugin = plugin;
        this.registry = registry;
        this.path = path;
        const splitPath = this.path.replace(this.basePath, "").split("/");
        this.depth = splitPath.length;
        this.name = splitPath[this.depth - 1].replace(".md", "");
        this.labels = splitPath.slice(2, this.depth - 1);
        this.basePath = `${this.plugin.dailyNotesManager.TRACKING_FOLDER}/_open to do list/`;
        this.archivePath = `${this.ARCHIVE_FOLDER}${this.labels.join("_").toLowerCase()}_${this.name.replace(" ", "_").toLowerCase()}.md`;
        this.file = this.plugin.app.vault.getAbstractFileByPath(this.path) as TFile;
        this.archiveFile = this.plugin.app.vault.getAbstractFileByPath(this.archivePath) as TFile;
    }

    async retrieveTasks() {

        if (this.file) {
            if (this.archiveFile) this.archiveContent = await this.plugin.app.vault.read(this.archiveFile).then((data) => data.split("\n"));

            const content = await this.plugin.app.vault.read(this.file).then((data) => data.split("\n"));
            this.fileContent = content;
            this.initializeGradient(this.file);

            let previousTask: Task|null = null;

            content.forEach((line, i) => {

                if (/^\t-\s\[/g.test(line) && previousTask)  {

                    previousTask.addSubtask(line)

                } else if (line.includes('- [ ]') || line.includes('- [x]')) { // @ts-ignore

                    previousTask = new Task(line, this.getHeadings(), this.registry, this, i);
                    this.tasks.push(previousTask);

                } else if (/^(#{1,6})\s+(.+)/.test(line)) {
                    this.headings.push(new Heading(line, i));
                }

            });

        } else {
            console.error("Couldn't retrieve tasks from ", this.path);
        }
        return this.tasks;
    }

    getHeadings() {
        let currentHeadings = [...new Set(this.headings)];
        const specificHeadings = [];
        let min = 9999;
        for (let i = currentHeadings.length - 1; i >= 0; i--) {
            let heading = currentHeadings[i];
            if (heading.level < min) {
                specificHeadings.push(heading)
                min = heading.level;
            }
        }
        return specificHeadings.reverse();
    }

    initializeGradient(file: TFile) {
        const metadata = this.plugin.app.metadataCache.getFileCache(file);

        const frontmatter = metadata?.frontmatter;

        if (frontmatter && frontmatter.gradient) {
            this.gradient = frontmatter.gradient;
        }
    }

    async updateContent(category: Category, action: string, content: string[], lineNumber: number=-99) {
        if (action === "add") {
            category.fileContent = [...category.fileContent, ...content];
        } else if (action === "insert" && lineNumber) {
            category.fileContent.splice(lineNumber, 0, ...content);
        } else if (action === "remove") {
            category.fileContent.splice(lineNumber, 1);
        } else if (action === "replace") {
            category.fileContent.splice(lineNumber, 1, ...content);
        }
        this.saveFile();
    }

    async saveFile() {
        await this.plugin.app.vault.modify(this.file, this.fileContent.join("\n"));
    }

    addHeading(category: Category, headingRaw: string): Heading {
        const newHeading = new Heading(headingRaw, category.fileContent.length)
        category.headings.push(newHeading);
        category.updateContent(category, "add", [newHeading.raw]);
        return newHeading
    }

    addTask(heading: Heading, task: string, category: Category) {
        const taskLineNumber = heading.lineNumber + 1;
        const newTask = new Task(`- [ ] ${task}`, [heading], category.registry, category, taskLineNumber);
        category.tasks.push(newTask);
        category.updateContent(category, "insert", [newTask.md], taskLineNumber)
    }

    removeHeading(category: Category, headingToRemove: Heading) {
        category.headings = category.headings.filter((heading: Heading) => headingToRemove.raw !== heading.raw);
        category.updateContent(category, "remove", [headingToRemove.raw], headingToRemove.lineNumber);
        // Assuming here that the heading level is 4, but if adding nested should be changed!
        category.registry.removeHeadingFromClosed(category.registry, `${"#".repeat(4)} ${headingToRemove.heading}`)
    }

    removeTask(category: Category, taskToRemove: Task) {
        category.tasks = category.tasks.filter((task: Task) => task.plainText !== taskToRemove.plainText);
        category.updateContent(category, "remove", [taskToRemove.plainText], taskToRemove.lineNumber);
        category.registry.removeTaskFromClosed(category.registry, taskToRemove)
    }

    checkTask(category: Category, task: Task) {
        const lineNumber = category.fileContent.indexOf(task.md)
        category._moveToArchive(category, task.md.replace("[ ]", "[x]")).then(() => category.updateContent(category, "remove", [], lineNumber));
    }

   async _moveToArchive(category: Category, task: string) {
        if (!category.archiveFile) {
            await category.plugin.app.vault.create(category.archivePath, "");
            category.archiveFile = category.plugin.app.vault.getAbstractFileByPath(category.archivePath) as TFile;
        }
        category.archiveContent = [...category.archiveContent, task];
        await category.plugin.app.vault.modify(category.archiveFile, category.archiveContent.join("\n") );
    }

    uncheckTask(category: Category, task: Task) {
        const newTaskLine = task.md.replace("[x]", "[ ]");
        task.completed = false;
        category.updateContent(category, "replace", [newTaskLine], task.lineNumber);
    }

}

