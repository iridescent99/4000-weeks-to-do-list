import WorkflowAssistant from "./main";
import {Notice, TFile} from "obsidian";
import {Tools} from "./tools";
import {MDParser} from "./mdParser";

export class DailyNotesManager {
    trackingFile: TFile;
    SOCFile: TFile;
    draftFile: TFile;
    todaysTrackingFilePath: string;
    todaysSOCFilePath: string;
    todaysDraftFilePath: string;
    TRACKING_FOLDER: string = 'PRODUCTIVITY.Tracking';
    SOC_FOLDER: string = 'PERSONAL.Journaling/Stream of Consciousness';
    DRAFT_FOLDER: string = 'GENERAL.Drafts';
    TEMPLATE_FOLDER: string = '_workflow/_templates'
    TRACKING_TEMPLATE: string = `${this.TEMPLATE_FOLDER}/tracker.md`;
    SOC_TEMPLATE: string = `${this.TEMPLATE_FOLDER}/SOC.md`;
    DRAFT_TEMPLATE: string = `${this.TEMPLATE_FOLDER}/draft.md`;
    OVERVIEW_FOLDER: string = `${this.TRACKING_FOLDER}/overviews`
    overviewPath: string;
    tools: Tools;
    assistant: WorkflowAssistant;
    MDParser: MDParser;

    constructor(private plugin: WorkflowAssistant) {
        this.tools = plugin.tools;
        this.assistant = plugin;
        this.MDParser = new MDParser(this);
        this.overviewPath = this.getLastMonthsTrackingPath(true, true, true);
        this.generateTodaysPaths();

    }

    generateTodaysPaths() {
        this.todaysDraftFilePath = this.tools.generateDatePath(this.DRAFT_FOLDER);
        this.todaysSOCFilePath = this.tools.generateDatePath(this.SOC_FOLDER);
        this.todaysTrackingFilePath = this.tools.generateDatePath(this.TRACKING_FOLDER);
    }

    async import() {
        console.log("Importing daily notes...")
        await this._processDraftFile();
        await this._processSOCFile();
        await this._processTrackingFile();
        if (this.assistant.tools.isFirstDayOfMonth()) {
            await this.createMonthlyTrackingOverview()
        }
    }

    async _findMostRecentExpiredNote(folder: string) {
            let subtractDays = 1;
            const MAX_SUBTRACT_DAYS = 10;
            let mostRecentExpiredFile = await this._getFile(this.tools.generateDatePath(folder, subtractDays));

            if (mostRecentExpiredFile) return mostRecentExpiredFile;

            while (!mostRecentExpiredFile && subtractDays < MAX_SUBTRACT_DAYS) {
                mostRecentExpiredFile = await this._getFile(this.tools.generateDatePath(folder, subtractDays));
                if (mostRecentExpiredFile) return mostRecentExpiredFile;

                subtractDays++;
            }
    }

    _getFile(path: string) {
        if (!this.assistant.app.vault.adapter.exists(path)) throw Error(path + " doesn't exist yet!")
        return this.assistant.app.vault.getAbstractFileByPath(path) as TFile;
    }

    async _processTrackingFile() {
        const isNew = await this._importFile(this.todaysTrackingFilePath, this.TRACKING_TEMPLATE);
        if (isNew) {
            const file = await this._findMostRecentExpiredNote(this.TRACKING_FOLDER);
            if (file) {
                await this.MDParser.migrateTrackingContent(file, this.trackingFile);
                await this._deleteExpiredEmptyFiles(file, '----', /-\s\[( |x)\]/g);
            }
        }
        await this.tools.openAndPinFile(this.trackingFile);
    }

    async _processSOCFile() {
        await this._importFile(this.todaysSOCFilePath, this.SOC_TEMPLATE);
        await this.tools.openAndPinFile(this.SOCFile);
    }

    async _processDraftFile() {
        await this._importFile(this.todaysDraftFilePath, this.DRAFT_TEMPLATE);
        await this.tools.openAndPinFile(this.draftFile);
    }

    _fileSetter(file: TFile) {
        if (file) {
            if (file.path.includes("tracker")) {
                this.trackingFile = file;
            } else if (file.path.includes("soc")) {
                this.SOCFile = file;
            } else if (file.path.includes("draft")) {
                this.draftFile = file;
            }
        } else {
            throw Error("File object is null!")
        }
    }

    async _importFile(path: string, templatePath: string) {

        let file = this._getFile(path) as TFile;
        let isNew = false;

        if (!file) {
            isNew = true;
            file = await this.createNewFile(path, templatePath);
        }

        this._fileSetter(file);

        return isNew;

    }

    async createNewFile(path: string, templatePath: string|null, data: string = "") {
        await this.tools.validateFolders(path.split("/").slice(0,-1).join("/"));
        if (templatePath) {
            await this.tools.copyFile(templatePath, path);
        } else {
            await this.tools.createFile(path, data);
        }
        // Allow time for Obsidian to recognize the newly created file.
        await new Promise(resolve => setTimeout(resolve, 400));
        return this._getFile(path);
    }


    async _deleteExpiredEmptyFiles(file: TFile, splitter: string, testRegex: RegExp) {
        const content = await this.assistant.app.vault.read(file).then((content) => content.split(splitter).slice(-1)[0]);
        if (!testRegex.test(content)) await this.assistant.app.vault.delete(file);
    }

    async createMonthlyTrackingOverview() {
        const path = this.getLastMonthsTrackingPath(true, false, false);
        const files = this.tools.getFiles(path);

        const aggregateContent = [];

        for (let file of files) {
            const content = await this.assistant.app.vault.read(file);
            for (let line of content.split("\n")) {
                if (/-\s\[( |x)\]/g.test(line)) {
                    aggregateContent.push(line);
                }
            }
        }

        await this.createNewFile(this.overviewPath, null, aggregateContent.join("\n"));
        if (!this.plugin.app.isMobile) this.tools.deleteFolder(path)
    }

    getLastMonthsTrackingPath(includeFolder: boolean=false, namedMonth: boolean=false, isMarkdown: boolean=false) {
        let date = new Date();

        // Get the year and month
        let year = date.getFullYear();
        let month = date.getMonth().toString().padStart(2, '0'); // Months are 0-indexed

        let path = "";

        if (includeFolder) path += this.TRACKING_FOLDER;
        if (namedMonth) path += `/${year}/${this.tools.getMonthName(date.getMonth())}`
        else path += `/${year}/${month}`
        if (isMarkdown) path += '.md'

        return path;
    }
}