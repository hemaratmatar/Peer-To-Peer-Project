const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidId, validYouTubeUrl, uniqueIds } = require('../utils/validation');

test('YouTube URLs must be http(s) links to YouTube videos', () => {
  assert.equal(validYouTubeUrl(''), true);
  assert.equal(validYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), true);
  assert.equal(validYouTubeUrl('https://youtu.be/dQw4w9WgXcQ'), true);
  assert.equal(validYouTubeUrl('https://m.youtube.com/shorts/abc123'), true);
  assert.equal(validYouTubeUrl('javascript://youtube.com/embed/x%0aalert(1)'), false);
  assert.equal(validYouTubeUrl('https://youtube.com.evil.test/watch?v=x'), false);
  assert.equal(validYouTubeUrl('https://www.youtube.com/'), false);
  assert.equal(validYouTubeUrl('not a url'), false);
});

test('only 24-character hex strings are treated as ObjectIds', () => {
  assert.equal(isValidId('5e4f1c2b9d3e8a0012345678'), true);
  assert.equal(isValidId('abc'), false);
  assert.equal(isValidId(undefined), false);
  assert.equal(isValidId({ $ne: null }), false);
});

test('student id lists must be arrays and are de-duplicated', () => {
  assert.deepEqual(uniqueIds(['a', 'b', 'a']), ['a', 'b']);
  assert.deepEqual(uniqueIds('abc'), []);
  assert.deepEqual(uniqueIds(undefined), []);
});
