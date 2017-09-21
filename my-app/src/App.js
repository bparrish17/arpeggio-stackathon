import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Key from './Key'

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let c = audioCtx.createOscillator();
c.type = 'triangle';
c.frequency.value = 262;
c.start();

let g = audioCtx.createOscillator();
g.type = 'triangle';
g.frequency.value = 440;
g.start();

let e = audioCtx.createOscillator();
e.type = 'triangle';
e.frequency.value = 330;
e.start();


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

let oscList = [];
// let noteFreq = createNoteTable();
// let octave = createOctave();

class App extends Component {
  constructor() {
    super();
    this.state = {
      isPlaying: false,
    }
    this.startNote = this.startNote.bind(this);
    this.stopNote = this.stopNote.bind(this);
    // this.createNoteTable = this.createNoteTable.bind(this);
    // this.createOctave = this.createOctave.bind(this);
  }
  startNote(event, node, audioCtx) {
    //console.log('EVENT DATA FREQUENCY', event.target.dataset.frequency);
    //node.frequency.value = event.target.dataFrequency;
    if(!this.state.isPlaying) {
      node.connect(audioCtx.destination);
      this.setState({isPlaying: true});
    }
  }
  stopNote(event, node, audioCtx) {
    //console.log('EVENT DATA FREQUENCY', event.target.dataset.frequency);
    //node.frequency.value = event.target.dataFrequency;
    if(this.state.isPlaying) {
      node.disconnect(audioCtx.destination);
      this.setState({isPlaying: false});
    }
  }


  render() {

    // g.type = 'triangle';
    // g.frequency.value = 440;
    // g.connect(audioCtx.destination);

    // Object.entries(octave).forEach(([note, freq]) => {
    //   return 
    // })

    //state - isPlaying=true? if false stop the oscillator node

    return (
      <div>
        <h1>Arpegg.io</h1>
        <h2>Test</h2>
        <button type="button"
          value="hello"
          data-frequency={500}
          onMouseDown={(event) => this.startNote(event, c, audioCtx)}
          onMouseUp={(event) => this.stopNote(event, c, audioCtx)}
          onMouseLeave={(event) => this.stopNote(event, c, audioCtx)}
          >C
        </button>
        <button type="button"
          value="hello"
          data-frequency={500}
          onMouseDown={(event) => this.startNote(event, e, audioCtx)}
          onMouseUp={(event) => this.stopNote(event, e, audioCtx)}
          onMouseLeave={(event) => this.stopNote(event, e, audioCtx)}
          >E
        </button>
        <button type="button"
          value="hello"
          data-frequency={500}
          onMouseDown={(event) => this.startNote(event, g, audioCtx)}
          onMouseUp={(event) => this.stopNote(event, g, audioCtx)}
          onMouseLeave={(event) => this.stopNote(event, g, audioCtx)}
          >G
        </button>
      </div>
    );
  }
}

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

export default App;


// onMouseUp={() => this.endNote(node)}
    // let gainNode = audioCtx.createGain();
    // gainNode.connect(audioCtx.destination);



    //<Key note={note} freq={freq} />