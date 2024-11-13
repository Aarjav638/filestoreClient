/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-url-polyfill/auto';
import 'core-js/features/symbol/async-iterator';
AppRegistry.registerComponent(appName, () => App);
