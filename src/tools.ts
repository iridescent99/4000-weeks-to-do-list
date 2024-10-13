import WorkflowAssistant from "./index";
import {TFile, TFolder, WorkspaceLeaf} from "obsidian";
import path from "path";
import fs from "fs";
import FourThousandWeeks from "./index";


export class Tools {
    assistant: FourThousandWeeks;
    MONTHS: string[] = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    constructor(private plugin: FourThousandWeeks) {
        this.assistant = plugin;
    }

    async commitPushAndPull() {
        // Wait for Git to be finished pulling if Git plugin present 
        // @ts-ignore
        if (this.assistant.app.commands.commands['obsidian-git:commit']) {
            return new Promise((resolve, reject) => {
            // @ts-ignore
            this.assistant.app.commands.executeCommandById('obsidian-git:commit');
            // @ts-ignore
            this.assistant.app.commands.executeCommandById('obsidian-git:push');
            // @ts-ignore
            this.assistant.app.commands.executeCommandById('obsidian-git:pull');
            setTimeout(() => resolve(200), 8000);
        })
        }
    }

    async openAndPinFile(file: TFile) {
        // Create new pane
        let leaf;
        while (!leaf) {
            leaf = await this.getLeaf(file.path);
        }
        if (leaf) {
            leaf.setPinned(true);
        }
    }

    getLeaves() {
        return this.assistant.app.workspace.getLeavesOfType('markdown');
    }

    getActiveLeaf(path?: string) {
        const openFiles = this.getLeaves();

        const filePath = path ? path : (this.assistant.app.workspace.getActiveFile() as TFile).path;

        for (const leaf of openFiles) {
            // @ts-ignore
            const file = leaf.view?.file as TFile;
            if (file && file.path === filePath) {
                return leaf;
            }
        }
        return null;
    }

    // @ts-ignore
    async getLeaf(filePath: string): Promise<WorkspaceLeaf|null> {
        let fileLeaf: WorkspaceLeaf|null = this.getActiveLeaf(filePath);

        if (!fileLeaf) {
            const file = this.assistant.app.vault.getAbstractFileByPath(filePath);

            if (file instanceof TFile) {
                fileLeaf = this.assistant.app.workspace.getLeaf(true);
                while (!fileLeaf) {
                    fileLeaf = this.assistant.app.workspace.getLeaf(true);
                }
                await fileLeaf.openFile(file);
            }
        }

        return fileLeaf;

    }

    generateDatePath(folder: string, subtractDays: number = 0) {
        const date = new Date();

        date.setDate(date.getDate() - subtractDays);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${folder}/${year}/${month}/${this.generatePrefix(folder)}${year}-${month}-${day}.md`
    }

    generatePrefix(folder: string) {
        return folder.includes("Journaling") ? 'soc_' : folder.includes('Draft') ? 'draft_' : 'tracker_'
    }

    async validateFolders(folderPath: string) {

        const vault = this.assistant.app.vault;

        const folderExists = vault.getAbstractFileByPath(folderPath) instanceof TFolder;

        if (!folderExists) {
            // Split the folder path into its parts and create each one recursively
            const parts = folderPath.split('/');
            let currentPath = '';

            for (const part of parts) {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                let folder = vault.getAbstractFileByPath(currentPath);

                if (!folder) {
                    try {
                        await vault.createFolder(currentPath);
                        console.log(`Created folder: ${currentPath}`);
                    } catch (e) {
                        console.log(e)
                    }

                }
            }
        }
    }

    copyFile(source: string, destination: string) {

        const basePath = (this.assistant.app.vault.adapter as any).basePath
        const destPath = path.join(basePath, destination);
        const sourcePath = path.join(basePath, source);

        try {
            fs.copyFileSync(sourcePath, destPath);
        } catch (err) {
            console.log(err)
        }
    }

    isFirstDayOfMonth() {
        return new Date().getDate() === 1;
    }

    getFiles(prefix?: string, suffix?: string) {
        const allFiles = this.assistant.app.vault.getFiles();

        if (prefix && suffix) {
            return allFiles.filter((file) => file.path.startsWith(prefix) && file.path.endsWith(suffix))
        } else if (prefix) {
            return allFiles.filter((file) => file.path.startsWith(prefix));
        } else if (suffix) {
            return allFiles.filter((file) => file.path.endsWith(suffix))
        }
        return allFiles;
    }

    async createFile(path: string, data: string) {
        await this.assistant.app.vault.create(path, data);
    }

    deleteFolder(folderPath: string) {
        const basePath = (this.assistant.app.vault.adapter as any).basePath
        const fullPath = path.join(basePath, folderPath);

        try {
            fs.rmSync(fullPath,{recursive: true, force: true});
        } catch (err) {
            console.log(err)
        }
    }

    getMonthName(monthNumber: number) {
        return this.MONTHS[monthNumber - 1];
    }


}