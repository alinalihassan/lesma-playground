import React from 'react';
import ReactDOM from 'react-dom';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { registerGoLanguageProvider } from '~/components/editor/provider';
import apiClient from '~/services/api';
import App from './App';
import './index.css';


initializeIcons();
registerGoLanguageProvider(apiClient);

ReactDOM.render(<App />, document.getElementById('root'));
