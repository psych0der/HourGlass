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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchTimeTrackInformation } from '../../redux/reducers/timeTrackInfo';
import {
  editTimeTrack,
  deleteTimeTrack,
} from '../../redux/reducers/timeTrackEdit';
import { IN_PROGRESS, SUCCESS, FAILED, IDLE } from '../../commons/constants';
import './index.css';

type Props = {
  timeTrackInfo: Object,
  timeTrackEdit: Object,
  userId: string,
  timeTrackId: string,
  fetchTimeTrackInformation: () => *,
  deleteTimeTrack: () => *,
  editTimeTrack: () => *,
  isAdmin: boolean,
  proxy: boolean,
  postEditLocation: string,
};
type State = {
  fetchedTimeTrackInfo: boolean,
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

export class TimeTrackEditBlock extends Component<Props, State> {
  static defaultProps = {
    proxy: false,
  };
  state = {
    fetchedTimeTrackInfo: false,
    note: { value: '', isValid: null, message: '' },
    duration: { value: 0, isValid: null, message: '' },
    date: { value: moment().format('YYYY-MM-DD'), isValid: null, message: '' },
  };

  componentDidMount() {
    this.props.fetchTimeTrackInformation(
      this.props.userId,
      this.props.timeTrackId
    );
  }

  componentDidUpdate(prevProps: Props) {
    //update internal state on prop change
    if (
      !this.state.fetchedTimeTrackInfo &&
      this.props.timeTrackInfo.status === SUCCESS
    ) {
      this.setState({
        fetchedTimeTrackInfo: true,
        note: {
          ...this.state.note,
          value: this.props.timeTrackInfo.timeTrackInfo.note,
        },
        date: {
          ...this.state.date,
          value: this.props.timeTrackInfo.timeTrackInfo.date,
        },
        duration: {
          ...this.state.duration,
          value: this.props.timeTrackInfo.timeTrackInfo.duration,
        },
      });
    }
  }

  /* Re trigger request */
  retryFetch = () => {
    this.props.fetchTimeTrackInformation(
      this.props.userId,
      this.props.timeTrackId
    );
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

  onSubmit = (event: Event) => {
    event.preventDefault();
    const canProceed = this.canProceed();

    if (canProceed) {
      const payload = {
        note: this.state.note.value,
        date: this.state.date.value,
        duration: this.state.duration.value,
        targetLocation: this.props.postEditLocation,
        userId: this.props.userId,
        timeTrackId: this.props.timeTrackId,
      };
      this.props.editTimeTrack(payload);
    }
  };
  render() {
    const proxyNotification =
      this.props.proxy === true ? (
        <div className="ProxyNotification">
          You are editing someone else's profile
        </div>
      ) : null;

    let deleteButton = null;
    if (this.props.timeTrackEdit.deleteStatus === IN_PROGRESS) {
      deleteButton = (
        <LoaderButton
          block
          bsSize="large"
          bsStyle="danger"
          disabled={true}
          type="submit"
          isLoading={true}
          text="Deleting TimeTrack...."
          loadingText="Deleting time track..."
        />
      );
    } else if (this.props.timeTrackEdit.deleteStatus === IDLE) {
      deleteButton = (
        <LoaderButton
          block
          bsSize="large"
          bsStyle="danger"
          disabled={false}
          type="submit"
          isLoading={false}
          text="Delete TimeTrack"
          loadingText="Deleting TimeTrack...."
          onClick={() =>
            this.props.deleteTimeTrack(
              this.props.userId,
              this.props.timeTrackId,
              this.props.proxy
                ? `/users/${this.props.userId}/time-tracks`
                : '/time-tracks'
            )
          }
        />
      );
    }

    const { status: timeTrackEditStatus } = this.props.timeTrackEdit;
    const { note, date, duration } = this.state;
    let component = null;
    const headerMessage =
      timeTrackEditStatus === FAILED ? (
        <div className="ErrorMessage">
          Unable to update user info. Following error occurred:
          <div>timeTrackEditError}</div>
        </div>
      ) : null;

    if (this.props.timeTrackInfo.status === IN_PROGRESS) {
      component = (
        <LoaderButton
          block
          bsSize="large"
          disabled={true}
          type="submit"
          isLoading={true}
          text="Loading user info..."
          loadingText="Loading user info..."
        />
      );
    } else if (this.props.timeTrackInfo.status === SUCCESS) {
      component = (
        <div className="TimeTrackBlockContainer">
          <div className="TimeTrackBlock">
            <PageHeader>
              <small>Edit TimeTrack</small>
            </PageHeader>
            {headerMessage}
            <form onSubmit={this.onSubmit}>
              <div className="TimeTrackBlockComponents">
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
                  bsStyle="primary"
                  disabled={!this.canProceed()}
                  type="submit"
                  isLoading={false}
                  text="update"
                  loadingText="Updating"
                />
                {deleteButton}
              </div>
            </form>
          </div>
        </div>
      );
    } else {
      /* show error notification */
      component = (
        <div className="ErrorMessage">
          <div>Unable to fetch time track information</div>
          <div>{this.props.timeTrackInfo.error}</div>
          <div style={{ width: 100, margin: '0 auto', marginTop: '10px' }}>
            <LoaderButton
              block
              bsSize="small"
              disabled={false}
              type="button"
              isLoading={false}
              text="Retry"
              loadingText=""
              onClick={this.retryFetch}
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        <div>{proxyNotification}</div>
        <div>{component}</div>
      </div>
    );
  }
}

const mapStateToProps = ({
  timeTrackInfo,
  timeTrackEdit,
}: {
  timeTrackInfo: Object,
  timeTrackEdit: Object,
}) => ({ timeTrackInfo, timeTrackEdit });

// connect redux to the container
const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      fetchTimeTrackInformation,
      editTimeTrack,
      deleteTimeTrack,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeTrackEditBlock);
