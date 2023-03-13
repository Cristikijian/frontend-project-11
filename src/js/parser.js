import { uniqueId } from 'lodash';

export default function parser(data, url) {
  const parse = new DOMParser();
  const doc = parse.parseFromString(data, 'text/xml').documentElement;
  if (doc.querySelector('parsererror')) {
    throw new Error('errors.parserError');
  }
  const posts = doc.querySelectorAll('item');

  return {
    feed: {
      id: uniqueId('feed'),
      title: doc.querySelector('channel title').textContent,
      link: url,
      description: doc.querySelector('channel description').textContent,
    },
    posts: [...posts].map((post) => ({
      id: uniqueId('post'),
      title: post.querySelector('title').textContent,
      link: post.querySelector('link').textContent,
      description: post.querySelector('description').textContent,
    })),
  };
}
