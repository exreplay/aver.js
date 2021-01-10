const state = () => ({
  globalTest: 'global vuex test'
});

// getters
const getters = {
  getGlobalTest: (state) => {
    return state.globalTest;
  }
};

export default {
  state,
  getters
};
