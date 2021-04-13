import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map(alert => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired
};

/*
  To fetch the alert array i.e state we use matchStatetoProps, here we are matching the redux state i.e state.alert to
  thr prop naming alerts. alert comes from the rootReducer
msg(pin):"Passwords must be same"
alertType(pin):"danger"
id(pin):"651e3e9c-1840-4127-bc36-454ce77c604b"
*/

const matchStatetoProps = state => ({
  alerts: state.alert
});

export default connect(matchStatetoProps)(Alert);
