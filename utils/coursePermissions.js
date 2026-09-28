module.exports = (viewer, course) => Boolean(
  viewer && course && (
    viewer.role === 'admin' ||
    (viewer.role === 'instructor' && course.sender && String(course.sender.uid) === String(viewer.id))
  )
);
