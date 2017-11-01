import React, { Component } from 'react';
import './App.css';
const Tone = require('tone');
const MonoSynth = require('tone').MonoSynth;
let synth = new MonoSynth();

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var chunks = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: []
};
var dest = audioCtx.createMediaStreamDestination();

//create a synth and connect it to the master output (your speakers)
let test = synth.toMaster();

//create drum tone for metronome
var drum = new Tone.MembraneSynth({
  "pitchDecay" : 0.008,
  "octaves" : 2,
  "envelope" : {
    "attack" : 0.0006,
    "decay" : 0.5,
    "sustain" : 0
  }
}).toMaster();


navigator.getUserMedia = navigator.getUserMedia ||
navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia;


class App extends Component {
  constructor() {
    super();
    this.state = {
      recorders: [],
      current: -1,
      duration: 0,
      countdown: 3,
      bpm: 100,
      beatLength: 0,
      beatsArray: [],
      metronomeSet: false,
      metronomePlaying: false
    }
    this.addRecording = this.addRecording.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.setTime = this.setTime.bind(this);
    this.startMetronome = this.startMetronome.bind(this);
    this.setBpm = this.setBpm.bind(this);
  }

  setTime(time) {
    this.setState({duration: time})
  }

  playAll() {
    let loops = document.getElementsByClassName("loop");
    for(var loop of loops) {
      loop.play();
    }
  }

  pauseAll() {
    let loops = document.getElementsByClassName("loop");
    for(var loop of loops) {
      loop.pause();
    }
  }

  resetAll() {
    let loops = document.getElementsByClassName("loop");
    for(var loop of loops) {
      loop.load();
    }
  }

  addRecording() {
    console.log('COUNTDOWN', this.state.countdown)
    console.log('DURATION', this.state.duration)

    //Create new Recorder for Audio Destination
    if (navigator.mediaDevices) {
      console.log('getUserMedia supported.');
        navigator.getUserMedia({audio: true}, 
          (stream) => {
            let inputNode = audioCtx.createMediaStreamSource(stream)
            let dest = audioCtx.createMediaStreamDestination();
            inputNode.connect(dest);
            let recorder = new MediaRecorder(dest.stream);
            this.setState({recorders: [...this.state.recorders, recorder], current: this.state.current+1});
          }, 
          function(err) {
            console.log('The following gUM error occured: ' + err);
        });
      }
  }

  startMetronome(setDuration) {
    let drumPart;
    if(setDuration) {
      this.setState({metronomeSet: true});
      this.setState({metronomePlaying: true});
      let arr = [];
      drumPart = new Tone.Sequence((time, pitch) => {
        drum.triggerAttack(pitch, time, 0.5);
        arr.push(time);
        this.setState({beatsArray: arr, countdown: arr[arr.length-1]-arr[0]});
        this.setTime(arr[arr.length-1]-arr[0])
        }, ["C4", "G3", "G3", "G3"], "4n").start(0);
        drumPart.loop = 2;
    }
    else {  
      drumPart = new Tone.Sequence((time, pitch) => {
      drum.triggerAttack(pitch, time, 0.5);
      }, ["C4", "G3", "G3", "G3"], "4n").start(0);
    }
    Tone.Transport.bpm.value = this.state.bpm;
    if(this.state.metronomePlaying) {
      this.setState({metronomePlaying: false});
      Tone.Transport.stop()
    } else {
      this.setState({metronomePlaying: true})
      Tone.Transport.start();
    }
  }

  setBpm(event) {
    let bpm = event.target.value;
    this.setState({bpm: bpm})
  }

  startRecording(recorder) {
    //IN THE CASE THAT THIS WAS THE FIRST RECORDING AND NO BEAT WAS SET
    //CASES: 
    // 1) First recording, no metronomeSet: 3, 2, 1 countdown
    // 2) First recording, metronomeSet: metronome countdown
    // 3) Second --> no timer

    if(this.state.duration <= 0) {
      let interval1 = setInterval(() => {
        this.setState({countdown: this.state.countdown-1})
        if(this.state.countdown === 0) {
          recorder.start();
          clearInterval(interval1);
        }
      }, 1000)
    }
    else {
      let interval2;
      let timeInterval;
      let timeLimit = this.state.duration*1000;

      this.state.metronomeSet ? timeInterval = this.state.duration/8 
                              : timeInterval = 1
      interval2 = setInterval(() => {
        this.setState({countdown: this.state.countdown-timeInterval})
        if(this.state.countdown <= 0) {
          recorder.start();
          clearInterval(interval2);
          setTimeout(() => {
            this.stopRecording(recorder);
          }, timeLimit)
        } 
      }, timeInterval*1000)
    }
  }

  stopRecording(recorder) {
    this.state.metronomeSet ? this.setState({countdown: this.state.duration + this.state.duration/8}) : this.setState({countdown: 3})
    let id = this.state.recorders.indexOf(recorder);
    recorder.stop();
    recorder.ondataavailable = (event) => {
      chunks[id].push(event.data);
    }

    recorder.onstop = (evt) => {
      let blob = new Blob(chunks[id], { 'type' : 'audio/ogg; codecs=opus' });
      var audioElem = document.getElementById(id);
      audioElem.src = URL.createObjectURL(blob);
      audioElem.loop = true;
      if(!this.state.metronomeSet) {
        audioElem.addEventListener('loadedmetadata', () => {
          this.setTime(audioElem.duration);
        })
      }
    };
  }

  render() {
    let recorders = this.state.recorders;
    return (
      <div id="page">
        <div className="center container-fluid">
          <div id="break"></div>
          <div className="col-xs-1"></div>
            <div id="col-holder" className="col-xs-10">
              <div id="arpeggio">
                <text id="title"><i><strong>Arpegg.io</strong></i></text>
              </div>
              <div id="countdown-holder">
                <text id="record-in">Record In</text>
                  <div>
                  {this.state.countdown <= 0 
                  ? <text className="three"><strong>Go</strong></text>
                  : <text className="three"><strong>{this.state.countdown.toString().slice(0, 4)}</strong></text>
                  }
                  </div>
                <button type="button" className="add-recording btn btn-primary"onClick={this.addRecording}>Add New Loop</button>
                <button type="button" className="add-recording btn btn-primary"onClick={(event) => this.startMetronome(false)}>Play Metronome</button>
                {this.state.metronomeSet || chunks[0].length || this.state.metronomePlaying
                  ? <button type="button" className="add-recording btn btn-primary" disabled>Can't Set Tempo</button>
                  : <button type="button" className="add-recording btn btn-primary"onClick={(event) => this.startMetronome(true)}>Set Metronome</button>
                }
                <input id="bpm-input" onChange={this.setBpm} type="number" placeholder="enter bpm"></input>
                <br />
              <br />
              {
                recorders.map(recorder => {
                  let id = this.state.recorders.indexOf(recorder);
                  return (
                      <div key={this.state.recorders.indexOf(recorder)}>
                        <div id="recording-buttons">
                          <button type="button" className="start-stop btn btn-danger" onClick={() => this.startRecording(this.state.recorders[id])}>Record</button>
                          { id === 0 
                          ? <button type="button" className="start-stop btn btn-danger" onClick={() => this.stopRecording(this.state.recorders[id])}>Stop</button>
                          : <button type="button" className="start-stop btn btn-danger" disabled>Auto-Stops</button>
                          }
                        </div>
                        <audio id={id} className="loop" controls></audio>
                        <br />
                        <br />
                      </div>
                  )
                })
              }
              <br />
              <button type="button" onClick={this.playAll}>Play All</button>
              <button type="button" onClick={this.pauseAll}>Pause All</button>
              <button type="button" onClick={this.resetAll}>Reset All</button>
              </div>
            </div>
          <div className="col-xs-1"></div>
        </div>
      </div>
    );
  }
}

export default App;

