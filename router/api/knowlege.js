const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../../Middleware/auth');
const User = require('../../model/User');
const Know = require('../../model/knowlege');
const Resever = require('../../model/Resever');
const Sender = require('../../model/Sender');
const isCourseManager = require('../../utils/coursePermissions');

const router = express.Router();

const courseAccessQuery = (viewer, userId) => {
  if (viewer && viewer.role === 'admin') return {};
  if (viewer && viewer.role === 'instructor') {
    return { $or: [{ status: 'true' }, { 'sender.uid': userId }] };
  }
  return { status: 'true' };
};

const validYouTubeUrl = value => {
  if (!value) return true;
  try {
    const url = new URL(value);
    const host = url.hostname.replace('www.', '');
    if (host === 'youtu.be') return Boolean(url.pathname.split('/').filter(Boolean)[0]);
    if (!['youtube.com', 'm.youtube.com'].includes(host)) return false;
    return Boolean(url.searchParams.get('v') || url.pathname.match(/^\/(embed|shorts)\/[^/]+/));
  } catch (err) {
    return false;
  }
};

const lessonValidation = [
  check('title', 'Lesson title is required').not().isEmpty(),
  check('content', 'Lesson content is required').not().isEmpty(),
  check('youtubeUrl', 'YouTube URL is invalid').optional({ checkFalsy: true }).custom(validYouTubeUrl)
];

const getStudents = async ids => {
  const studentIds = [...new Set(ids || [])];
  const students = await User.find({ _id: { $in: studentIds }, role: 'user' }).select('-password');
  return { studentIds, students };
};

router.post(
  '/',
  [
    auth,
    check('title', 'Course title is required').not().isEmpty(),
    check('discription', 'Description is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const viewer = await User.findById(req.user.id).select('-password');
      if (!viewer || !['admin', 'instructor'].includes(viewer.role)) {
        return res.status(403).json({ msg: 'Course management access required' });
      }

      const instructorId = viewer.role === 'admin' ? req.body.instructor : viewer.id;
      const instructor = await User.findById(instructorId).select('-password');
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

      if (students.length) {
        await Resever.insertMany(students.map(student => ({
          uid: student.id,
          name: student.name,
          title: course.title,
          discription: course.discription
        })));
      }

      await new Sender({
        uidresev: req.user.id,
        uid: instructor.id,
        name: instructor.name,
        title: course.title,
        discription: course.discription,
        status: course.status
      }).save();

      res.status(201).json(await Know.findById(course.id).populate('students', 'name username role'));
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.get('/', auth, async (req, res) => {
  try {
    const viewer = await User.findById(req.user.id).select('role');
    const query = courseAccessQuery(viewer, req.user.id);
    const courses = await Know.find(query)
      .populate('students', 'name username role')
      .sort({ _id: -1 });
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    const viewer = await User.findById(req.user.id).select('role');
    const course = await Know.findOne({ _id: req.params.id, ...courseAccessQuery(viewer, req.user.id) })
      .populate('students', 'name username role');
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/:id/lessons', auth, lessonValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const course = await Know.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    const viewer = await User.findById(req.user.id).select('role');
    if (!isCourseManager(viewer, course)) return res.status(403).json({ msg: 'You cannot manage this course' });
    course.lessons.push({
      title: req.body.title,
      content: req.body.content,
      youtubeUrl: req.body.youtubeUrl || '',
      order: course.lessons.length + 1
    });
    await course.save();
    res.status(201).json(await Know.findById(course.id).populate('students', 'name username role'));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:courseId/lessons/:lessonId', auth, lessonValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const course = await Know.findById(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    const viewer = await User.findById(req.user.id).select('role');
    if (!isCourseManager(viewer, course)) return res.status(403).json({ msg: 'You cannot manage this course' });
    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ msg: 'Lesson not found' });
    lesson.title = req.body.title;
    lesson.content = req.body.content;
    lesson.youtubeUrl = req.body.youtubeUrl || '';
    await course.save();
    res.json(await Know.findById(course.id).populate('students', 'name username role'));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:courseId/lessons/:lessonId', auth, async (req, res) => {
  try {
    const course = await Know.findById(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    const viewer = await User.findById(req.user.id).select('role');
    if (!isCourseManager(viewer, course)) return res.status(403).json({ msg: 'You cannot manage this course' });
    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ msg: 'Lesson not found' });
    lesson.remove();
    course.lessons.forEach((item, index) => { item.order = index + 1; });
    await course.save();
    res.json(await Know.findById(course.id).populate('students', 'name username role'));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post(
  '/editknow',
  [
    auth,
    check('title', 'Course title is required').not().isEmpty(),
    check('discription', 'Description is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const original = await Know.findById(req.body.id);
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
        const selected = await User.findById(req.body.instructor).select('-password');
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
      const course = await Know.findByIdAndUpdate(original.id, { $set: update }, { new: true });
      await Resever.deleteMany({ title: original.title });
      if (students.length) {
        await Resever.insertMany(students.map(student => ({
          uid: student.id,
          name: student.name,
          title: course.title,
          discription: course.discription
        })));
      }
      await Sender.updateMany(
        { title: original.title, uid: original.sender.uid },
        { $set: { uid: instructor.id, name: instructor.name, title: course.title, discription: course.discription, status: course.status } }
      );
      res.json(await Know.findById(course.id).populate('students', 'name username role'));
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Know.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    const viewer = await User.findById(req.user.id).select('role');
    if (!isCourseManager(viewer, course)) return res.status(403).json({ msg: 'You cannot manage this course' });
    await course.remove();
    await Resever.deleteMany({ title: course.title });
    await Sender.deleteMany({ title: course.title });
    res.json({ id: course.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
