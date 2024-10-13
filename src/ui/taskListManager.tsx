import { useEffect, useState } from "react"
import { OpenTaskListManager } from "./openTaskListManager";
import { ClosedTaskListManager } from "./closedTaskListManager";
import { Registry } from "src/registry";
import "./toggle.css";


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
    const [registry, setRegistry] = useState(new Registry(plugin, closedListPath));

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
            <div className="toggle-container">
                <input id="toggle-switch" onChange={() => toggleOpenClosed()} type="checkbox" className="toggle-checkbox"/>
                <label htmlFor="toggle-switch" className="toggle-label">
                <span className="toggle-inner">{openClosedToggle === "open" ? "O" : "C"}</span>
                <span className="toggle-switch"></span>
                </label>
            </div>
            {openClosedToggle === "open" && 
            <OpenTaskListManager 
                plugin={plugin} 
                registry={registry}
                closedListPath={closedListPath} 
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