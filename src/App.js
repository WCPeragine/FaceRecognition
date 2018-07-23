import React, { Component } from 'react';
import Navigation from './components/navigation/navigation';
import SignIn from './components/SignIn/SignIn';
import Logo from './components/logo/logo';
import Rank from './components/Rank/Rank';
import Register from './components/Register/Register';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import './App.css';

const particleOptions= {
  particles: {
    number: {
      value: 230,
      density: {
        enable: true,
        value_area: 800
      }
    }
  },
  interactivity: {
    detect_on: 'window',
    events: {
      onhover: {
        enable: true,
        mode: 'repulse'
      }
    }
  }
}
const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    password: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    const { id, name, email, entries, joined } = data;
    this.setState({user: {
        id: id,
        name: name,
        email: email,
        entries: entries,
        joined: joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
        left: clarifaiFace.left_col * width,
        top: clarifaiFace.top_row * height,
        right: width - (clarifaiFace.right_col * width),
        bottom: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onImageSubmit = () => {
    this.setState({imageUrl: this.state.input});
      fetch('http://localhost:4001/imageapi', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
    .then(response => response.json())
    .then(response => {
      if (response) {
        fetch('http://localhost:4001/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
      .then(response=> response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user, {entries: count}))
      })
      .catch(console.log)
      }
      this.displayFaceBox(
        this.calculateFaceLocation(response)
      )
    })
    .catch(err => console.log(err));
  }


  onRouteChange = (page) => {
    this.setState({route: page})
    if (page === 'signout'){
      this.setState(initialState)
    } else if (page === 'home') {
      this.setState({isSignedIn: true})
    }
    
  }

  render() {
    const { state, onRouteChange, onInputChange, onImageSubmit, loadUser } = this;
    const { user, isSignedIn, imageUrl, route, box } = state;
    return (
      <div className="App">
        <Particles 
          className= 'particles'
          params={particleOptions}
        />
        <Navigation onRouteChange={onRouteChange} isSignedIn={isSignedIn}/>
        <Logo/>
        { route === 'home'
          ? <div>
              <Rank name={user.name} entries={user.entries}/>
              <ImageLinkForm 
                onInputChange={onInputChange}
                onImageSubmit={onImageSubmit}
              />
              <FaceRecognition 
                box={box} 
                imageUrl={imageUrl}
              />
            </div>
          :( route === 'signin' 
              ? <SignIn loadUser={loadUser} onRouteChange={onRouteChange}/>
              : <Register loadUser={loadUser} onRouteChange={onRouteChange}/>
          ) 
      }
      </div>
    );
  }
}

export default App;
