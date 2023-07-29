import * as ReactDOMClient from 'react-dom/client';
import * as React from 'react';
import { MainView } from './components/Main';

const initialize = async () => {
  const container = document.getElementById("content");
  const root = ReactDOMClient.createRoot(container);
  root.render(
        <MainView/>
  );
};

initialize();
