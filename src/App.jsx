import { useState } from 'react'
import './App.css'
import Example from './components/Example';

function App() {

  const [count, setCount] = useState(1);

  let data = [{},{},{}];

  return (
    <div>
      <div className='parent-container'>
        <div className='graph-heading'>
          <h4 className='graph-heading'>Template Graph</h4>
        </div>
        <div className='graph-heading'>
          <h4>
            <button id='candidate-control' disabled={count===1} onClick={()=>setCount(count-1)}>{'<'}</button>
            Candidate Graph {count}
            <button id='candidate-control' disabled={count===4} onClick={()=>setCount(count+1)}>{'>'}</button>
          </h4>
        </div>
      </div>
      <div className='parent-container'>
        <div className='container'>
          <Example data={data}/>
        </div>
        <div className='container'></div>
      </div>
    </div>
      
  )
}

export default App
