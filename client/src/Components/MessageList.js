import React from 'react';
import PropTypes from 'prop-types';
import Message from './Message';

const MessageList = (props) => {
  const messageNodes = props.data.map(comment => (
    <Message
      key={comment._id}
      id={comment._id}
      author={comment.author}
      text={comment.text}
      timestamp={comment.updatedAt}
      handleUpdateComment={props.handleUpdateComment}
      handleDeleteComment={props.handleDeleteComment}
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
