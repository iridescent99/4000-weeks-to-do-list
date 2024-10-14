import {useEffect, useState} from "react";
import {Task} from "../Task";
import {ClosedTaskItem, TaskItem} from "../openTask";


export function ClosedTaskListManager({ plugin, registry }: any) {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (registry && tasks.length === 0) registry.loadClosedTasks().then((tasks: Task[]) => setTasks(tasks));

        return () => {
            setTasks([]);
        }
    },[])

    return (
        <div>
            {tasks && tasks.map((task: Task, index: number) => <ClosedTaskItem task={task} key={index} />)}
        </div>
    )
}