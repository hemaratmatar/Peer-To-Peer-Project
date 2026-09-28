import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Navbar2 from '../Navbar/navbar';
import { editKnowledge, getKnowbyID } from '../redux/action/knowledge';
import { getUser } from '../redux/action/user';
import './CourseForm.css';

const Editknow = ({
  auth: { user: authUser }, editKnowledge, getKnowbyID, getUser,
  knowledge: { know }, users: { users }, match, history
}) => {
  const courseId = match.params.id;
  const [form, setForm] = useState({
    id: courseId, title: '', discription: '', instructor: '', students: [],
    status: 'false', completionStatus: 'ongoing'
  });

  useEffect(() => {
    getKnowbyID(courseId);
    getUser();
  }, [getKnowbyID, getUser, courseId]);

  useEffect(() => {
    if (know && know._id === courseId) {
      setForm({
        id: courseId,
        title: know.title || '',
        discription: know.discription || '',
        instructor: know.sender && know.sender.uid ? know.sender.uid : '',
        students: (know.students || []).map(student => student._id || student.id || student),
        status: know.status || 'false',
        completionStatus: know.completionStatus || 'ongoing'
      });
    }
  }, [know, courseId]);

  useEffect(() => {
    const ownerId = know && know.sender && know.sender.uid;
    if (know && know._id === courseId && authUser && authUser.role === 'instructor' && String(ownerId) !== String(authUser._id || authUser.id)) {
      history.replace('/courses');
    }
  }, [know, authUser, courseId, history]);

  const isAdmin = authUser && authUser.role === 'admin';
  const instructors = users.filter(item => ['admin', 'instructor'].includes(item.role));
  const students = users.filter(item => !item.role || item.role === 'user');

  const onChange = event => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const onStudentsChange = event => {
    const selected = Array.from(event.target.options)
      .filter(option => option.selected)
      .map(option => option.value);
    setForm(current => ({ ...current, students: selected }));
  };

  const onSubmit = event => {
    event.preventDefault();
    editKnowledge(form, history);
  };

  return (
    <div className="learning-app">
      <Navbar2 />
      <main className="course-form-shell">
        <header className="form-page-heading">
          <div>
            <span className="eyebrow">COURSE MANAGEMENT</span>
            <h1>แก้ไขหลักสูตร</h1>
            <p>จัดการเนื้อหา ผู้เรียน สถานะ และผู้สอนตามสิทธิ์ของคุณ</p>
          </div>
          <button className="secondary-action" type="button" onClick={() => history.push('/courses')}>กลับหน้าหลักสูตร</button>
        </header>

        <form className="course-form-card" onSubmit={onSubmit}>
          <section className="form-section">
            <div className="form-section__intro">
              <span className="form-step">01</span>
              <div><h2>ข้อมูลหลักสูตร</h2><p>ผู้สอนแก้ไขได้เฉพาะหลักสูตรของตนเอง</p></div>
            </div>
            <div className="form-grid">
              <label className="field"><span>ชื่อหลักสูตร</span><input name="title" value={form.title} onChange={onChange} required /></label>
              <label className="field"><span>รายละเอียดหลักสูตร</span><textarea name="discription" rows="6" value={form.discription} onChange={onChange} required /></label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section__intro">
              <span className="form-step form-step--cyan">02</span>
              <div><h2>ผู้สอนและผู้เรียน</h2><p>Admin เปลี่ยนผู้สอนได้ ส่วนผู้สอนจัดการรายชื่อผู้เรียนได้</p></div>
            </div>
            <div className="form-grid form-grid--two">
              {isAdmin ? (
                <label className="field">
                  <span>ผู้สอน</span>
                  <select name="instructor" value={form.instructor} onChange={onChange} required>
                    <option value="">เลือกผู้สอน</option>
                    {instructors.map(item => <option key={item._id || item.id} value={item._id || item.id}>{item.name} · {item.role}</option>)}
                  </select>
                </label>
              ) : (
                <label className="field"><span>ผู้สอน</span><input value={know && know.sender ? know.sender.name : ''} readOnly /><small>ผู้สอนไม่สามารถเปลี่ยนเจ้าของหลักสูตรได้</small></label>
              )}
              <label className="field">
                <span>ผู้เรียนในหลักสูตร</span>
                <select multiple name="students" value={form.students} onChange={onStudentsChange}>
                  {students.map(item => <option key={item._id || item.id} value={item._id || item.id}>{item.name} · {item.username}</option>)}
                </select>
                <small>เลือกแล้ว {form.students.length} คน</small>
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section__intro">
              <span className="form-step form-step--gray">03</span>
              <div><h2>สถานะหลักสูตร</h2><p>ระบุการเผยแพร่และแจ้งว่าหลักสูตรจบแล้วหรือยัง</p></div>
            </div>
            <div className="form-grid form-grid--two">
              <label className="field"><span>การเผยแพร่</span><select name="status" value={form.status} onChange={onChange}><option value="false">ฉบับร่าง</option><option value="true">เปิดใช้งาน</option></select></label>
              <label className="field"><span>ความคืบหน้าหลักสูตร</span><select name="completionStatus" value={form.completionStatus} onChange={onChange}><option value="ongoing">กำลังดำเนินการ</option><option value="completed">จบหลักสูตรแล้ว</option></select></label>
            </div>
          </section>

          <footer className="form-actions">
            <button className="secondary-action" type="button" onClick={() => history.push('/courses')}>ยกเลิก</button>
            <button className="primary-action form-submit" type="submit">บันทึกการแก้ไข</button>
          </footer>
        </form>
      </main>
    </div>
  );
};

Editknow.propTypes = {
  auth: PropTypes.object.isRequired, editKnowledge: PropTypes.func.isRequired,
  getKnowbyID: PropTypes.func.isRequired, getUser: PropTypes.func.isRequired,
  knowledge: PropTypes.object.isRequired, users: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired, history: PropTypes.object.isRequired
};

const mapStateToProps = state => ({ auth: state.auth, knowledge: state.knowledge, users: state.users });

export default connect(mapStateToProps, { getKnowbyID, getUser, editKnowledge })(Editknow);
