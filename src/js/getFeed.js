import axios from 'axios';

const getFeed = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then((response) => ({ data: response.data.contents }))
  .catch((err) => {
    let error = '';
    if (err.response) {
      error = 'errors.responseErr';
    } else if (err.request) {
      error = 'networkError';
    }
    return { error };
  });

export default getFeed;
