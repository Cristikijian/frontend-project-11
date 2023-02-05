import { uniqueId } from 'lodash';

const createFeed = (doc, url) => ({
  id: uniqueId('feed'),
  title: doc.querySelector('channel title').textContent,
  link: url,
  description: doc.querySelector('channel description').textContent,
});

export default createFeed;
