import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Popconfirm } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Navbar2 from '../Navbar/navbar';
import { deleteKnowledge, getKnowledge } from '../redux/action/knowledge';
import '../Home/Home.css';
import './CourseCatalog.css';

const CourseCatalog = ({
  auth: { user },
  knowledge: { knowledge, loading },
  getKnowledge,
  deleteKnowledge
}) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => { getKnowledge(); }, [getKnowledge]);

  const courses = knowledge || [];
  const isAdmin = user && user.role === 'admin';
  const isInstructor = user && user.role === 'instructor';
  const canCreateCourse = isAdmin || isInstructor;
  const keyword = search.trim().toLowerCase();
  const visibleCourses = courses.filter(course => {
    const matchesText = !keyword || `${course.title} ${course.discription || ''}`.toLowerCase().includes(keyword);
    const matchesStatus = status === 'all' || course.status === status;
    return matchesText && matchesStatus;
  });

  return (
    <div className="learning-app">
      <Navbar2 />
      <main className="catalog-shell">
        <header className="catalog-heading">
          <div>
            <span className="eyebrow">COURSE CATALOG</span>
            <h1>หลักสูตรทั้งหมด</h1>
            <p>ค้นหาเนื้อหาที่ต้องการเรียน และดูหลักสูตรทั้งหมดที่เปิดให้คุณเข้าถึง</p>
          </div>
          {canCreateCourse && <Link className="primary-action" to="/addknow">สร้างหลักสูตรใหม่</Link>}
        </header>

        <section className="catalog-toolbar" aria-label="ค้นหาและกรองหลักสูตร">
          <label>
            <span>ค้นหาหลักสูตร</span>
            <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหาจากชื่อหรือรายละเอียด" />
          </label>
          <label>
            <span>สถานะ</span>
            <select value={status} onChange={event => setStatus(event.target.value)}>
              <option value="all">ทั้งหมด</option>
              <option value="true">เปิดใช้งาน</option>
              <option value="false">ฉบับร่าง</option>
            </select>
          </label>
          <div className="catalog-result"><strong>{visibleCourses.length}</strong><span>หลักสูตรที่พบ</span></div>
        </section>

        {loading ? (
          <div className="catalog-empty"><strong>กำลังโหลดหลักสูตร</strong></div>
        ) : visibleCourses.length ? (
          <section className="course-grid catalog-grid">
            {visibleCourses.map((course, index) => {
              const canManage = isAdmin || (isInstructor && course.sender && String(course.sender.uid) === String(user._id || user.id));
              return (
              <article className="course-card" key={course._id}>
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
          </section>
        ) : (
          <div className="catalog-empty"><strong>ไม่พบหลักสูตร</strong><p>ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ</p></div>
        )}
      </main>
    </div>
  );
};

CourseCatalog.propTypes = {
  auth: PropTypes.object.isRequired,
  knowledge: PropTypes.object.isRequired,
  getKnowledge: PropTypes.func.isRequired,
  deleteKnowledge: PropTypes.func.isRequired
};

const mapStateToProps = state => ({ auth: state.auth, knowledge: state.knowledge });

export default connect(mapStateToProps, { getKnowledge, deleteKnowledge })(CourseCatalog);
