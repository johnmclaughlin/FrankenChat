import React from 'react';
import PropTypes from 'prop-types';

const MessageForm = props => (
  <form onSubmit={props.submitComment} className="input-group">
    <input
      type="text"
      name="author"
      placeholder="Your name"
      className="form-control"
      value={props.author}
      onChange={props.handleChangeText}
    />
    <input
      type="text"
      name="text"
      className="form-control"
      placeholder="Your message"
      value={props.text}
      onChange={props.handleChangeText}
    />
    <button type="submit" className="btn btn-success">Submit</button>
  </form>
);

MessageForm.propTypes = {
  submitComment: PropTypes.func.isRequired,
  handleChangeText: PropTypes.func.isRequired,
  text: PropTypes.string,
  author: PropTypes.string,
};

MessageForm.defaultProps = {
  text: '',
  author: '',
};

export default MessageForm;