import React from 'react';
import './index.css';
import { Label } from 'react-bootstrap';
import moment from 'moment-timezone';

/* Presentational component to render user information */
export default ({
  timeTrackData,
  preferredWorkingHoursPerDay = null,
}: {
  timeTrackData: Object,
  preferredWorkingHoursPerDay: ?number,
}) => {
  let rowClass = '';
  if (preferredWorkingHoursPerDay) {
    if (preferredWorkingHoursPerDay <= timeTrackData.duration) {
      rowClass = 'timeTrackSuccess';
    } else {
      rowClass = 'timeTrackFailure';
    }
  }
  return (
    <div className={`TimeTrackRow ${rowClass}`}>
      <div className="TimeTrackDate">
        {moment(timeTrackData.date).format('YYYY-MM-DD')}
      </div>
      <div className="TimeTrackDuration">
        <Label bsStyle="warning">{`${timeTrackData.duration}hours`}</Label>
      </div>
      <div className="TimeTrackNote">{timeTrackData.note}</div>
    </div>
  );
};
