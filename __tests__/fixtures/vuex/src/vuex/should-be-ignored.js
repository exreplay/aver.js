const state = () => ({
  globalTest: 'should be ignored'
});

// getters
const getters = {
  getGlobalTest: state => {
    return state.globalTest;
  }
};

export default {
  state,
  getters
};
