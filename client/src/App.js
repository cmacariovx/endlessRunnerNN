import './App.css'
import { Route, Routes } from 'react-router-dom'

import Landing from './Components/Landing'
import GameCanvas from './Components/GameCanvas'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path='/' exact element={<Landing/>}/>
        <Route path='/play' exact element={<GameCanvas/>}/>
      </Routes>
    </div>
  )
}

export default App
