import React, { Component } from 'react';
import {connect} from 'react-redux';

import '../scss/App.scss';

import { hideNotification } from "../ActionsAndReducers/Notification/Notification_ActionCreators";
import Snackbar from "./Snackbar";

class Notifications extends Component {

  onClickHandler = (id) => {
    this.props.dispatch(hideNotification(id));
  };

  render() {

    if (this.props.notifications.length === 0) return false;

    return (
      <>
        {this.props.notifications.map((data) => {
          return (
            <Snackbar key={data.message+data.id}
                      type={data.type}
                      message={data.message}
                      id={data.id}
                      onClickHandler={this.onClickHandler} />
          );
        })
        }
      </>
    );
  }
}

const mapStateToProps = ({ notifications }) => ({
  notifications,
});

export default connect(mapStateToProps)(Notifications);
