// @flow
import React, { Component } from 'react';
import {
  HelpBlock,
  FormGroup,
  FormControl,
  ControlLabel,
  PageHeader,
} from 'react-bootstrap';
import { LoaderButton } from '../../components';
import DatePicker from 'react-bootstrap-date-picker-react16';
import moment from 'moment-timezone';
import { IN_PROGRESS, FAILED } from '../../commons/constants';
import './index.css';

type Props = {
  timeTrackCreationState: Object,
  createTimeTrack: () => *,
  isAdmin: boolean,
  submitString: string, // this is used to customize save button of the form
  loadingString: string,
  redirectAbsolute: boolean,
  userId: string,
};

type State = {
  note: { value: string, isValid: string | null, message: string },
  date: {
    value: string,
    isValid: string | null,
    message: string,
  },
  duration: {
    value: number,
    isValid: string | null,
    message: string,
  },
};

/* Reusable component for creating users */
export class TimeTrackCreator extends Component<Props, State> {
  state = {
    note: { value: '', isValid: null, message: '' },
    duration: { value: 0, isValid: null, message: '' },
    date: { value: moment().format('YYYY-MM-DD'), isValid: null, message: '' },
  };
  static defaultProps = {
    redirectAbsolute: false,
  };

  /**
   * Validate note field
   */
  validateNote = (note: ?string) => {
    return true;
  };
  /**
   * handles note value change
   *
   * @memberof TimeTrackCreator
   */
  onNoteChange = (event: Event) => {
    const newNotevalue = this.validateNote(event.target.value)
      ? { value: event.target.value, isValid: 'success', message: '' }
      : {
          value: event.target.value,
          isValid: 'error',
          message: 'note should be a non empty string',
        };

    this.setState({ note: newNotevalue });
  };

  /**
   *
   * helper method to validate if string is a valid date
   * date is being passed via component so assume it to correct
   * @memberof TimeTrackCreator
   */
  validateDate = (email: string) => {
    return true;
  };
  /**
   * Email val change handler
   * @memberof TimeTrackCreator
   */
  onDateChange = (value: string, formattedValue: string) => {
    const newDatevalue = this.validateDate(formattedValue)
      ? { value: formattedValue, isValid: 'success', message: '' }
      : {
          value: formattedValue,
          isValid: 'error',
          message: 'This is not a valid date format',
        };

    this.setState({ date: newDatevalue });
  };

  /**
   *
   * helper method to duration
   * @memberof TimeTrackCreator
   */
  validateDuration = (duration: number) => {
    return (
      !duration ||
      (!isNaN(parseFloat(duration)) &&
        isFinite(duration) &&
        parseFloat(duration) >= parseFloat(0) &&
        parseFloat(duration) <= parseFloat(24))
    );
  };
  /**
   * duration value change handler
   * @memberof TimeTrackCreator
   */
  onDurationChange = (event: Event) => {
    const newDurationValue = this.validateDuration(event.target.value)
      ? { value: event.target.value, isValid: 'success', message: '' }
      : {
          value: event.target.value,
          isValid: 'error',
          message: 'Duration should be between 0 and 24',
        };

    this.setState({ duration: newDurationValue });
  };

  /**
   * Validates from and return result if form can be submitted or not
   *
   * @memberof TimeTrackCreator
   */
  canProceed = (event: ?Event) => {
    return (
      this.validateNote(this.state.note.value) &&
      this.validateDate(this.state.date.value) &&
      this.validateDuration(this.state.duration.value)
    );
  };

  /**
   * Handles submit event of the form
   * @memberof TimeTrackCreator
   */
  onSubmit = (event: Event) => {
    event.preventDefault();
    const canProceed = this.canProceed();

    if (canProceed) {
      const payload = {
        userId: this.props.userId,
        note: this.state.note.value,
        duration: this.state.duration.value,
        date: this.state.date.value,
        redirectAbsolute: this.props.redirectAbsolute,
      };
      this.props.createTimeTrack(payload);
    }
  };

  render() {
    const { note, duration, date } = this.state;

    const headerMessage =
      this.props.timeTrackCreationState.status === FAILED ? (
        <div className="ErrorMessage">
          Unable to create Time track. Following error occurred:
          <div>{this.props.timeTrackCreationState.error}</div>
        </div>
      ) : null;

    return (
      <div className="TimeTrackCreator">
        <PageHeader>
          Create new Time track{this.props.isAdmin ? `(as Admin)` : ''}
        </PageHeader>
        {headerMessage}
        <form onSubmit={this.onSubmit}>
          <FormGroup
            controlId="note"
            bsSize="large"
            validationState={note.isValid}
          >
            <ControlLabel>Note</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              value={note.value}
              onChange={this.onNoteChange}
            />
            <HelpBlock>{note.message}</HelpBlock>
          </FormGroup>
          <FormGroup
            controlId="date"
            bsSize="large"
            validationState={date.isValid}
          >
            <ControlLabel>Date</ControlLabel>
            <DatePicker
              id="date-picker"
              value={date.value}
              onChange={this.onDateChange}
              dateFormat="YYYY-MM-DD"
            />
            <HelpBlock>{date.message}</HelpBlock>
          </FormGroup>

          <FormGroup
            controlId="duration"
            bsSize="large"
            validationState={duration.isValid}
          >
            <ControlLabel>Duration</ControlLabel>
            <FormControl
              autoFocus
              type="number"
              max={24.0}
              min={0.0}
              step={0.01}
              value={duration.value}
              onChange={this.onDurationChange}
            />
            <HelpBlock>{duration.message}</HelpBlock>
          </FormGroup>
          <LoaderButton
            block
            bsSize="large"
            disabled={!this.canProceed()}
            type="submit"
            isLoading={this.props.timeTrackCreationState.state === IN_PROGRESS}
            text={this.props.submitString}
            loadingText={this.props.loadingString}
          />
        </form>
      </div>
    );
  }
}

export default TimeTrackCreator;
