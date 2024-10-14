import { PluginSettingTab, App } from "obsidian";
import FourThousandWeeks from "src";



export class FourThousandWeeksSettingsTab extends PluginSettingTab {
	plugin: FourThousandWeeks;


	constructor(app: App, plugin: FourThousandWeeks) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h1', {text:'4000 Weeks Settings'});
		containerEl.createEl('h2', {text: 'Open to do list(s)'})
		this.addArraySetting('Open list folder', 'openToDoListFolder')
        containerEl.createEl('h2', {text: 'Closed to do list(s)'})
		this.addArraySetting('Closed list location', 'closedToDoListLocation');
	}

	addArraySetting(settingTitle: string, settingReference: string, description = "") {
		const { containerEl } = this;
		const settingContainer = containerEl.createDiv()
		settingContainer.createEl('h6', {text:settingTitle})
		settingContainer.createDiv({text: description})
		// @ts-ignore
		this.addTextField(settingContainer, settingReference, this.plugin.settings[settingReference]);
        // @ts-ignore
		const input = containerEl.createEl('input', {placeholder: this.plugin.settings[settingReference]});
		input.addEventListener('change', (e: any) => {
			this.saveSetting(settingReference, e.target.value);
		})
        if (settingReference.includes("Folder")) {
            input.addEventListener('focus', () => {
                // TODO: show all possible folders
                this.plugin.app.vault.getAllFolders()
            })
        }
	}

	saveSetting(reference: string, value='') {
		// TODO: Perform check if path is accurate
		// @ts-ignore
		this.plugin.settings[reference] = value;
		this.plugin.saveSettings()
;	}

	saveMultipleTextValues(containerEl: HTMLElement, reference: string) {
		// @ts-ignore
		const textValues = Array.from(containerEl.querySelectorAll(`.${reference}`)).map((el: HTMLInputElement) => el.value);
		// @ts-ignore
		this.plugin.settings[reference] = textValues;
		this.plugin.saveSettings();
	}
}