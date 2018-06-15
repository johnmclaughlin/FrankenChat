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

  submitComment = (e) => {
    e.preventDefault();
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
      <header>Liberty Chat App</header>
      <section className="container">
        <div className="messages">
          <MessageList
            data={this.state.data}
          />
        </div>
        <div className="form">
          <MessageForm 
            author={this.state.author}
            text={this.state.text}
            handleChangeText={this.onChangeText}
            submitComment={this.submitComment}
          />
        </div>
      </section>
      </React.Fragment>
    );
  }
}

export default App;
