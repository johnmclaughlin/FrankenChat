import React from 'react';
import PropTypes from 'prop-types';

const MessageForm = props => (
  <form onSubmit={props.submitMessage} className="input-group-append">
    <input
      type="text"
      name="author"
      placeholder="Your name"
      className="form-control col-5"
      value={props.author}
      onChange={props.handleChangeText}
    />
    <input
      type="text"
      name="text"
      className="form-control col-10"
      placeholder="Your message"
      value={props.text}
      onChange={props.handleChangeText}
    />
    <button type="submit" className="btn btn-outline-secondary">Submit</button>
  </form>
);

MessageForm.propTypes = {
  submitMessage: PropTypes.func.isRequired,
  handleChangeText: PropTypes.func.isRequired,
  text: PropTypes.string,
  author: PropTypes.string,
};

MessageForm.defaultProps = {
  text: '',
  author: '',
};

export default MessageForm;