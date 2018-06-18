import React, { Component } from 'react';
import 'whatwg-fetch';
import MessageList from './Components/MessageList';
import MessageForm from './Components/MessageForm';

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      error: null,
      author: '',
      comment: '',
      updateId: null,
    };
    this.pollInterval = null;
  }

  componentWillMount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = null;
  }

  componentDidMount() {
    this.loadCommentsFromServer();
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.loadCommentsFromServer, 2000);
    }
  }

  onChangeText = (e) => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  onUpdateMessage = (id) => {
    const oldComment = this.state.data.find(c => c._id === id);
    if (!oldComment) return;
    this.setState({ author: oldComment.author, text: oldComment.text, updateId: id });
  }

  onDeleteMessage = (id) => {
    const i = this.state.data.findIndex(c => c._id === id);
    const data = [
      ...this.state.data.slice(0, i),
      ...this.state.data.slice(i + 1),
    ];
    this.setState({ data });
    fetch(`api/comments/${id}`, { method: 'DELETE' })
      .then(res => res.json()).then((res) => {
        if (!res.success) this.setState({ error: res.error });
      });
  }

  submitMessage = (e) => {
    e.preventDefault();
    const { author, text, updateId } = this.state;
    if (!author || !text) return;
    if (updateId) {
      this.submitUpdatedMessage();
    } else {
      this.submitNewMessage();
    }
  }

  submitNewMessage = () => {
    const { author, text } = this.state;
    const data = [...this.state.data, { author, text, _id: Date.now().toString() }];
    this.setState({ data });
    fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text }),
    }).then(res => res.json()).then((res) => {
      if (!res.success) this.setState({ error: res.error.message || res.error });
      else this.setState({ author: '', text: '', error: null });
    });
  }

  submitUpdatedMessage = () => {
    const { author, text, updateId } = this.state;
    fetch(`/api/comments/${updateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text }),
    }).then(res => res.json()).then((res) => {
      if (!res.success) this.setState({ error: res.error.message || res.error });
      else this.setState({ author: '', text: '', updateId: null });
    });
  }

  loadCommentsFromServer = () => {
    fetch('/api/comments')
      .then(data => data.json())
      .then((res) => {
        if (!res.success) this.setState({ error: res.error });
        else this.setState({ data: res.data });
      });
  }

  render() {
    return (
      <React.Fragment>
      <header>Liberty Mutual CRUDchat</header>
      <section className="container">
        <div className="messages">
          <MessageList
            data={this.state.data}
            handleDeleteMessage={this.onDeleteMessage}
            handleUpdateMessage={this.onUpdateMessage}
          />
        </div>
        <div className="form">
          <MessageForm 
            author={this.state.author}
            text={this.state.text}
            handleChangeText={this.onChangeText}
            submitMessage={this.submitMessage}
          />
        </div>
      </section>
      </React.Fragment>
    );
  }
}

export default App;
