import axios from 'axios';

const getFeed = (url) => axios.get(new URL(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`))
  .then((response) => ({ data: response.data.contents }))
  .catch((err) => {
    if (!err) {
      return 'errors.commonErr';
    }
    if (err.response) {
      return 'errors.responseErr';
    } if (err.request) {
      return 'errors.networkError';
    }
    return 'errors.commonErr';
  });

export default getFeed;
