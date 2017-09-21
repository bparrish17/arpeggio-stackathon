import React, { Component } from 'react';

const key = (props) => {
    let note = props.note;
    let freq = props.freq;
    console.log('NOTE', note);
    console.log('FREQ', freq);
    return (
        <div>
            <h1>I'm a Key!</h1>
        </div>
    )
}

export default key;

//<div className="key"
// data-octave={/*note passed in*/}
// data-note={/*note passed in*/}
// data-frequency={/*frequency passed in*/}
// onMouseDown={/*passed in: note pressed function, false */}
// onMouseUp={/*passed in: note released function, false */}
// onMouseOver={/*passed in: note pressed function, false */}
// onMouseLeave={/*passed in: note released function, false */}
// >
// <div innerHtml={/*note passed in + '<sub>' + octave passed in + '</sub>*/}>
// </div>

// </div>