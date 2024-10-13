import {App, Plugin, TFile, TFolder, WorkspaceLeaf} from 'obsidian';
import {AgendaModal} from "./modal";
import "./styles.css";
import {Registry} from "./registry";
import {DailyNotesManager} from "./dailyNotesManager";
import {Tools} from "./tools";
import {TaskOrganizer} from "./taskOrganizer";
import {addCommands} from "./commands";
import { FourThousandWeeksSettingsTab } from './settings';

export interface Settings {
	openToDoListFolder: string;
    closedToDoListLocation: string;
}

export const DEFAULT_SETTINGS: Settings = {
	openToDoListFolder: "_open_todo_list",
    closedToDoListLocation: "CLOSED/closed_list.md"
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
    dailyNotesManager: DailyNotesManager = new DailyNotesManager(this);
    taskOrganizer: TaskOrganizer = new TaskOrganizer(this);
    registry: Registry;

    async onload() {

        try {
            console.log('Loading workflow..');

            await this.loadSettings();

            this.addRibbonIcon('calendar-days', 'monthly-agenda', async () => {
                new AgendaModal(this.app).open();
            });

            console.log(`Welcome.. Today's date is ${new Date().toISOString().split("T")[0]}`);

            this.addSettingTab(new FourThousandWeeksSettingsTab(this.app, this));

            // @ts-ignore
            this.app.workspace.on('layout-ready', async () => {

                // Get all changes to avoid creating duplicate files & merge conflicts
                await this.tools.commitPushAndPull().then(() => this.dailyNotesManager.import());

                addCommands(this);

                this.addRibbonIcon('list', 'task organizer', async () => {
                    this.taskOrganizer.open();
                });

                this.registerEvent(this.app.workspace.on("active-leaf-change", this.handleActiveLeafChange.bind(this)))
            })
        } catch (e) {
            console.log(e);
            throw e;
        }

        
    }

    handleActiveLeafChange() {
        // @ts-ignore
        const activeLeaf = this.tools.getActiveLeaf();
        if (!activeLeaf) return;

        const file = this.app.workspace.getActiveFile() as TFile;
        if (this.registry !== undefined) this.registry.closedListViewMode.removeEventListeners();
        if (file.path.includes(this.dailyNotesManager.todaysTrackingFilePath)) {
            this.registry = new Registry(this, this.dailyNotesManager.todaysTrackingFilePath);
            this.registry.setInteractiveViewMode();
        }
    }

    async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

    onunload() {
    }

}
