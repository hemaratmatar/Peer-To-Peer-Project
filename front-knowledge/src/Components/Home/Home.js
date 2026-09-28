import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Popconfirm } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Navbar2 from '../Navbar/navbar';
import { deleteKnowledge, getKnowledge } from '../redux/action/knowledge';
import { getResever } from '../redux/action/resever';
import { getSender } from '../redux/action/sender';
import './Home.css';

const EmptyState = ({ title, detail }) => (
  <div className="empty-state">
    <strong>{title}</strong>
    <p>{detail}</p>
  </div>
);

const Home = ({
  auth: { user },
  knowledge: { knowledge },
  resever: { resever },
  sender: { sender },
  getKnowledge,
  deleteKnowledge,
  getResever,
  getSender
}) => {
  useEffect(() => {
    getKnowledge();
    getResever();
    getSender();
  }, [getKnowledge, getResever, getSender]);

  const courses = knowledge || [];
  const learning = resever || [];
  const teaching = sender || [];
  const isAdmin = user && user.role === 'admin';
  const isInstructor = user && user.role === 'instructor';
  const canCreateCourse = isAdmin || isInstructor;
  const activeCourses = courses.filter(course => course.status === 'true').length;

  return (
    <div className="learning-app">
      <Navbar2 />
      <main className="dashboard-shell">
        <section className="dashboard-hero">
          <div>
            <span className="eyebrow">LEARNING DASHBOARD</span>
            <h1>สวัสดี {user ? user.name : 'ผู้เรียน'}</h1>
            <p>จัดการหลักสูตร ติดตามเนื้อหาที่กำลังเรียน และดูงานสอนทั้งหมดได้จากที่เดียว</p>
          </div>
          {canCreateCourse && (
            <Link className="primary-action" to="/addknow">สร้างหลักสูตรใหม่</Link>
          )}
        </section>

        <section className="stat-grid" aria-label="สรุปข้อมูล">
          <article className="stat-card stat-card--blue">
            <span className="stat-card__label">หลักสูตรทั้งหมด</span>
            <strong>{courses.length}</strong>
            <small>คอร์สในระบบ</small>
          </article>
          <article className="stat-card stat-card--cyan">
            <span className="stat-card__label">กำลังเรียน</span>
            <strong>{learning.length}</strong>
            <small>คอร์สของฉัน</small>
          </article>
          <article className="stat-card stat-card--violet">
            <span className="stat-card__label">งานสอน</span>
            <strong>{teaching.length}</strong>
            <small>รายการที่ได้รับมอบหมาย</small>
          </article>
          <article className="stat-card stat-card--green">
            <span className="stat-card__label">เปิดใช้งานแล้ว</span>
            <strong>{activeCourses}</strong>
            <small>หลักสูตรพร้อมเรียน</small>
          </article>
        </section>

        <section className="content-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">COURSE LIBRARY</span>
              <h2>หลักสูตรทั้งหมด</h2>
            </div>
            <Link className="section-heading__link" to="/courses">ดูหลักสูตรทั้งหมด</Link>
          </div>

          {courses.length ? (
            <div className="course-grid">
              {courses.slice(0, 3).map((course, index) => {
                const canManage = isAdmin || (isInstructor && course.sender && String(course.sender.uid) === String(user._id || user.id));
                return (
                <article className="course-card" key={course._id || index}>
                  <div className={`course-card__cover course-card__cover--${index % 4}`}>
                    <span>COURSE {String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="course-card__body">
                    <div className="course-card__meta">
                      <span className={`status-pill ${course.status === 'true' ? 'is-live' : 'is-draft'}`}>
                        {course.status === 'true' ? 'เปิดใช้งาน' : 'ฉบับร่าง'}
                      </span>
                      <span>{course.students ? course.students.length : 0} ผู้เรียน</span>
                      <span className={`status-pill ${course.completionStatus === 'completed' ? 'is-completed' : 'is-ongoing'}`}>
                        {course.completionStatus === 'completed' ? 'จบหลักสูตรแล้ว' : 'กำลังดำเนินการ'}
                      </span>
                    </div>
                    <h3>{course.title}</h3>
                    <p>{course.discription || 'ยังไม่มีรายละเอียดหลักสูตร'}</p>
                    <div className="course-card__footer">
                      <span>ผู้สอน: <strong>{course.sender && course.sender.name ? course.sender.name : 'ยังไม่ระบุ'}</strong></span>
                      <div className="course-card__actions">
                        <Link to={`/courses/${course._id}`}>ดูบทเรียน</Link>
                        {canManage && (
                          <React.Fragment>
                          <Link to={`/edit-knowledge/${course._id}`}>แก้ไข</Link>
                          <Popconfirm icon={null} title="ลบหลักสูตรนี้หรือไม่?" onConfirm={() => deleteKnowledge(course._id)} okText="ลบ" cancelText="ยกเลิก">
                            <button type="button">ลบ</button>
                          </Popconfirm>
                          </React.Fragment>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          ) : (
            <EmptyState title="ยังไม่มีหลักสูตร" detail="เริ่มต้นด้วยการสร้างหลักสูตรแรกของคุณ" />
          )}
        </section>

        <div className="dashboard-columns">
          <section className="content-panel compact-panel">
            <div className="section-heading">
              <div><span className="eyebrow">MY LEARNING</span><h2>การเรียนของฉัน</h2></div>
            </div>
            {learning.length ? learning.map((item, index) => (
              <article className="list-course" key={item._id || index}>
                <span className="list-course__number">{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{item.title}</strong><p>{item.discription || 'ไม่มีรายละเอียด'}</p></div>
              </article>
            )) : <EmptyState title="ยังไม่มีคอร์สที่ลงเรียน" detail="หลักสูตรที่ได้รับมอบหมายจะแสดงที่นี่" />}
          </section>

          <section className="content-panel compact-panel">
            <div className="section-heading">
              <div><span className="eyebrow">TEACHING</span><h2>งานสอนของฉัน</h2></div>
            </div>
            {teaching.length ? teaching.map((item, index) => (
              <article className="list-course" key={item._id || index}>
                <span className="list-course__number list-course__number--violet">{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{item.title}</strong><p>{item.discription || 'ไม่มีรายละเอียด'}</p></div>
                <span className={`status-label ${item.status === 'true' ? 'is-live' : ''}`}>
                  {item.status === 'true' ? 'เปิดใช้งาน' : 'รอดำเนินการ'}
                </span>
              </article>
            )) : <EmptyState title="ยังไม่มีงานสอน" detail="หลักสูตรที่ได้รับมอบหมายจะแสดงที่นี่" />}
          </section>
        </div>
      </main>
    </div>
  );
};

Home.propTypes = {
  auth: PropTypes.object.isRequired,
  knowledge: PropTypes.object.isRequired,
  resever: PropTypes.object.isRequired,
  sender: PropTypes.object.isRequired,
  getKnowledge: PropTypes.func.isRequired,
  deleteKnowledge: PropTypes.func.isRequired,
  getResever: PropTypes.func.isRequired,
  getSender: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  knowledge: state.knowledge,
  resever: state.resever,
  sender: state.sender
});

export default connect(mapStateToProps, { getKnowledge, deleteKnowledge, getResever, getSender })(Home);
