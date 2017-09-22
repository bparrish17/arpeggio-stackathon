import React, { Component } from 'react';
import './App.css';

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
      countdown: 3
    }
    this.addRecording = this.addRecording.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.setTime = this.setTime.bind(this);
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
    console.log('duration', this.state.duration);
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

  startRecording(recorder) {
    if(this.state.duration === 0) {
      let interval1 = setInterval(() => {
        this.setState({countdown: this.state.countdown-1})
        if(this.state.countdown === 0) {
          recorder.start();
          clearInterval(interval1);
        }
      }, 1000)
    }
    else {
      let timeLimit = this.state.duration*1000;
      let interval2 = setInterval(() => {
        this.setState({countdown: this.state.countdown-1})
        if(this.state.countdown === 0) {
          recorder.start();
          clearInterval(interval2);
          setTimeout(() => {
            this.stopRecording(recorder);
          }, timeLimit)
        } 
      }, 1000)
    }
  }

  stopRecording(recorder) {
    this.setState({countdown: 3});
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
      audioElem.addEventListener('loadedmetadata', () => {
        this.setTime(audioElem.duration);
      })
    };
  }

  render() {
    let recorders = this.state.recorders;
    return (
      <div>
        <div id="img-holder">
          <img id="img" src='http://cdn.pastemagazine.com/www/system/images/photo_albums/aditlo-grace-potter/large/photo_25322_0-37.jpg?1384968217' />
        </div>
        <div className="center container-fluid">
          <div id="break"></div>
          <div className="col-xs-2"></div>
            <div className="col-xs-8">
              <div id="arpeggio">
                <text id="title"><strong>Arpegg.io</strong></text>
              </div>
              <div id="countdown-holder">
                <text id="record-in">Record In</text>
                  <div>
                  {this.state.countdown === 0 
                  ? <text className="three"><strong>Go</strong></text>
                  : <text className="three"><strong>{this.state.countdown}</strong></text>
                  }
                  </div>
                <button type="button" className="add-recording btn btn-primary"onClick={this.addRecording}>Add New Loop</button>
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
          <div className="col-xs-2"></div>
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