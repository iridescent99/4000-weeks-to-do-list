import {StrictMode, useEffect, useMemo, useRef, useState} from "react";
import "./open_task_list.scss";
import {TaskListCategory} from "../taskListCategory";
import {Registry} from "../registry";
import {Category, Heading} from "../category";
import {Task} from "../Task";
import {AddUnitWindow} from "../addUnitWindow";
import {Notice} from "obsidian";
import {Simulate} from "react-dom/test-utils";
import select = Simulate.select;



export function OpenTaskListManager({ plugin, registry, navBar, toggleAddHeadingWindow, addHeadingWindow, addCategoryWindow, toggleCategoryWindow }: any) {
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category>();
    const [addTaskWindow, toggleAddTaskWindow] = useState(false);
    const [activeHeading, setActiveHeading] = useState<Heading>();
    const [reload, forceReload] = useState(0);
    const [style, setStyle] = useState({});
    const [gradient, setGradient] = useState<string>();
    const btn = useRef(null);
    const [noDataToggle, setNoDataToggle] = useState(false);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [showTree, toggleTree] = useState(true);
    const [nodeColor, setNodeColor] = useState<string>();

    useEffect(() => {
    
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
                    const grdnt = `linear-gradient(45deg, ${selectedCategory.gradient.length > 0 ? selectedCategory.gradient.join(", ") : "deeppink, cadetblue"})`;
                    setNodeColor(selectedCategory.gradient.length > 0 ? selectedCategory.gradient[0] : "deeppink");
                    if (navBar && navBar.current) {
                        for (let child of navBar.current.children) {
                            child.style.background = grdnt;
                        }
                    }
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

    const processCategoryCreation = (e: any) => {
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

    const addCategory = () => {

    }

    return (
        <>


            {noDataToggle && 
            <div className="no-data-div">
                <>{!creatingCategory ? "Can't find any categories.." : "Press enter to add category.."}</>
                <div>
                    {!creatingCategory && <button onClick={() => setCreatingCategory(true)}>create category</button>}
                    {creatingCategory && <input onKeyDown={(e) => processCategoryCreation(e)} onChange={(e) => setNewCategory(e.target.value)}/>}
                </div>
            </div>}



            <div className="vis-container">

            <div className="category-container">
                {selectedCategory && <TaskListCategory category={selectedCategory} gradient={gradient} addTask={activateTaskWindow} reload={reload} removeHeading={removeHeading} removeTask={removeTask} moveTask={moveTask} setStyle={setStyle} />}
            </div>
            </div>

            {addHeadingWindow && selectedCategory && <AddUnitWindow addUnit={addHeading} placeholder={"### Heading.."} closeWindow={closeHeadingWindow} gradient={gradient}/>}
            {addCategoryWindow && <AddUnitWindow addUnit={addCategory} placeholder={"New category..."} closeWindow={closeHeadingWindow} gradient={gradient}/>}
            {addTaskWindow && selectedCategory && <AddUnitWindow addUnit={addTask} placeholder={"Sample task.."} closeWindow={closeTaskWindow} gradient={gradient} />}
        </>
    )
}

