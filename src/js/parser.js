export default function parser(data) {
  const parse = new DOMParser();
  return new Promise((resolve, reject) => {
    const doc = parse.parseFromString(data, 'text/xml').documentElement;
    if (doc.querySelector('parsererror')) {
      reject(new Error('error.parserError'));
    } else { resolve(doc); }
  });
}
