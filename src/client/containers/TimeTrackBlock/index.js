// @flow
import React, { Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  PageHeader,
  Label,
  Button,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { LoaderButton } from '../../components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchTimeTrackInformation } from '../../redux/reducers/timeTrackInfo';
import { IN_PROGRESS, SUCCESS } from '../../commons/constants';
import moment from 'moment-timezone';
import './index.css';

type Props = {
  timeTrackInfo: Object,
  userId: string,
  timeTrackId: string,
  fetchTimeTrackInformation: () => *,
  editLocation: string,
  proxy: boolean,
};
type State = {};

export class TimeTrackBlock extends Component<Props, State> {
  componentDidMount() {
    this.props.fetchTimeTrackInformation(
      this.props.userId,
      this.props.timeTrackId
    );
  }

  static defaultProps = {
    proxy: false,
  };

  /* Re trigger request */
  retry = () => {
    this.props.fetchTimeTrackInformation(
      this.props.userId,
      this.props.timeTrackId
    );
  };
  render() {
    const { timeTrackInfo } = this.props.timeTrackInfo;
    const proxyNotification =
      this.props.proxy === true ? (
        <div className="ProxyNotification">
          You are viewing someone else's Time Track
        </div>
      ) : null;
    let component = null;
    if (this.props.timeTrackInfo.status === IN_PROGRESS) {
      component = (
        <LoaderButton
          block
          bsSize="large"
          disabled={true}
          type="submit"
          isLoading={true}
          text="Loading time track..."
          loadingText="Loading time track info..."
        />
      );
    } else if (this.props.timeTrackInfo.status === SUCCESS) {
      component = (
        <div className="TimeTrackBlockContainer">
          <div className="TimeTrackBlock">
            <PageHeader>
              <small>Time Track</small>
              <LinkContainer to={this.props.editLocation}>
                <Button className="pull-right" bsStyle="warning">
                  Edit
                </Button>
              </LinkContainer>
            </PageHeader>
            <div className="TimeTrackBlockComponents">
              <FormGroup controlId="note" bsSize="large">
                <ControlLabel className="TimeTrackBlockLabel">
                  Note
                </ControlLabel>
                <div className="TimeTrackBlockValue">{timeTrackInfo.note}</div>
              </FormGroup>
              <FormGroup controlId="role" bsSize="large">
                <ControlLabel className="TimeTrackBlockLabel">
                  date
                </ControlLabel>
                <div className="TimeTrackBlockValue">
                  <Label bsStyle="primary">
                    {moment(timeTrackInfo.date).format('YYYY-MM-DD')}
                  </Label>
                </div>
              </FormGroup>
              <FormGroup controlId="duration" bsSize="large">
                <ControlLabel className="TimeTrackBlockLabel">
                  Duration
                </ControlLabel>
                <div className="TimeTrackBlockValue">
                  {`${timeTrackInfo.duration} hours`}
                </div>
              </FormGroup>
            </div>
          </div>
        </div>
      );
    } else {
      /* show error notification */
      component = (
        <div className="ErrorMessage">
          <div>Unable to fetch Time track information</div>
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
              onClick={this.retry}
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

const mapStateToProps = ({ timeTrackInfo }) => ({ timeTrackInfo });

// connect redux to the container
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchTimeTrackInformation,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeTrackBlock);
