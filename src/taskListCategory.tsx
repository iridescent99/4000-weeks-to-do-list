import {useEffect, useMemo, useState} from "react";
import {Task} from "./Task";
import {TaskItem} from "./openTask";

function Heading({ heading, addTask, removeHeading }: any) {
    const html = useMemo(() => {
        switch (heading.level) {
            case 1:
                return <h1>{heading.heading}</h1>
            case 2:
                return <h2>{heading.heading}</h2>
            case 3:
                return <h3>{heading.heading}</h3>
            case 4:
                return <h4>{heading.heading}</h4>
            case 5:
                return <h5>{heading.heading}</h5>
            case 6:
                return <h6>{heading.heading}</h6>
            default:
                return <></>
        }
    },[heading]);

    return (
        <div tabIndex={0}
             onDoubleClick={(e) => addTask(heading)}
             onContextMenu={(e) => removeHeading(heading)}
        >
            {html}
        </div>
    )
}

export function TaskListCategory({ category, addTask, gradient, reload, removeHeading, removeTask, moveTask, setStyle }: any) {
    const [labels, setLabels] = useState<string[]>([]);

    return (
        <div className="task-list-category">
            <div className="task-list-labels">
                {labels.map((label, i) => <><div className="task-list-label">{label}</div>{i !== labels.length - 1 && <span style={{background: gradient}} className={"arrow"}><b>{">"}</b></span>}</>)}
            </div>
            <div className="category-title">
                <h2>{category.name}</h2>
            </div>
            <div className="task-list">
                <div>
                    {category.tasks.filter((task: Task) => task.anchorHeading.trim().toLowerCase() === category.name.trim().toLowerCase()).map((task: Task, i:number) => <TaskItem key={i} task={task} gradient={gradient} removeTask={removeTask} moveTask={moveTask} reload={reload}/>)}
                    {category.headings && category.headings.map((heading:any) => (
                        <>
                            <Heading heading={heading} addTask={addTask} removeHeading={removeHeading} />
                            {category.tasks.filter((task: Task) => task.anchorHeading.toLowerCase().trim() === heading.heading.trim().toLowerCase()).map((task: Task, i: number) => <TaskItem key={i} task={task} gradient={gradient} removeTask={removeTask} moveTask={moveTask} reload={reload} />)}
                        </>))}
                </div>
            </div>
            <div className={`${category.name} task-list-page`} style={{background:gradient}}>
            </div>
        </div>
    )
}