import axios from 'axios';

const state = () => ({
  data: null
});

// getters
const getters = {
  getData: state => {
    return state.data;
  }
};

// mutations
const mutations = {
  setData(state, val) {
    state.data = val;
  }
};

// actions
const actions = {
  async fetchData({ state, commit }, val) {
    const response = await axios({
      method: 'GET',
      url: '/some-async-data'
    });
    commit('setData', response.data.data);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
