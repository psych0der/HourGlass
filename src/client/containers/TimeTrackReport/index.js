// @flow
import React from 'react';
import axios from 'axios';
import { getAuthToken } from '../../commons/helpers';
import { connect } from 'react-redux';
import {
  PageHeader,
  FormGroup,
  ControlLabel,
  HelpBlock,
} from 'react-bootstrap';

import { LoaderButton } from '../../components';

import DatePicker from 'react-bootstrap-date-picker-react16';

import './index.css';
type Props = {
  auth: Object,
};
type State = {
  startDate: string | null,
  endDate: string | null,
  endDateError: ?string,
  startDateError: ?string,
  loadingReport: boolean,
  reportGenerateError: ?string,
};

export class TimeTrackReport extends React.Component<Props, State> {
  static defaultProps = {};
  // used to filter time tracks
  state = {
    startDate: null,
    endDate: null,
    startDateError: null,
    endDateError: null,
    loadingReport: false,
    reportGenerateError: null,
  };

  /* Date change handlers */
  onStartDateChange = (val: string, formattedValue: string) => {
    if (formattedValue == null) {
      return this.setState({
        startDate: null,
        startDateError: null,
        endDateError: null,
      });
    }
    if (
      this.state.endDate !== null &&
      new Date(formattedValue) > new Date(this.state.endDate)
    ) {
      this.setState({
        startDateError: 'Start date cannot be greater than end date',
      });
    } else {
      this.setState({
        startDateError: null,
        startDate: formattedValue,
      });
    }
  };

  onEndDateChange = (val: string, formattedValue: string) => {
    if (formattedValue == null) {
      return this.setState({
        endDate: null,
        startDateError: null,
        endDateError: null,
      });
    }

    if (
      this.state.startDate !== null &&
      new Date(formattedValue) < new Date(this.state.startDate)
    ) {
      this.setState({
        endDateError: 'End date cannot be less than start date',
      });
    } else {
      this.setState({
        endDateError: null,
        endDate: formattedValue,
      });
    }
  };

  /* Fetch Report data from API servers and render it to blobs */
  fetchReportData = () => {
    this.setState({ loadingReport: true });
    axios({
      method: 'GET',
      url: `${process.env.REACT_APP_API_HOST}:${
        process.env.REACT_APP_API_PORT
      }/v1/users/${
        this.props.auth.user.id
      }/timeTracks/generate-report/?startDate=${this.state.startDate}&endDate=${
        this.state.endDate
      }`,
      headers: {
        'content-type': 'application/json',
        authorization: getAuthToken(),
      },
    })
      .then(res => {
        /* Generate html content */
        var element = document.createElement('a');
        const file = new Blob([res.data], {
          type: 'text/html',
        });
        element.href = URL.createObjectURL(file);
        element.download = `${this.props.auth.user.name}-TimeReport.html`;
        element.click();
        this.setState({ loadingReport: false });
      })
      .catch(err => {
        this.setState({
          loadingReport: false,
          reportGenerateError: JSON.stringify(err.response.data),
        });
      });
  };

  render() {
    return (
      <div className="ReportGenerator">
        {this.state.reportGenerateError && (
          <div className="ErrorMessage">
            Unable to generate time track report. Following error occurred:
            <div>{this.state.reportGenerateError}</div>
          </div>
        )}
        <PageHeader>Generate TimeTrack report</PageHeader>
        <div className="date-pickers">
          <form action="#" autoComplete="off">
            <div className="start-date-picker">
              <FormGroup controlId="date" bsSize="large">
                <ControlLabel>Start Date</ControlLabel>
                <DatePicker
                  id="date-picker"
                  autoComplete="off"
                  value={this.state.startDate}
                  onChange={this.onStartDateChange}
                  dateFormat="YYYY-MM-DD"
                />
                <HelpBlock>{this.state.startDateError}</HelpBlock>
              </FormGroup>
            </div>
            <div className="end-date-picker">
              <FormGroup controlId="date" bsSize="large">
                <ControlLabel>End Date</ControlLabel>
                <DatePicker
                  id="date-picker"
                  autoComplete="off"
                  value={this.state.endDate}
                  onChange={this.onEndDateChange}
                  dateFormat="YYYY-MM-DD"
                />
                <HelpBlock>{this.state.endDateError}</HelpBlock>
              </FormGroup>
            </div>
          </form>
          <div className="generteReportButton">
            <LoaderButton
              block
              bsSize="large"
              bsStyle="success"
              onClick={this.fetchReportData}
              disabled={
                !this.state.endDate ||
                !this.state.startDate ||
                this.state.endDateError ||
                this.state.startDateError
              }
              type="submit"
              isLoading={this.state.loadingReport}
              text="Generate report"
              loadingText="Generating report"
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ auth }) => ({
  auth,
});

export default connect(mapStateToProps)(TimeTrackReport);
