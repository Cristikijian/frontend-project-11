import { uniqueId } from 'lodash';

const createPosts = (posts) => [...posts].map((post) => ({
  id: uniqueId('post'),
  title: post.querySelector('title').textContent,
  link: post.querySelector('link').textContent,
  description: post.querySelector('description').textContent,
}));

export default createPosts;
