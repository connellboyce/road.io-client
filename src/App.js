import React, {Component} from 'react';
import logo from './globe-png-9acqaaMTM.png';
import './App.css';
import Map from './Map.js';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            showMap: false
        };
    }

    componentDidMount() {
        this.setState({
            isLoaded: true
        });
    }

    showTheMap() {
        this.setState(state => ({
            showMap: true
        }));
        console.log("setting state to true");
    }

    render() {
        const {error, isLoaded, showMap} = this.state;
        if (error == null) {
            if (showMap) {
                return (
                    <div className="App">
                        <Map></Map>
                    </div>
                );
            } else {
                return (

                    <div className="App">
                        <header className="App-header">

                            <p id="introduction">
                                <animate id="anxiety"> Anxiety-free</animate>
                                driving with

                            </p>
                            <p>
                                <animate id="road"> road.i</animate>
                                <img src={logo} className="App-logo" alt="logo"/>
                            </p>
                            <a className="button1" onClick={this.showTheMap.bind(this)}>Get started</a>
                        </header>
                    </div>
                );
            }
        }
    }
}

export default App;