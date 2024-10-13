import {Notice, TFile} from "obsidian";
import {Registry} from "./registry";
import {Task} from "./Task";
import {Heading} from "./category";


export class InteractiveViewMode {

    registry: Registry;
    closedList: TFile;
    title: string;
    parentContainer: HTMLElement|null|undefined;
    checkboxes: Element[] = [];
    tasks: Element[] = [];
    headings: Element[] = [];
    checkboxEvents: EventListener[] = [];
    taskDeleteEvents: EventListener[] = [];
    deleteHeadingEvents: EventListener[] = [];

    constructor(registry: Registry, file: TFile) {
        this.registry = registry;
        this.closedList = file;
        this.title = file.basename;
        this.parentContainer = this._findParentContainer();
        this._registerTaskEvents();
        this._registerHeadingEvents();
    }

    _findParentContainer() {
        const parentContainer = Array.from(document.getElementsByClassName('inline-title')).filter((el) => el.textContent?.includes(this.title))[0].parentElement?.parentElement;
        if (!parentContainer) {
            new Notice("Parent container can't be located.");
            throw Error("Unable to locate parent container.")
        }
        return parentContainer;
    }

     _registerTaskEvents() {
        this.tasks = Array.from(document.getElementsByClassName("task-list-item"));

        for (let task of this.tasks) {

            const textContent = Array.from(task.childNodes).filter((child: Node) => child.nodeType == Node.TEXT_NODE)[0].textContent;
            const checkbox = Array.from(task.children).filter((child: HTMLElement) => child.tagName === "INPUT")[0];
            this.checkboxes.push(checkbox);
            let matchingTask: Task|null = null;
            if (textContent && checkbox) {
                matchingTask = this.registry.tasks.filter((task: Task) => task.md.includes(textContent))[0];
            }

            if (matchingTask) {
                const deleteTaskEvent = this.deleteTask(matchingTask);
                this.taskDeleteEvents.push(deleteTaskEvent)
                task.addEventListener('contextmenu', deleteTaskEvent)
                const checkboxClick = this.checkboxClick(matchingTask);
                this.checkboxEvents.push(checkboxClick)
                checkbox.addEventListener('click', checkboxClick)
            } else {
                // @ts-ignore
                new Notice("No matching task found for", textContent)
            }
        }
     }

     _registerHeadingEvents() {
        this.headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
        for (let heading of this.headings) {
            let matchingHeading = this.registry.headings.filter((hding: Heading) => heading?.textContent?.toLowerCase().trim() === hding.heading.trim().toLowerCase())[0];
            // console.log(this.registry.headings)
            // console.log(this.registry.labels)
            let headingString = matchingHeading ? matchingHeading.heading : this.registry.labels.filter((lbl: string) => heading.textContent === lbl)[0];
            const deleteHeadingEvent = this.deleteHeading(headingString);
            this.deleteHeadingEvents.push(deleteHeadingEvent);
            heading.addEventListener('contextmenu', deleteHeadingEvent)
        }
     }

     checkboxClick = (matchingTask: Task) => (e: any) => {
         const checkTask = (task: Task) => task.category.checkTask(task.category, task);
         const uncheckTask = (task: Task) => task.category.uncheckTask(task.category, task);
         // @ts-ignore
         if (e.target.checked) checkTask(matchingTask);
         // @ts-ignore
         else uncheckTask(matchingTask);
     }

    deleteHeading = (matchingHeading: string) => (e: any) => {
        console.log(e)
        console.log(matchingHeading)
        const deleteHeading = (heading: string) => this.registry.removeHeadingFromClosed(this.registry, heading);
        // @ts-ignore
        deleteHeading(matchingHeading);
    }

     deleteTask = (matchingTask: Task) => (e: any) => {
        console.log(e)
         const deleteTask = (task: Task) => this.registry.removeTaskFromClosed(this.registry, task);
         // @ts-ignore
         deleteTask(matchingTask)
     }

     removeEventListeners() {
        for (let i = 0; i < this.checkboxes.length; i++) {
            this.checkboxes[i].removeEventListener('click', this.checkboxEvents[i]);
        }

        for (let i = 0; i < this.tasks.length; i++) {
            this.tasks[i].removeEventListener('contextmenu', this.taskDeleteEvents[i]);
        }

         for (let i = 0; i < this.headings.length; i++) {
             this.headings[i].removeEventListener('contextmenu', this.deleteHeadingEvents[i]);
         }

        console.log("removing events")
     }

}