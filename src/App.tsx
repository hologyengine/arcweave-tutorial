import 'reflect-metadata'
import './App.css';
import { HologyScene } from '@hology/react'
import shaders from './shaders'
import actors from './actors'
import Game from './services/game'
import Dialogue from './Dialogue';

function App() {
  return (
    <HologyScene gameClass={Game} sceneName='demo' dataDir='data' shaders={shaders} actors={actors} rendering={{maxPixelRatio: 1}}>
      <Dialogue/>
    </HologyScene>
  );
}

export default App;