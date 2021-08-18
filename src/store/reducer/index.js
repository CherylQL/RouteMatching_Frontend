import {combineReducers} from "redux";

const pointEditor = (state = [], action) => {
  switch (action.type) {
    case 'ADD_CAR_POINT':
      return [
        ...state,
        {
          ...action.point
        }
      ]
    // case 'TOGGLE_TODO':
    //   return state.map(todo =>
    //     todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
    //   )
    default:
      return state
  }
}

export default combineReducers({
  pointEditor
})
