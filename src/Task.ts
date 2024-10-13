import {Category, Heading} from "./category";
import {Registry} from "./registry";
import {Notice, TFile} from "obsidian";


export class Task {
    md: string;
    plainText: string;
    completed: boolean;
    anchorHeading: string;
    matchingHeadings: Heading[];
    inClosedList: boolean;
    registry: Registry;
    category: Category;
    subtasks: string[] = [];
    lineNumber: number;

    constructor(line: string, headings: Heading[], registry: Registry, category: Category, lineNumber: number) {
        this.plainText = line.replace(/- \[([ x])\]|\[\[|\]\]/g, '').trim();
        this.md = line;
        this.completed = line.includes('[x]');
        this.matchingHeadings = headings;
        const matchingHeadings = headings.map((heading) => heading.heading);
        this.category = category;
        this.anchorHeading = matchingHeadings.length > 0 ? matchingHeadings[matchingHeadings.length-1] : this.category.name;
        this.registry = registry;
        this.lineNumber = lineNumber;
        if (!this.completed && this.registry.closedListContent) this.alreadyInClosed();
    }

    addSubtask(subtask: string) {
        this.md = this.md + "\n" + subtask;
        this.subtasks.push(subtask.replace(/- \[([ x])\]|\[\[|\]\]/g, '').trim());
    }

    alreadyInClosed() {
        // Checks if the task is already included in today's closed to do list if the task hasn't been completed yet.
        if (this.registry.closedListContent.includes(this.plainText)) this.inClosedList = true;
        this.inClosedList = false;
    }

    generateStaticHeadings() {
        // Formats the headings that do not appear inside the file in md-style.
        let labels = this.category.labels.map((lbl, i) => `${"#".repeat(i+1)} ${lbl}`);
        labels.push(`${"#".repeat(labels.length + 1)} ${this.category.name}`);
        return labels;
    }

    async toggle() {
        if (this.completed) {
            this.category.fileContent.splice(this.lineNumber, 1, this.md.replace('[x]', '[ ]'));
        } else {
            this.category.fileContent.splice(this.lineNumber, 1, this.md.replace('[ ]', '[x]'));
        }
        await this.category.saveFile();
    }
}