import {DailyNotesManager} from "./dailyNotesManager";
import {App, TFile} from "obsidian";


export class MDParser {
    app: App;
    noteManager: DailyNotesManager;

    constructor(noteManager: DailyNotesManager) {
        this.app = noteManager.assistant.app;
        this.noteManager = noteManager;
    }

    async migrateTrackingContent(oldFile: TFile, newFile: TFile) {

        const oldContent = await this.app.vault.read(oldFile);
        let newContent = await this.app.vault.read(newFile);

        const links = [this.noteManager.todaysSOCFilePath, this.noteManager.todaysDraftFilePath].map((path: string) => this.generateLink(path)).slice(0,2).join("\n") + "\n\n----\n";
        newContent += links

        let meta: string;
        let toDos: string;

        [meta, toDos] = oldContent.split("----");
        let incompleteTodos = toDos.split("\n").filter((line) => !line.includes("[x]")).join("\n");
        newContent += incompleteTodos;
        const cleanedContent = toDos.split("\n").filter((line) => line.includes('[x]'));

        await this.app.vault.modify(oldFile, [meta, cleanedContent.join("\n")].join("----\n"));
        await this.app.vault.modify(newFile, newContent);

    }

    generateLink(filePath: string) {
        const text = filePath.includes("Journaling") ? "today's stream of consciousness" : "today's draft"
        return `[[${filePath}|${text}]]`;
    }
}