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

var drum = new Tone.MembraneSynth({
  "pitchDecay" : 0.008,
  "octaves" : 2,
  "envelope" : {
    "attack" : 0.0006,
    "decay" : 0.5,
    "sustain" : 0
  }
}).toMaster();

// Tone.Transport.stop()

//play a middle 'C' for the duration of an 8th note
//test.triggerAttackRelease("C4", "8n");

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























// onMouseUp={() => this.endNote(node)}
    // let gainNode = audioCtx.createGain();
    // gainNode.connect(audioCtx.destination);



    //<Key note={note} freq={freq} />


    //USER MEDIA RECORDING


    // <audio id="recording1" controls></audio>
    // <br />
    // <audio id="recording2" controls></audio>
    // <br />
    // <audio id="recording3" controls></audio>
    // <br />

// mediaRecorder.ondataavailable = (event) => {
//   console.log('data', event.data)
//   chunks.push(event.data);
// }

// mediaRecorder.onstop = (evt) => {
//   // Make blob out of our blobs, and open it.
//   var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
//   // let testBlob = URL.createObjectURL(blob);
//   // let myAudio = new Audio(testBlob); 
//   // myAudio.loop = true;
//   // myAudio.play();

//   document.querySelector("audio").src = URL.createObjectURL(blob);
//   document.querySelector("audio").loop = true;
// };

        // console.log("METRONOME COUNT/STATE DURATION", metronomeCount);
        // console.log('BEAT COUNTDOWN', beatCountdown);
        // console.log("STATE COUNTDOWN", this.state.countdown);

// <button type="button" onClick={this.addRecording}>Click Add A New Recorder</button>
// <button type="button" onClick={() => this.startRecording(this.state.recorders[1])}>Record 2</button>
// <button type="button" onClick={() => this.stopRecording(this.state.recorders[1])}>Stop 2</button>
// <button type="button" onClick={() => this.startRecording(this.state.recorders[2])}>Record 3</button>
// <button type="button" onClick={() => this.stopRecording(this.state.recorders[2])}>Stop 3</button>


// let c = audioCtx.createOscillator();
// c.type = 'triangle';
// c.frequency.value = 261.625565300598634;
// c.start();


// let e = audioCtx.createOscillator();
// e.type = 'triangle';
// e.frequency.value = 329.627556912869929;;
// e.start();

// let g = audioCtx.createOscillator();
// g.type = 'triangle';
// g.frequency.value = 391.995435981749294;
// g.start();

// this.startNote = this.startNote.bind(this);
// this.stopNote = this.stopNote.bind(this);


// startNote(event, node, audioCtx) {
//   node.connect(audioCtx.destination);
//   node.connect(dest);
// }

// stopNote(event, node, audioCtx) {
//   node.disconnect(audioCtx.destination);
//   node.disconnect(dest);
// }

// startRecording() {
// mediaRecorder.start();
// }

// stopRecording() {
// mediaRecorder.stop();
// }

//<div id="C4">
// <KeyHandler keyEventName={KEYDOWN} keyValue="a" onKeyHandle={(event) => this.startNote(event, c, audioCtx)} />
// <KeyHandler keyEventName={KEYUP} keyValue="a" onKeyHandle={(event) => this.stopNote(event, c, audioCtx)} />
// {<button type="button">C</button>}
// </div>
// <div id="E4">
// <KeyHandler keyEventName={KEYDOWN} keyValue="s" onKeyHandle={(event) => this.startNote(event, e, audioCtx)} />
// <KeyHandler keyEventName={KEYUP} keyValue="s" onKeyHandle={(event) => this.stopNote(event, e, audioCtx)} />
// {<button type="button">E</button>}
// </div>
// <div id="G4">
// <KeyHandler keyEventName={KEYDOWN} keyValue="d" onKeyHandle={(event) => this.startNote(event, g, audioCtx)} />
// <KeyHandler keyEventName={KEYUP} keyValue="d" onKeyHandle={(event) => this.stopNote(event, g, audioCtx)} />
// {<button type="button">G</button>}
// </div>





// createOctave= () => {
//   let noteFreq = {};;
//   noteFreq["C"] = 261.625565300598634;
//   noteFreq["C#"] = 277.182630976872096;
//   noteFreq["D"] = 293.664767917407560;
//   noteFreq["D#"] = 311.126983722080910;
//   noteFreq["E"] = 329.627556912869929;
//   noteFreq["F"] = 349.228231433003884;
//   noteFreq["F#"] = 369.994422711634398;
//   noteFreq["G"] = 391.995435981749294;
//   noteFreq["G#"] = 415.304697579945138;
//   noteFreq["A"] = 440.000000000000000;
//   noteFreq["A#"] = 466.163761518089916;
//   noteFreq["B"] = 493.883301256124111;
//   return noteFreq;
// }
//          onMouseDown={(event) => this.startNote(event, e, audioCtx)}
// onMouseUp={(event) => this.stopNote(event, e, audioCtx)}

// createNoteTable = () => {
//   let noteFreq = [];
//   for (let i=0; i< 9; i++) {
//     noteFreq[i] = [];
//   }
//   noteFreq[4]["C"] = 261.625565300598634;
//   noteFreq[4]["C#"] = 277.182630976872096;
//   noteFreq[4]["D"] = 293.664767917407560;
//   noteFreq[4]["D#"] = 311.126983722080910;
//   noteFreq[4]["E"] = 329.627556912869929;
//   noteFreq[4]["F"] = 349.228231433003884;
//   noteFreq[4]["F#"] = 369.994422711634398;
//   noteFreq[4]["G"] = 391.995435981749294;
//   noteFreq[4]["G#"] = 415.304697579945138;
//   noteFreq[4]["A"] = 440.000000000000000;
//   noteFreq[4]["A#"] = 466.163761518089916;
//   noteFreq[4]["B"] = 493.883301256124111;

//   return noteFreq;
// }

// {
//   Object.entries(octave).forEach(([note, freq]) => {
//     return (
//       <div>
//         <h1>HELLO</h1>
//         {/*<Key note={note} freq={freq} />*/}
//       </div>
//     )
//   })
// }