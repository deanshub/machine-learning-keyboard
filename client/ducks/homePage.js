// import { createAction } from 'redux-actions'

// const SELECT_SPOT = 'hr/homePage/SELECT_SPOT'

const initialState = {
}
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  // case SELECT_SPOT:
  //   // console.log(1, action.payload);
  //   return Object.assign({},state,{news:state.news.filter((item,index)=>index!==0)})
  default:
    return state
  }
}

// export const selectSpot = createAction(SELECT_SPOT)
