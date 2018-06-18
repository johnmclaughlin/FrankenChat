import React from 'react';
import PropTypes from 'prop-types';
import Message from './Message';

const MessageList = (props) => {
  const messageNodes = props.data.map(message => (
    <Message
      key={message._id}
      id={message._id}
      author={message.author}
      text={message.text}
      timestamp={message.updatedAt}
      handleUpdateMessage={props.handleUpdateMessage}
      handleDeleteMessage={props.handleDeleteMessage}
    />
  ));
  return (
    <React.Fragment>
      {messageNodes}
    </React.Fragment>
  );
};

MessageList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    author: PropTypes.string,
    id: PropTypes.string,
    text: PropTypes.string,
  })),
};

MessageList.defaultProps = {
  data: [],
};

export default MessageList;
