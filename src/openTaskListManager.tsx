import {StrictMode, useEffect, useMemo, useRef, useState} from "react";
import "./open_task_list.css";
import {TaskListCategory} from "./taskListCategory";
import {Registry} from "./registry";
import {Category, Heading} from "./category";
import {Task} from "./Task";
import {AddUnitWindow} from "./addUnitWindow";
import {Notice} from "obsidian";
import {Simulate} from "react-dom/test-utils";
import select = Simulate.select;


function transparentModal(modal: Element) {
    // @ts-ignore
    modal.style.background = "rgba(0,0,0,0.65)";
    // @ts-ignore
    modal.style.border = "none";
    // @ts-ignore
    modal.style.height = "80%";
    // @ts-ignore
    modal.style.width = "100%";
    // @ts-ignore
    modal.style.backdropFilter = "blur(20px)";
    // @ts-ignore
    modal.style.padding = "2em";
}

function setMobileLayout(modal: Element) {
    // @ts-ignore
    modal.style.top = "0";
    // @ts-ignore
    modal.style.padding = "0";
    // @ts-ignore
    modal.style.height = "90%";
    // @ts-ignore
    modal.style.overflow = "hidden";
}

function alterContainer(container: Element) {

    // @ts-ignore
    modal.style.width = "90%";
    // @ts-ignore
    modal.style.padding = "0";
}


export function OpenTaskListManager({ plugin, closedListPath, open, close }: any) {
    const [registry, setRegistry] = useState(new Registry(plugin, closedListPath));
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category>();
    const [addHeadingWindow, toggleAddHeadingWindow] = useState(false);
    const [addTaskWindow, toggleAddTaskWindow] = useState(false);
    const [activeHeading, setActiveHeading] = useState<Heading>();
    const [reload, forceReload] = useState(0);
    const [style, setStyle] = useState({});
    const [gradient, setGradient] = useState<string>();
    const btn = useRef(null);
    const [noDataToggle, setNoDataToggle] = useState(false);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState("");

    useEffect(() => {
        alterModalLayout();
        const categories = registry.getCategories();
        if (categories.length > 0) {
            setCategories(categories);
            setSelectedCategory(registry.createCategory(categories[0]));
        } else {
            setNoDataToggle(true);
        }
        
    },[]);

    useEffect(() => {
        const initializeTasks = async () => {
            if (selectedCategory) {
                await selectedCategory.retrieveTasks().then(() => {
                    const grdnt = `linear-gradient(45deg, ${selectedCategory.gradient.join(", ")})`;
                    setGradient(grdnt);
                    return grdnt
                }).then((grdnt: string) => {
                    if (btn && btn.current) {
                        console.log(grdnt)
                        // @ts-ignore
                        btn.current.style.background = grdnt
                    }
                });
            }
        }
        initializeTasks();
    },[selectedCategory])

    const loadCategory = async (name: string) => {
        setSelectedCategory(registry.createCategory(name));
    }

    const alterModalLayout = () => {
        const openTaskListModal = Array.from(document.getElementsByClassName("modal")).filter((modal) => modal.firstElementChild?.hasClass('open-task-list-view'));
        if (openTaskListModal.length === 1) {
            transparentModal(openTaskListModal[0]);
            if (plugin.app.isMobile) setMobileLayout(openTaskListModal[0]);
        }


        const modalContainer = Array.from(document.getElementsByClassName("modal-container")).filter((modal) => modal.firstElementChild?.hasClass('modal'));
        if (modalContainer.length === 1) alterContainer(modalContainer[0]);
    }

    const addTask = (task: string) => {
        if (!activeHeading) new Notice("No active heading, cannot create task!");
        if (selectedCategory && activeHeading) {
            selectedCategory.addTask(activeHeading, task, selectedCategory);
            forceReload((reload) => reload + 1);
            toggleAddTaskWindow(false);
        }
    }

    const addHeading = (heading: string) => {
        if (selectedCategory) {
            const headingObject = selectedCategory.addHeading(selectedCategory, heading);
            setActiveHeading(headingObject);
            forceReload((reload) => reload + 1);
            toggleAddHeadingWindow(false);
        }
    }

    const activateTaskWindow = (heading: Heading) => {
        setActiveHeading(heading);
        toggleAddTaskWindow(true);
    }

    const removeHeading = (heading: any) => {
        if (selectedCategory) selectedCategory.removeHeading(selectedCategory, heading);
        forceReload((reload) => reload + 1);
    }

    const removeTask = (task: Task) => {
        if (selectedCategory) selectedCategory.removeTask(selectedCategory, task);
        forceReload((reload) => reload + 1);
    }

    const closeTaskWindow = () => toggleAddTaskWindow(false);
    const closeHeadingWindow = () => toggleAddHeadingWindow(false);

    const moveTask = (task: Task, check= false) => {
        if (registry && selectedCategory) {
            if (check) {
                selectedCategory.checkTask(selectedCategory, task);
                task.md = task.md.replace("[ ]", "[x]")
            }
            registry.moveTask(registry, selectedCategory, task, check);
            forceReload((reload) => reload + 1);
        }
    }

    const processCategoryCreation = (e) => {
        if (e.key === "Enter" && newCategory.length > 0) {
    
            if (registry) {
                let newCat = registry.createCategory(newCategory, false)
                setSelectedCategory(newCat);
                setCategories([newCategory]);
                setNoDataToggle(false);
                setNewCategory("");
            }
        }
    }

    return (
        <div className="open-task-list-view">
            {!noDataToggle && <div className="open-task-list-select">
                <select onChange={(e) => loadCategory(e.target.value)}>
                    {categories.map((cat: string) => <option>{cat}</option>)}
                </select>
                {style && <button
                    ref={btn}
                    style={style}
                    className={"open-list-add-heading-button"}
                    onClick={() => toggleAddHeadingWindow(!addHeadingWindow)}
                >+</button>}
            </div>}

            {noDataToggle && 
            <div className="no-data-div">
                {!creatingCategory && <>Can't find any categories..</>}
                {creatingCategory && <>Press enter to add category..</>}
                <div>
                    {!creatingCategory && <button onClick={() => setCreatingCategory(true)}>create category</button>}
                    {creatingCategory && <input onKeyDown={(e) => processCategoryCreation(e)} onChange={(e) => setNewCategory(e.target.value)}/>}
                </div>
            </div>}

            {selectedCategory && <TaskListCategory category={selectedCategory} gradient={gradient} addTask={activateTaskWindow} reload={reload} removeHeading={removeHeading} removeTask={removeTask} moveTask={moveTask} setStyle={setStyle} />}
            {addHeadingWindow && selectedCategory && <AddUnitWindow addUnit={addHeading} placeholder={"### Heading.."} closeWindow={closeHeadingWindow} gradient={gradient}/>}
            {addTaskWindow && selectedCategory && <AddUnitWindow addUnit={addTask} placeholder={"Sample task.."} closeWindow={closeTaskWindow} gradient={gradient} />}
        </div>
    )
}

