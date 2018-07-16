import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const Message = props => (
  <div className="message">
    <div className="message__content">
      <span className="username">{props.author}:</span>{props.text}
    </div>
    <div className="message__buttons">
      <span className="time">{moment(props.timestamp).fromNow()}</span>
      <a onClick={() => { props.handleUpdateMessage(props.id); }}>update</a>
      <a onClick={() => { props.handleDeleteMessage(props.id); }}>delete</a>
    </div>
  </div>
);

Message.propTypes = {
  author: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  timestamp: PropTypes.string,
  handleUpdateMessage: PropTypes.func.isRequired,
  handleDeleteMessage: PropTypes.func.isRequired,
};

export default Message;