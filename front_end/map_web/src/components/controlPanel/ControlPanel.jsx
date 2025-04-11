import * as React from 'react';
import { useState } from "react";
import "./ControlPanel.css"; // We'll create this CSS file

const DateRangeSlider = (props) => {
    // Create an array of dates from 2024-01 to 2024-11
    const dates = [];
    const startYear = 2024;
    const startMonth = 1;
    const endYear = 2024;
    const endMonth = 11;

    for (let year = startYear; year <= endYear; year++) {
        const monthStart = year === startYear ? startMonth : 1;
        const monthEnd = year === endYear ? endMonth : 12;

        for (let month = monthStart; month <= monthEnd; month++) {
            dates.push(`${year}-${month.toString().padStart(2, "0")}`);
        }
    }

    const [index, setIndex] = useState(0);
    
    // Get month name for display
    const getMonthName = (dateStr) => {
        const month = parseInt(dateStr.split('-')[1]);
        return new Date(2024, month - 1).toLocaleString('default', { month: 'long' });
    };

    const handleChange = (evt) => {
        const newIndex = parseInt(evt.target.value, 10);
        setIndex(newIndex);
        props.onChange(dates[newIndex]); // Pass the selected date
    };
    
    // Handle step buttons
    const handlePrev = () => {
        if (index > 0) {
            const newIndex = index - 1;
            setIndex(newIndex);
            props.onChange(dates[newIndex]);
        }
    };
    
    const handleNext = () => {
        if (index < dates.length - 1) {
            const newIndex = index + 1;
            setIndex(newIndex);
            props.onChange(dates[newIndex]);
        }
    };

    return (
        <div className="date-slider-container">
            <div className="current-date">
                <span className="month-name">{getMonthName(dates[index])}</span>
                <span className="year-number">{dates[index].split('-')[0]}</span>
            </div>
            
            <div className="slider-controls">
                <button 
                    className="nav-button" 
                    onClick={handlePrev}
                    disabled={index === 0}
                >
                    ◀
                </button>
                
                <div className="slider-wrapper">
                    <input
                        type="range"
                        min={0}
                        max={dates.length - 1}
                        value={index}
                        step={1}
                        onChange={handleChange}
                        className="date-slider"
                    />
                    <div className="slider-ticks">
                        {dates.map((_, i) => (
                            <div 
                                key={i} 
                                className={`tick ${i === index ? 'active' : ''}`}
                                style={{ left: `${(i / (dates.length - 1)) * 100}%` }}
                            />
                        ))}
                    </div>
                </div>
                
                <button 
                    className="nav-button"
                    onClick={handleNext}
                    disabled={index === dates.length - 1}
                >
                    ▶
                </button>
            </div>
            
            <div className="date-labels">
                <span>{getMonthName(dates[0])} {dates[0].split('-')[0]}</span>
                <span>{getMonthName(dates[dates.length - 1])} {dates[dates.length - 1].split('-')[0]}</span>
            </div>
        </div>
    );
};

function ControlPanel(props) {
    return (
        <div className="control-panel">
            <h3>NYC Taxi Destination Routes</h3>
            <DateRangeSlider onChange={props.onChange} />
        </div>
    );
}

export default React.memo(ControlPanel);