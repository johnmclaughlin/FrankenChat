import React, { Component } from 'react';
import 'whatwg-fetch';
import socketIOClient from 'socket.io-client';
import 'bootstrap';
// import 'font-awesome/css/font-awesome.css';
import MessageList from './Components/MessageList';
import MessageForm from './Components/MessageForm';
import SignIn from './Components/SignIn';
import Users from './Components/Users';

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.socket = null;
    this.state = {
      data: [],
      error: null,
      author: '',
      comment: '',
      updateId: null,
      username : localStorage.getItem('username') ? localStorage.getItem('username') : '',
      uid : localStorage.getItem('uid') ? localStorage.getItem('uid') : this.generateUID(),
      chat_ready : false,
      users : [],
      messages : [],
      message : ''
    };
    this.pollInterval = null;
  }

  generateUID(){
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 15; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    localStorage.setItem('uid', text);
    return text;
  }

  setUsername(username, e){
      this.setState({
          username : username
      }, () => {
          this.initChat();
      });
  }
  initChat(){
    localStorage.setItem('username', this.state.username);
    this.setState({
        chat_ready : true,
    });
    this.socket = socketIOClient('ws://localhost:3001', {
        query : 'username='+this.state.username+'&uid='+this.state.uid
    });

    this.socket.on('updateUsersList', function (users) {
        console.log(users);
        this.setState({
            users : users
        });
    }.bind(this));

    this.socket.on('message', function (message) {
        this.setState({
            messages : this.state.messages.concat([message])
        });
        this.scrollToBottom();
    }.bind(this));
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
    fetch(`/comments/${id}`, { method: 'DELETE' })
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
    fetch('/comments', {
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
    fetch(`/comments/${updateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text }),
    }).then(res => res.json()).then((res) => {
      if (!res.success) this.setState({ error: res.error.message || res.error });
      else this.setState({ author: '', text: '', updateId: null });
    });
  }

  loadCommentsFromServer = () => {
    fetch('/comments')
      .then(data => data.json())
      .then((res) => {
        if (!res.success) this.setState({ error: res.error });
        else this.setState({ data: res.data });
      });
  }

  render() {
    const socket = socketIOClient(this.state.endpoint);

    socket.on('change color', (color) => {
      
      var y = document.getElementsByClassName('container');
      var aNode = y[0];
      aNode.style.backgroundColor = color
    })

    return (
      <React.Fragment>
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top bg-dark">
                <a className="navbar-brand" href="#">FrankenChat</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"/>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item float-right">
                            <a className="nav-link" target="_blank" href="https://github.com/waleedahmad">Github</a>
                        </li>
                    </ul>
                </div>
            </nav>
      <section className="container">

        {this.state.chat_ready ? (
                    <React.Fragment>
                      <div className="wrapper">
                      <Users users={this.state.users}/>
                      <div className="messages">
                        <MessageList
                          data={this.state.data}
                          handleDeleteMessage={this.onDeleteMessage}
                          handleUpdateMessage={this.onUpdateMessage}
                        />
                      </div>
                      </div>
                      <div className="form">
                        <MessageForm 
                          author={this.state.author}
                          text={this.state.text}
                          handleChangeText={this.onChangeText}
                          submitMessage={this.submitMessage}
                        />
                      </div>
                    </React.Fragment>
                ) : (
                    <SignIn
                        setUsername={this.setUsername.bind(this)}
                    />
                )}
      </section>
      </React.Fragment>
    );
  }
}

export default App;
