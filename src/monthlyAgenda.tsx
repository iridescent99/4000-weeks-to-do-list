import {useEffect, useMemo, useState} from "react";


export function MonthlyAgenda()  {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())

    useEffect(() => {

    });

    const daysInMonth = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), currentMonth + 1, 0).getDate();
    },[currentMonth]);

    return (
     <div className="agenda-container">
         <div className="month-name-container">{new Date().toLocaleString('en-US', { month: 'long' })}</div>
         <div className="days-wrapper">
             {Array(daysInMonth).fill(0).map((_, index) => <DayBlock day={index+1} />)}
         </div>
        {/*<div className="menu">*/}
        {/*    <button>+</button>*/}
        {/*</div>*/}
     </div>
    )

}



function DayBlock({ day }: any) {

    useEffect(() => {
    },[])
    return (
        <div className="day-container">
            {day}
        </div>
    )
}