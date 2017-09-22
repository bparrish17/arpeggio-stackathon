import React from 'react';
import {keyHandler, KEYPRESS, KEYDOWN} from 'react-key-handler';
 
function Demo({ keyValue }) {
  return (
    <div>
    </div>
  );
}
 
export default keyHandler({ keyEventName: KEYDOWN, keyValue: 's' })(Demo);
