import axios from 'axios';

const getFeed = (url) => axios.get(new URL(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`))
  .then((response) => ({ data: response.data.contents }))
  .catch((err) => {
    if (!err) {
      return { error: 'errors.commonErr' };
    }
    if (err.response) {
      return { error: 'errors.responseErr' };
    } if (err.request) {
      return { error: 'errors.networkError' };
    }
    return { error: 'errors.commonErr' };
  });

export default getFeed;
