import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Popconfirm, message } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Navbar2 from '../Navbar/navbar';
import { addLesson, deleteLesson, getKnowbyID, updateLesson } from '../redux/action/knowledge';
import { errorMessage } from '../redux/utils/errorPayload';
import { studentCount, youtubeVideoId } from './courseUtils';
import '../Home/Home.css';
import '../Knowledge/CourseForm.css';
import './CourseDetail.css';

const emptyLesson = { title: '', content: '', youtubeUrl: '' };

const CourseDetail = ({
  auth: { user },
  knowledge: { know, loading, error },
  match,
  getKnowbyID,
  addLesson,
  updateLesson,
  deleteLesson
}) => {
  const courseId = match.params.id;
  const [form, setForm] = useState(emptyLesson);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { getKnowbyID(courseId); }, [getKnowbyID, courseId]);

  const course = know && know._id === courseId ? know : null;
  const canManage = user && course && (
    user.role === 'admin' ||
    (user.role === 'instructor' && course.sender && String(course.sender.uid) === String(user._id || user.id))
  );
  const lessons = course ? [...(course.lessons || [])].sort((a, b) => a.order - b.order) : [];

  const onChange = event => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const closeForm = () => {
    setForm(emptyLesson);
    setEditingId(null);
    setIsFormOpen(false);
    setFormError('');
  };

  const onSubmit = async event => {
    event.preventDefault();
    setFormError('');
    try {
      if (editingId) await updateLesson(courseId, editingId, form);
      else await addLesson(courseId, form);
      closeForm();
    } catch (err) {
      setFormError(errorMessage(err, 'ไม่สามารถบันทึกบทเรียนได้'));
    }
  };

  const onDeleteLesson = async lessonId => {
    try {
      await deleteLesson(courseId, lessonId);
    } catch (err) {
      message.error(errorMessage(err, 'ไม่สามารถลบบทเรียนได้'));
    }
  };

  const startEdit = lesson => {
    setForm({ title: lesson.title, content: lesson.content, youtubeUrl: lesson.youtubeUrl || '' });
    setEditingId(lesson._id);
    setIsFormOpen(true);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!course && error && error.id === courseId) {
    return (
      <div className="learning-app"><Navbar2 /><main className="lesson-shell">
        <Link className="text-back-link" to="/courses">กลับไปหลักสูตรทั้งหมด</Link>
        <div className="catalog-empty"><strong>ไม่พบหลักสูตร</strong><p>หลักสูตรนี้อาจถูกลบ หรือคุณไม่มีสิทธิ์เข้าถึง</p></div>
      </main></div>
    );
  }

  if (loading || !course) {
    return <div className="learning-app"><Navbar2 /><main className="lesson-shell"><div className="catalog-empty"><strong>กำลังโหลดหลักสูตร</strong></div></main></div>;
  }

  return (
    <div className="learning-app">
      <Navbar2 />
      <main className="lesson-shell">
        <Link className="text-back-link" to="/courses">กลับไปหลักสูตรทั้งหมด</Link>

        <header className="lesson-hero">
          <div>
            <span className="eyebrow">COURSE LESSONS</span>
            <h1>{course.title}</h1>
            <p>{course.discription || 'ยังไม่มีรายละเอียดหลักสูตร'}</p>
            <div className="lesson-hero__meta">
              <span>ผู้สอน: {course.sender && course.sender.name ? course.sender.name : 'ยังไม่ระบุ'}</span>
              <span>{lessons.length} บทเรียน</span>
              <span>{studentCount(course)} ผู้เรียน</span>
              <span>{course.status === 'true' ? 'เปิดใช้งาน' : 'ฉบับร่าง'}</span>
              <span>{course.completionStatus === 'completed' ? 'จบหลักสูตรแล้ว' : 'กำลังดำเนินการ'}</span>
            </div>
          </div>
          {canManage && <button className="primary-action form-submit" type="button" onClick={() => { setEditingId(null); setForm(emptyLesson); setFormError(''); setIsFormOpen(true); }}>เพิ่มบทเรียน</button>}
        </header>

        {canManage && isFormOpen && (
          <form className="lesson-form" onSubmit={onSubmit}>
            <div className="lesson-form__heading">
              <div><span className="eyebrow">LESSON EDITOR</span><h2>{editingId ? 'แก้ไขบทเรียน' : 'เพิ่มบทเรียนใหม่'}</h2></div>
              <button className="text-button" type="button" onClick={closeForm}>ปิดแบบฟอร์ม</button>
            </div>
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-grid">
              <label className="field">
                <span>ชื่อบทเรียน</span>
                <input name="title" value={form.title} onChange={onChange} placeholder="เช่น บทที่ 1: ทำความเข้าใจพื้นฐาน" required />
              </label>
              <label className="field">
                <span>เนื้อหาบทเรียน</span>
                <textarea name="content" rows="8" value={form.content} onChange={onChange} placeholder="เขียนคำอธิบาย เนื้อหา หรืองานที่ผู้เรียนต้องทำ" required />
              </label>
              <label className="field">
                <span>ลิงก์ YouTube (ไม่บังคับ)</span>
                <input type="url" name="youtubeUrl" value={form.youtubeUrl} onChange={onChange} placeholder="https://www.youtube.com/watch?v=..." />
                <small>รองรับลิงก์ youtube.com และ youtu.be</small>
              </label>
            </div>
            <div className="lesson-form__actions">
              <button className="secondary-action" type="button" onClick={closeForm}>ยกเลิก</button>
              <button className="primary-action form-submit" type="submit">{editingId ? 'บันทึกการแก้ไข' : 'เพิ่มบทเรียน'}</button>
            </div>
          </form>
        )}

        <section className="lesson-list">
          <div className="section-heading">
            <div><span className="eyebrow">LEARNING CONTENT</span><h2>เนื้อหาทั้งหมด</h2></div>
            <span className="section-heading__count">{lessons.length} บท</span>
          </div>

          {lessons.length ? lessons.map(lesson => {
            const videoId = youtubeVideoId(lesson.youtubeUrl);
            return (
              <article className="lesson-card" key={lesson._id}>
                <div className="lesson-card__heading">
                  <span>บทที่ {lesson.order}</span>
                  <div><h3>{lesson.title}</h3><small>เนื้อหาการเรียนรู้</small></div>
                  {canManage && (
                    <div className="lesson-card__actions">
                      <button type="button" onClick={() => startEdit(lesson)}>แก้ไข</button>
                      <Popconfirm icon={null} title="ลบบทเรียนนี้หรือไม่?" onConfirm={() => onDeleteLesson(lesson._id)} okText="ลบ" cancelText="ยกเลิก">
                        <button className="is-danger" type="button">ลบ</button>
                      </Popconfirm>
                    </div>
                  )}
                </div>
                <div className="lesson-card__content"><p>{lesson.content}</p></div>
                {videoId && (
                  <div className="lesson-video">
                    <iframe src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">เปิดวิดีโอบน YouTube</a>
                  </div>
                )}
              </article>
            );
          }) : (
            <div className="catalog-empty"><strong>ยังไม่มีบทเรียน</strong><p>{canManage ? 'เริ่มต้นเพิ่มบทเรียนแรกของหลักสูตรนี้' : 'ผู้ดูแลหลักสูตรกำลังเตรียมเนื้อหา'}</p></div>
          )}
        </section>
      </main>
    </div>
  );
};

CourseDetail.propTypes = {
  auth: PropTypes.object.isRequired,
  knowledge: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  getKnowbyID: PropTypes.func.isRequired,
  addLesson: PropTypes.func.isRequired,
  updateLesson: PropTypes.func.isRequired,
  deleteLesson: PropTypes.func.isRequired
};

const mapStateToProps = state => ({ auth: state.auth, knowledge: state.knowledge });

export default connect(mapStateToProps, { getKnowbyID, addLesson, updateLesson, deleteLesson })(CourseDetail);
