import "./addUnitWindow.css";
import {useEffect, useRef, useState} from "react";
import {Notice} from "obsidian";


export function AddUnitWindow({ addUnit, placeholder, closeWindow, gradient }: any) {
    const [newUnit, setNewUnit] = useState("");
    const windowRef = useRef(null);
    const [batch, setBatch] = useState(false);
    const [end, setEnd] = useState<number>();
    const [start, setStart] = useState<number>();

    useEffect(() => {
        function handleClickOutside(e: any) {
            // @ts-ignore
            if (windowRef.current && windowRef.current !== e.target && Array.from(windowRef.current.children).filter((child) => child === e.target).length === 0 && e.target.tagName !== "INPUT") {
                closeWindow();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        // @ts-ignore
        if (windowRef && windowRef.current) document.getElementsByClassName("unit-description")[0].focus();

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    },[windowRef]);

    const processUnitCreation = () => {
        if (!batch) return addUnit(newUnit);
        if (end && start) {
            for (let num of Array.from({ length: end - start + 1 }, (_, i) => start + i)) {
                addUnit(newUnit.replace("_", num.toString()));
            }
        } else {
            new Notice("Start and/or end not specified")
        }
    }

    return (
        <div
            className={"add-unit-container"}
            ref={windowRef}
            tabIndex={0}
            style={{background: gradient}}
            onKeyDown={(e) => e.key==="Enter" && addUnit(newUnit)}
        >
            {placeholder.toLowerCase().includes("task") && <><input type={"checkbox"} onChange={(e) => setBatch(e.target.checked)}/><label>Create batch</label></>}
            {batch && <div>
                Specify start and end of the range. Use _ in your task where the number should come.
                <input onChange={(e) => setStart(parseInt(e.target.value))} placeholder={"Start"} />
                <input onChange={(e) => setEnd(parseInt(e.target.value))} placeholder={"End"} />
            </div>}
            <input className="unit-description" onChange={(e) => setNewUnit(e.target.value)} placeholder={placeholder}/>
            <button onClick={() => processUnitCreation()}>add</button>
        </div>
    )
}

