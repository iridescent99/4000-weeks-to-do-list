import {useEffect, useRef, useState} from "react"
import { OpenTaskListManager } from "./openTaskListManager";
import { ClosedTaskListManager } from "./closedTaskListManager";
import { PiHash, PiNote } from "react-icons/pi";
import { Registry } from "src/registry";
import "./toggle.css";
import "./taskListManager.css";


function transparentModal(modal: Element) {
    // @ts-ignore
    modal.style.background = "rgba(0,0,0,0.45)";
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



export function TaskListManager({ plugin, closedListPath, open, close }: any) {
    const [openClosedToggle, setOpenClosedToggle] = useState("open");
    const [registry, setRegistry] = useState(new Registry(plugin));
    const [addHeadingWindow, toggleAddHeadingWindow] = useState(false);
    const [addCategoryWindow, toggleCategoryWindow] = useState(false);
    const navBar = useRef(null);

    useEffect(() => {
        alterModalLayout();
    },[])

    const alterModalLayout = () => {
        const openTaskListModal = Array.from(document.getElementsByClassName("modal")).filter((modal) => modal.firstElementChild?.hasClass('task-view'));
        if (openTaskListModal.length === 1) {
            transparentModal(openTaskListModal[0]);
            if (plugin.app.isMobile) setMobileLayout(openTaskListModal[0]);
        }

        const modalContainer = Array.from(document.getElementsByClassName("modal-container")).filter((modal) => modal.firstElementChild?.hasClass('modal'));
        if (modalContainer.length === 1) alterContainer(modalContainer[0]);
    }

    const toggleOpenClosed = () => {
        if (openClosedToggle === "open") setOpenClosedToggle("closed");
        else setOpenClosedToggle("open");
    }

    return (
        <div className="task-view">
            <div className="task-view-header">
                <div className="toggle-container">
                    <input id="toggle-switch" onChange={() => toggleOpenClosed()} type="checkbox" className="toggle-checkbox"/>
                    <label htmlFor="toggle-switch" className="toggle-label">
                    <span className="toggle-inner"></span>
                    <span className="toggle-switch"></span>
                    </label>
                </div>
                <div className="task-view-title">
                    <h1>{openClosedToggle} task list</h1>
                </div>
                {openClosedToggle === "open" && <div ref={navBar} className="task-view-navigation">
                    <button onClick={() => toggleCategoryWindow(!addCategoryWindow)}>
                        <PiNote size={"1.8em"} />
                    </button>
                    <button onClick={() => toggleAddHeadingWindow(!addHeadingWindow)}>
                        <PiHash size={"1.8em"} />
                    </button>
                </div>}
            </div>



            {openClosedToggle === "open" &&
            <OpenTaskListManager 
                plugin={plugin} 
                registry={registry}
                navBar={navBar}
                toggleAddHeadingWindow={toggleAddHeadingWindow}
                addHeadingWindow={addHeadingWindow}
                addCategoryWindow={addCategoryWindow}
                toggleCategoryWindow={toggleCategoryWindow}
            />}
            {openClosedToggle === "closed" && 
            <ClosedTaskListManager 
                plugin={plugin} 
                registry={registry}
                closedListPath={closedListPath} 
                />}
        </div>
    )
}