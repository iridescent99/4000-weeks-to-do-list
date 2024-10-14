import {App, Plugin, TFile, TFolder, WorkspaceLeaf} from 'obsidian';
import "./styles.css";
import {Registry} from "./registry";
import {Tools} from "./tools";
import {TaskOrganizer} from "./taskOrganizer";
import {addCommands} from "./commands";
import { FourThousandWeeksSettingsTab } from './settings';

export interface Settings {
	openToDoListFolder: string;
    closedToDoListLocation: string;
    archiveLocation: string;
}

export const DEFAULT_SETTINGS: Settings = {
	openToDoListFolder: "_open_todo_list/",
    closedToDoListLocation: "CLOSED/closed_list.md",
    archiveLocation: "archive.md"
}

export interface TaskItem {
    [key: string]: any;
    task: string;
    headings: string[];
}

interface TaskCollection {
    [key: string]: TaskItem;
}

export let taskCollection: TaskCollection = {};

export default class FourThousandWeeks extends Plugin {

    settings: Settings;
    tools: Tools = new Tools(this);
    taskOrganizer: TaskOrganizer = new TaskOrganizer(this);
    registry: Registry;

    async onload() {

        try {

            await this.loadSettings();

            this.addSettingTab(new FourThousandWeeksSettingsTab(this.app, this));

            // @ts-ignore
            this.app.workspace.on('layout-ready', async () => {

                addCommands(this);

                this.addRibbonIcon('list', 'task manager', async () => {
                    this.taskOrganizer.open();
                });

            })
        } catch (e) {
            console.log(e);
            throw e;
        }

        
    }


    async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

    async saveSettings() {
        await this.saveData(this.settings)
    }

    onunload() {
    }

}
