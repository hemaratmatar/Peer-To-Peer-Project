import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Navbar2 from '../Navbar/navbar';
import { addKnowledge } from '../redux/action/knowledge';
import { getUser } from '../redux/action/user';
import './CourseForm.css';

const Addknow = ({ addKnowledge, getUser, auth: { user: authUser }, user: { users }, history }) => {
  const [formKnow, setFormKnow] = useState({
    title: '',
    discription: '',
    instructor: '',
    students: [],
    status: 'false',
    completionStatus: 'ongoing'
  });

  useEffect(() => { getUser(); }, [getUser]);

  useEffect(() => {
    if (!formKnow.instructor && authUser && authUser.role === 'instructor') {
      setFormKnow(current => ({ ...current, instructor: authUser._id || authUser.id }));
    } else if (!formKnow.instructor && users.length) {
      const instructor = users.find(item => item.role === 'instructor' || item.role === 'admin');
      if (instructor) setFormKnow(current => ({ ...current, instructor: instructor._id || instructor.id }));
    }
  }, [users, authUser, formKnow.instructor]);

  const instructors = users.filter(item => item.role === 'instructor' || item.role === 'admin');
  const students = users.filter(item => !item.role || item.role === 'user');
  const isAdmin = authUser && authUser.role === 'admin';

  const onChange = event => {
    const { name, value } = event.target;
    setFormKnow(current => ({ ...current, [name]: value }));
  };

  const onStudentsChange = event => {
    const selected = Array.from(event.target.options)
      .filter(option => option.selected)
      .map(option => option.value);
    setFormKnow(current => ({ ...current, students: selected }));
  };

  const onSubmit = event => {
    event.preventDefault();
    addKnowledge(formKnow, history);
  };

  return (
    <div className="learning-app">
      <Navbar2 />
      <main className="course-form-shell">
        <header className="form-page-heading">
          <div>
            <span className="eyebrow">COURSE MANAGEMENT</span>
            <h1>สร้างหลักสูตรใหม่</h1>
            <p>เพิ่มเนื้อหาหลักของคอร์ส กำหนดผู้สอน และเลือกผู้เรียนที่ต้องการลงทะเบียน</p>
          </div>
          <button className="secondary-action" type="button" onClick={() => history.push('/home')}>กลับหน้าหลัก</button>
        </header>

        <form className="course-form-card" onSubmit={onSubmit}>
          <section className="form-section">
            <div className="form-section__intro">
              <span className="form-step">01</span>
              <div><h2>ข้อมูลหลักสูตร</h2><p>ข้อมูลนี้จะแสดงในการ์ดหลักสูตรบนหน้า Home</p></div>
            </div>

            <div className="form-grid">
              <label className="field field--full">
                <span>ชื่อหลักสูตร <em>*</em></span>
                <input
                  type="text"
                  name="title"
                  placeholder="เช่น พื้นฐานการออกแบบประสบการณ์ผู้ใช้"
                  value={formKnow.title}
                  onChange={onChange}
                  required
                />
                <small>ใช้ชื่อสั้น กระชับ และสื่อถึงสิ่งที่ผู้เรียนจะได้รับ</small>
              </label>

              <label className="field field--full">
                <span>รายละเอียดและสิ่งที่จะได้เรียนรู้ <em>*</em></span>
                <textarea
                  name="discription"
                  rows="5"
                  placeholder="อธิบายหัวข้อสำคัญ ผลลัพธ์การเรียนรู้ และกลุ่มผู้เรียนที่เหมาะสม"
                  value={formKnow.discription}
                  onChange={onChange}
                  required
                />
                <small>{formKnow.discription.length}/500 ตัวอักษร</small>
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section__intro">
              <span className="form-step form-step--cyan">02</span>
              <div><h2>ผู้สอนและผู้เรียน</h2><p>กำหนดคนดูแลเนื้อหาและสมาชิกของหลักสูตร</p></div>
            </div>

            <div className="form-grid form-grid--two">
              {isAdmin ? (
                <label className="field">
                  <span>ผู้สอน <em>*</em></span>
                  <select name="instructor" value={formKnow.instructor} onChange={onChange} required>
                    <option value="">เลือกผู้สอน</option>
                    {instructors.map(item => (
                      <option key={item._id || item.id} value={item._id || item.id}>{item.name} · {item.role}</option>
                    ))}
                  </select>
                  <small>เฉพาะ Admin เท่านั้นที่กำหนดผู้สอนได้</small>
                </label>
              ) : (
                <label className="field">
                  <span>ผู้สอน</span>
                  <input value={authUser ? authUser.name : ''} readOnly />
                  <small>หลักสูตรใหม่จะเป็นของคุณและไม่สามารถเปลี่ยนผู้สอนได้</small>
                </label>
              )}

              <label className="field">
                <span>ผู้เรียนในหลักสูตร</span>
                <select multiple name="students" value={formKnow.students} onChange={onStudentsChange}>
                  {students.map(item => (
                    <option key={item._id || item.id} value={item._id || item.id}>{item.name} · {item.username}</option>
                  ))}
                </select>
                <small>กด Ctrl ค้างไว้เพื่อเลือกหลายคน · เลือกแล้ว {formKnow.students.length} คน</small>
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section__intro">
              <span className="form-step form-step--gray">03</span>
              <div><h2>สถานะหลักสูตร</h2><p>กำหนดการเผยแพร่และระบุว่าหลักสูตรจบแล้วหรือยัง</p></div>
            </div>
            <div className="form-grid form-grid--two">
              <label className="field">
                <span>การเผยแพร่</span>
                <select name="status" value={formKnow.status} onChange={onChange}>
                  <option value="false">ฉบับร่าง</option>
                  <option value="true">เปิดใช้งาน</option>
                </select>
              </label>
              <label className="field">
                <span>ความคืบหน้าหลักสูตร</span>
                <select name="completionStatus" value={formKnow.completionStatus} onChange={onChange}>
                  <option value="ongoing">กำลังดำเนินการ</option>
                  <option value="completed">จบหลักสูตรแล้ว</option>
                </select>
              </label>
            </div>
          </section>

          <section className="form-section form-section--muted">
            <div className="form-section__intro">
              <span className="form-step form-step--gray">04</span>
              <div><h2>สื่อการเรียน</h2><p>ระบบอัปโหลดไฟล์จะเพิ่มในขั้นถัดไป</p></div>
            </div>
            <div className="upload-placeholder">
              <div><strong>ไฟล์ประกอบบทเรียน</strong><p>รองรับ PDF, Video และเอกสารประกอบในเวอร์ชันถัดไป</p></div>
              <span className="coming-soon">COMING SOON</span>
            </div>
          </section>

          <footer className="form-actions">
            <button className="secondary-action" type="button" onClick={() => history.push('/home')}>ยกเลิก</button>
            <button className="primary-action form-submit" type="submit">สร้างหลักสูตร</button>
          </footer>
        </form>
      </main>
    </div>
  );
};

Addknow.propTypes = {
  addKnowledge: PropTypes.func.isRequired,
  getUser: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = state => ({ auth: state.auth, user: state.users });

export default connect(mapStateToProps, { addKnowledge, getUser })(Addknow);
