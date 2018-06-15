import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const Message = props => (
  <div className="message">
    <div className="message__content">
      <span>{props.author}:</span>{props.text}
    </div>
    <div className="message__buttons">
      <span className="time">{moment(props.timestamp).fromNow()}</span>
    </div>
  </div>
);

Message.propTypes = {
  author: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  timestamp: PropTypes.string,
};

export default Message;