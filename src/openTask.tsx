import {useEffect, useMemo} from "react";
import {Notice} from "obsidian";

export function TaskItem({task, gradient, removeTask, moveTask, reload }: any) {

    useEffect(() => {
    },[]);


    const formattedText = useMemo(() => {
        let html = task.plainText;
        if (/`([^`]+)`/g.test(task.plainText)) html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        return html;
    },[task]);

    const processCheck = (e: any) => {
        e.preventDefault();
        moveTask(task, true)
    }

    return (
        <div className={`task ${task.completed ? "complete" : "incomplete"} ${task.inClosedList ? "in-closed" : "not-in-closed"}`}
             tabIndex={0}
             onClick={(e) => moveTask(task)}
             onContextMenu={(e) => removeTask(task)}
        >

            <div className="task-container">
                <input
                    type="checkbox"
                    checked={task.completed}
                    style={{background:gradient}}
                    onClick={(e) => processCheck(e)}
                />
                <div className="task-content" dangerouslySetInnerHTML={{ __html: formattedText }} />
            </div>

            <div>{task.subtasks.length > 0 &&
                task.subtasks.map((subtask: string) => {
                    return (<div className="task-container">
                        &nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" checked={task.completed} style={{background:gradient}} />
                        <div className="subtask-content">{subtask}</div>
                    </div>)
                })
            }
            </div>
        </div>
    )
}

export function ClosedTaskItem({ task }: any) {

    const formattedText = useMemo(() => {
        let html = task.plainText;
        if (/`([^`]+)`/g.test(task.plainText)) html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        return html;
    },[task]);

    const processCheck = (e: any) => {
        e.preventDefault();
        // moveTask(task, true)
    }

    return (
        <div className={`task ${task.completed ? "complete" : "incomplete"} ${task.inClosedList ? "in-closed" : "not-in-closed"}`}
             tabIndex={0}
        >

            <div className="task-container" id={task.plainText}>
                <input
                    type="checkbox"
                    checked={task.completed}
                    onClick={(e) => processCheck(e)}
                />
                <div className="task-content" dangerouslySetInnerHTML={{ __html: formattedText }} />
            </div>

            <div>{task.subtasks.length > 0 &&
                task.subtasks.map((subtask: string) => {
                    return (<div className="task-container">
                        &nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" checked={task.completed} />
                        <div className="subtask-content">{subtask}</div>
                    </div>)
                })
            }
            </div>
        </div>
    )
}