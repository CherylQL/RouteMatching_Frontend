import { createStore } from 'redux'
import pointEditor from './reducer/index'
export const store = createStore(pointEditor);
