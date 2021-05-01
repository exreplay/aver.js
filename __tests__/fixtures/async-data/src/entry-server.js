import axios from 'axios';

export default ({ req }) => {
  axios.defaults.baseURL = `${req.protocol}://${req.get('host')}`;
};
