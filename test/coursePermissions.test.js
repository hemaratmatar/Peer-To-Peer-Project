const test = require('node:test');
const assert = require('node:assert/strict');
const isCourseManager = require('../utils/coursePermissions');

const course = { sender: { uid: 'instructor-1' } };

test('only admins and the assigned instructor can manage a course', () => {
  assert.equal(isCourseManager({ id: 'admin-1', role: 'admin' }, course), true);
  assert.equal(isCourseManager({ id: 'instructor-1', role: 'instructor' }, course), true);
  assert.equal(isCourseManager({ id: 'instructor-2', role: 'instructor' }, course), false);
  assert.equal(isCourseManager({ id: 'student-1', role: 'user' }, course), false);
});
