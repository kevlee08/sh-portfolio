import type { FC } from 'react';
import ScrollManager from './components/ScrollManager';
import Lightbox from './components/Lightbox';

import './App.css'


const App: FC = () => {
  return (<>
    <ScrollManager />
    <Lightbox />
  </>);
};


export default App;
