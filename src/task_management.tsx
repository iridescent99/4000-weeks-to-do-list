import {App, Plugin, TFile} from "obsidian";
import WorkflowPlugin, {taskCollection, TaskItem} from "./main";


export async function moveTaskItem(event: Event, plugin: WorkflowPlugin) {
    console.log("clicked");
    const el = event.target as HTMLElement;
    const id = el.getAttribute('taskid') || "";
    const task = taskCollection[id];

    console.log(task)

    const targetFile = plugin.dailyNotesManager.trackingFile;
    const sourceFile = plugin.app.vault.getAbstractFileByPath(`${plugin.dailyNotesManager.TRACKING_FOLDER}/_OPEN TO DO LIST.md`) as TFile;

    let targetContent = await plugin.app.vault.read(targetFile);
    let sourceContent = await plugin.app.vault.read(sourceFile);

    let response = placeItemInHierarchy(targetContent.split("\n"), task);

    if (response.status === 200) {
        await plugin.app.vault.modify(targetFile, response.body);
        await plugin.app.vault.modify(sourceFile, sourceContent.split("\n").filter((line) => line !== task.md[0]).join("\n"));
    } else {
        console.error(response.error);
    }

}

function triggerRefresh() {
    
}

function findIndexOfLine(queryString: string, lines: string[]) {
    return lines.findIndex((line => line.includes(queryString)));
}

interface HeadingsChecker {
    [key: string]: HeadingMeta;
}

interface HeadingMeta {
    match: boolean;
    previousHeading: Element|null;
    targetIndex: number;
}

interface Response {
    status: number;
    body: any;
    error?: any;
}

function findAnchorPoint(key: string): Response {
    let [level, heading] = key.split("_");
    let errorResponse = {status: 500, error: "Could not find anchor point.", body: {}};
    let anchorPoint = null;
    const byTag = Array.from(document.getElementsByTagName(`h${level}`));
    if (byTag.length === 0) return errorResponse;

    const byText = byTag.filter((el) => el.textContent?.includes(heading));

    if (byText.length === 0) return errorResponse;

    if (byText.length > 1) return {
        status: 500,
        body: {},
        error: "Multiple anchor points found."
    }

    return {
        status: 200,
        body: anchorPoint
    }
}


function placeItemInHierarchy(targetContent: string[], task: TaskItem): Response {

   const response = checkExistenceHeadings(task, targetContent);
   if (response.status !== 200) return response;

   const headingsChecker = response.body;

   console.log(headingsChecker)

   let lastMatchingHeadingIndex = -1;

   for (let [key, value] of Object.entries(headingsChecker)) {
       if (headingsChecker[key].match) {
           lastMatchingHeadingIndex = headingsChecker[key].targetIndex;
           continue;
       }

       let [level, heading] = key.split("_");

       targetContent.splice(lastMatchingHeadingIndex + 1, 0, `${"#".repeat(parseInt(level))} ${heading}`);
       lastMatchingHeadingIndex += 1;

   }

   targetContent.splice(lastMatchingHeadingIndex + 1, 0, task.md[0]);

    return {
        status: 200,
        body: targetContent.join("\n"),
    }
}


function determineClosestParentHeading(el: HTMLElement) {
    const parentDiv = el.parentElement;
    const container = parentDiv?.parentElement;
    if (parentDiv && container) {
        const startIndex = container.indexOf(parentDiv);
        for (let i = startIndex - 1; i >= 0; i--) {
            // @ts-ignore
            if (container.children[i].firstElementChild.tagName.split("")[0].toUpperCase() === "H") {
                return container.children[i].firstElementChild;
            }
        }
    }
    return null;
}

function determineTargetIndex(heading: Element, targetContent: string[]): number {
    let index = -1;
    console.log(heading)
    targetContent.forEach((line, i) => {
        // @ts-ignore
        if (line.toLowerCase().includes(heading.getAttribute('data-heading').toLowerCase())) index = i;
        return index;
    })
    return index;
}


function checkExistenceHeadings(task: TaskItem, content: string[]): Response {

    // First get parent container to be able to determine child indices.
    let parentContainer = document.getElementsByTagName("h1")[0].parentElement?.parentElement;

    if (!parentContainer) return ({status: 500, body: {}, error: "No parent container found."});

    let headingsChecker: HeadingsChecker = task.headings.reduce((acc: HeadingsChecker, key: string) => {
        acc[key] = {match: false, previousHeading: null, targetIndex: -1};
        return acc;
    }, {});

    let previousParentHeading = null;
    for (let i = 0; i < task.headings.length; i++) {
        // Check from largest to smallest, otherwise might register more generic ones as existing at different location (e.g. week 1)
        const heading = task.headings[i];
        let [level, text] = heading.split("_");

        const elementsByTag = document.getElementsByTagName(`h${level}`);
        if (elementsByTag.length === 0) {
            headingsChecker[heading] = {...headingsChecker[heading], previousHeading: previousParentHeading};
            previousParentHeading = null;
            continue;
        }

        const elementsByText = Array.from(elementsByTag).filter((el) => el.textContent?.includes(text));

        // If it's level one no need to check for closest parent
        if (elementsByText.length === 1 && level === "1") {
            // @ts-ignore
            headingsChecker[heading] = {match: true, previousHeading: previousParentHeading, targetIndex: determineTargetIndex(elementsByText[0], content)};
            previousParentHeading = elementsByText[0];
            continue;
        }

        let match = false;

        // Check if closest parentHeading is
        for (let j = 0; j < elementsByText.length; j++) {
            // @ts-ignore
            const closestParentHeading = determineClosestParentHeading(elementsByText[j])
            if (closestParentHeading === previousParentHeading) {
                // @ts-ignore
                headingsChecker[heading] = {match: true, previousHeading: previousParentHeading, targetIndex: determineTargetIndex(elementsByText[j], content)};
                previousParentHeading = elementsByText[j];
                match = true;
                break;
            }
        }

        if (!match) {
            headingsChecker[heading] = {...headingsChecker[heading], previousHeading: previousParentHeading};
            previousParentHeading = null;
        }

    }

    return {
        status: 200,
        body: headingsChecker
    }
}

