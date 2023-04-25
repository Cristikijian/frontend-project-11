import axios from 'axios';

const getFeed = (url) => {
  const feedUrl = new URL('get', 'https://allorigins.hexlet.app');
  feedUrl.searchParams.append('disableCache', true);
  feedUrl.searchParams.append('url', url);

  return axios.get(feedUrl)
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
};

export default getFeed;
