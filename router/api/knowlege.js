const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../../Middleware/auth');
const User = require('../../model/User');
const Know = require('../../model/knowlege');
const isCourseManager = require('../../utils/coursePermissions');
const { isValidId, validYouTubeUrl, uniqueIds } = require('../../utils/validation');

const router = express.Router();

const courseAccessQuery = (viewer, userId) => {
  if (viewer && viewer.role === 'admin') return {};
  if (viewer && viewer.role === 'instructor') {
    return { $or: [{ status: 'true' }, { 'sender.uid': userId }] };
  }
  return { status: 'true' };
};

// Learners only get a head count; enrolled names and the course creator stay private
const serializeCourse = (course, viewer) => {
  const data = course.toObject();
  if (!viewer || viewer.role === 'user') {
    data.studentCount = (data.students || []).length;
    delete data.students;
    delete data.resever;
  }
  return data;
};

const populatedCourse = id => Know.findById(id).populate('students', 'name username role');

const courseValidation = [
  check('title', 'Course title is required').trim().not().isEmpty(),
  check('title', 'Course title must be at most 200 characters').isLength({ max: 200 }),
  check('discription', 'Description is required').trim().not().isEmpty(),
  check('discription', 'Description must be at most 500 characters').isLength({ max: 500 })
];

const lessonValidation = [
  check('title', 'Lesson title is required').trim().not().isEmpty(),
  check('content', 'Lesson content is required').trim().not().isEmpty(),
  check('youtubeUrl', 'YouTube URL is invalid').optional({ checkFalsy: true }).custom(validYouTubeUrl)
];

const getStudents = async ids => {
  const studentIds = uniqueIds(ids);
  if (!studentIds.every(isValidId)) return { studentIds, students: [] };
  const students = await User.find({ _id: { $in: studentIds }, role: 'user' }).select('-password');
  return { studentIds, students };
};

// Loads the course named by req.params[param] and checks the viewer may manage it
const loadManagedCourse = async (req, res, param) => {
  const course = isValidId(req.params[param]) ? await Know.findById(req.params[param]) : null;
  if (!course) {
    res.status(404).json({ msg: 'Course not found' });
    return null;
  }
  const viewer = await User.findById(req.user.id).select('role');
  if (!isCourseManager(viewer, course)) {
    res.status(403).json({ msg: 'You cannot manage this course' });
    return null;
  }
  return course;
};

router.post('/', [auth, ...courseValidation], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const viewer = await User.findById(req.user.id).select('-password');
    if (!viewer || !['admin', 'instructor'].includes(viewer.role)) {
      return res.status(403).json({ msg: 'Course management access required' });
    }

    const instructorId = viewer.role === 'admin' ? String(req.body.instructor) : viewer.id;
    const instructor = isValidId(instructorId) ? await User.findById(instructorId).select('-password') : null;
    if (!instructor) return res.status(400).json({ msg: 'Instructor not found' });
    if (!['admin', 'instructor'].includes(instructor.role)) {
      return res.status(400).json({ msg: 'Course owner must be an admin or instructor' });
    }

    const { studentIds, students } = await getStudents(req.body.students);
    if (students.length !== studentIds.length) {
      return res.status(400).json({ msg: 'Every selected student must have the user role' });
    }
    const course = await new Know({
      title: req.body.title,
      discription: req.body.discription,
      status: req.body.status === 'true' ? 'true' : 'false',
      completionStatus: req.body.completionStatus === 'completed' ? 'completed' : 'ongoing',
      students: students.map(student => student.id),
      resever: { uid: req.user.id, name: viewer.name },
      sender: { uid: instructor.id, name: instructor.name }
    }).save();

    res.status(201).json(await populatedCourse(course.id));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const viewer = await User.findById(req.user.id).select('role');
    const query = courseAccessQuery(viewer, req.user.id);
    const courses = await Know.find(query)
      .populate('students', 'name username role')
      .sort({ _id: -1 });
    res.json(courses.map(course => serializeCourse(course, viewer)));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    const viewer = await User.findById(req.user.id).select('role');
    const course = await Know.findOne({ _id: req.params.id, ...courseAccessQuery(viewer, req.user.id) })
      .populate('students', 'name username role');
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    res.json(serializeCourse(course, viewer));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/:id/lessons', auth, lessonValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const course = await loadManagedCourse(req, res, 'id');
    if (!course) return;
    course.lessons.push({
      title: req.body.title,
      content: req.body.content,
      youtubeUrl: req.body.youtubeUrl || '',
      order: course.lessons.length + 1
    });
    await course.save();
    res.status(201).json(await populatedCourse(course.id));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:courseId/lessons/:lessonId', auth, lessonValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const course = await loadManagedCourse(req, res, 'courseId');
    if (!course) return;
    const lesson = isValidId(req.params.lessonId) && course.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ msg: 'Lesson not found' });
    lesson.title = req.body.title;
    lesson.content = req.body.content;
    lesson.youtubeUrl = req.body.youtubeUrl || '';
    await course.save();
    res.json(await populatedCourse(course.id));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:courseId/lessons/:lessonId', auth, async (req, res) => {
  try {
    const course = await loadManagedCourse(req, res, 'courseId');
    if (!course) return;
    const lesson = isValidId(req.params.lessonId) && course.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ msg: 'Lesson not found' });
    lesson.remove();
    course.lessons.forEach((item, index) => { item.order = index + 1; });
    await course.save();
    res.json(await populatedCourse(course.id));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/editknow', [auth, ...courseValidation], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const original = isValidId(String(req.body.id)) ? await Know.findById(req.body.id) : null;
    if (!original) return res.status(404).json({ msg: 'Course not found' });
    const viewer = await User.findById(req.user.id).select('-password');
    if (!isCourseManager(viewer, original)) {
      return res.status(403).json({ msg: 'You cannot manage this course' });
    }

    const { studentIds, students } = await getStudents(req.body.students);
    if (students.length !== studentIds.length) {
      return res.status(400).json({ msg: 'Every selected student must have the user role' });
    }

    let instructor = { id: original.sender.uid, name: original.sender.name };
    if (viewer.role === 'admin') {
      const selected = isValidId(String(req.body.instructor))
        ? await User.findById(req.body.instructor).select('-password')
        : null;
      if (!selected || !['admin', 'instructor'].includes(selected.role)) {
        return res.status(400).json({ msg: 'Course owner must be an admin or instructor' });
      }
      instructor = selected;
    }

    const update = {
      title: req.body.title,
      discription: req.body.discription,
      status: req.body.status === 'true' ? 'true' : 'false',
      completionStatus: req.body.completionStatus === 'completed' ? 'completed' : 'ongoing',
      students: students.map(student => student.id),
      sender: { uid: instructor.id, name: instructor.name }
    };
    await Know.findByIdAndUpdate(original.id, { $set: update });
    res.json(await populatedCourse(original.id));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await loadManagedCourse(req, res, 'id');
    if (!course) return;
    await course.remove();
    res.json({ id: course.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
