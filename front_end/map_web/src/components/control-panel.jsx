import * as React from 'react';
import { useState } from "react";

const DateRangeSlider = (props) => {
    // Create an array of dates from 2022-01 to 2024-11
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

    const handleChange = (evt) => {
        const newIndex = parseInt(evt.target.value, 10);
        setIndex(newIndex);
        props.onChange(dates[newIndex]); // Pass the selected date
    };

    return (
        <div className="input">
            <label>Year - Month {dates[index]}</label>
            <input
                type="range"
                min={0}
                max={dates.length - 1}
                value={index}
                step={1}
                onChange={handleChange}
            />
        </div>
    );
};




function ControlPanel(props) {
  const {year} = props;

  return (
    <div className="control-panel">
      <h3>New York Taxi Trip Flow Map</h3>
      <p>
          Use the filter to select a specific year and month (yyyy-mm) to visualize New York taxi trip data.
      </p>

        <DateRangeSlider onChange={props.onChange} />
    </div>
  );
}

export default React.memo(ControlPanel);
