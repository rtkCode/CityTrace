import { addDays, format } from 'date-fns';
import { DayPicker } from 'react-day-picker';

import 'react-day-picker/dist/style.css';
import '../styles/Calendar.css'

export default function Calendar(props) {
    const today = new Date()

    const defaultRange = {
        from: today,
        // to: addDays(today, 4)
        to: today
    }

    const range = props.dateRange ? props.dateRange : defaultRange

    let footer = <p className="calendar-text"><small>Please pick the first day</small></p>;
    if (range?.from) {
        if (!range.to) {
            footer = <p className="calendar-text"><small>{format(range.from, 'PPP')}</small></p>;
        } else if (range.to) {
            footer = (
                <div>
                    <p className="calendar-text"><small><strong>from: </strong>{format(range.from, 'PPP')}</small></p>
                    <p className="calendar-text"><small><strong>to: </strong>{format(range.to, 'PPP')}</small></p>
                </div>
            );
        }
    }

    function selectAllDates() {
        props.setDateRange(null)
        props.setCalendarOpen(false)
    }

    return (
        <>
            <DayPicker mode="range" defaultMonth={today} selected={range} footer={footer} onSelect={props.setDateRange} />
            <div className="calendar-button-container">
                <div className="calendar-button calendar-button-alldate" onClick={selectAllDates}>All dates</div>
                <div className="calendar-button" onClick={() => props.setCalendarOpen(false)}>Select</div>
            </div>
        </>
    );
}