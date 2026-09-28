import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Popconfirm } from 'antd';
import PropTypes from 'prop-types';
import Navbar2 from '../Navbar/navbar';
import { createUser, deleteUser, getUser, updateUser } from '../redux/action/user';
import './UserManagement.css';

const emptyForm = { name: '', username: '', uid: '', role: 'user', password: '' };

const UserManagement = ({
  authUser,
  userState: { users, credentials, loading },
  getUser,
  createUser,
  deleteUser,
  updateUser
}) => {
  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { getUser(); }, [getUser]);

  const onChange = event => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const onSubmit = async event => {
    event.preventDefault();
    setFormError('');
    try {
      if (editingId) await updateUser(editingId, form);
      else await createUser(form);
      setForm(emptyForm);
      setIsFormOpen(false);
      setEditingId(null);
    } catch (err) {
      const data = err.response && err.response.data;
      setFormError(data && data.errors ? data.errors[0].msg : data && data.msg ? data.msg : 'ไม่สามารถบันทึกข้อมูลผู้ใช้ได้');
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = user => {
    setEditingId(user._id || user.id);
    setForm({
      name: user.name,
      username: user.username,
      uid: user.uid,
      role: user.role || 'user',
      password: ''
    });
    setFormError('');
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const roleLabel = role => ({ admin: 'ผู้ดูแลระบบ', instructor: 'ผู้สอน', user: 'ผู้เรียน' }[role] || 'ผู้เรียน');
  const currentUserId = authUser && (authUser._id || authUser.id);

  return (
    <div className="learning-app">
      <Navbar2 />
      <main className="users-shell">
        <header className="users-heading">
          <div>
            <span className="eyebrow">ADMINISTRATION</span>
            <h1>จัดการผู้ใช้งาน</h1>
            <p>เพิ่มผู้เรียนและผู้สอน กำหนดสิทธิ์ และดูบัญชีทั้งหมดในระบบ</p>
          </div>
          <button className="primary-action users-add-button" type="button" onClick={openCreateForm}>
            เพิ่มผู้ใช้งาน
          </button>
        </header>

        {credentials && (
          <section className="credential-banner" role="status">
            <div>
              <div><strong>สร้างบัญชีสำเร็จ</strong><p>บันทึกข้อมูลนี้ก่อนออกจากหน้านี้ รหัสผ่านจะแสดงเพียงครั้งเดียว</p></div>
            </div>
            <dl>
              <div><dt>Username</dt><dd>{credentials.username}</dd></div>
              <div><dt>Password</dt><dd>{credentials.password}</dd></div>
            </dl>
          </section>
        )}

        {isFormOpen && (
          <form className="user-form" onSubmit={onSubmit}>
            <div className="user-form__heading">
              <h2>{editingId ? 'แก้ไขบัญชีผู้ใช้' : 'ข้อมูลบัญชีใหม่'}</h2>
              <p>{editingId ? 'แก้ไขข้อมูลและเว้นรหัสผ่านว่างไว้หากไม่ต้องการเปลี่ยน' : 'กำหนดข้อมูลเข้าสู่ระบบและบทบาทของผู้ใช้'}</p>
            </div>
            {formError && <div className="form-error">{formError}</div>}
            <div className="user-form__grid">
              <label className="field"><span>ชื่อ–นามสกุล</span><input name="name" value={form.name} onChange={onChange} required /></label>
              <label className="field"><span>รหัสผู้เรียน/พนักงาน</span><input name="uid" value={form.uid} onChange={onChange} required /></label>
              <label className="field"><span>Username</span><input name="username" value={form.username} onChange={onChange} autoComplete="off" required /></label>
              <label className="field">
                <span>Password (ไม่บังคับ)</span>
                <input type="password" name="password" value={form.password} onChange={onChange} minLength="6" autoComplete="new-password" placeholder={editingId ? 'เว้นว่างหากไม่เปลี่ยนรหัสผ่าน' : 'เว้นว่างเพื่อให้ระบบสร้างรหัสผ่าน'} />
                <small>{editingId ? 'กรอกเฉพาะเมื่อต้องการตั้งรหัสผ่านใหม่' : 'หากเว้นว่าง ระบบจะสร้างรหัสที่ปลอดภัยและแสดงหลังสร้างบัญชี'}</small>
              </label>
              <label className="field"><span>บทบาท</span>
                <select name="role" value={form.role} onChange={onChange}>
                  <option value="user">ผู้เรียน</option>
                  <option value="instructor">ผู้สอน</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
              </label>
            </div>
            <div className="user-form__actions">
              <button className="secondary-action" type="button" onClick={() => { setIsFormOpen(false); setEditingId(null); }}>ยกเลิก</button>
              <button className="primary-action form-submit" type="submit">{editingId ? 'บันทึกการแก้ไข' : 'สร้างบัญชี'}</button>
            </div>
          </form>
        )}

        <section className="users-panel">
          <div className="users-panel__heading">
            <div><h2>บัญชีทั้งหมด</h2><p>{users.length} บัญชีในระบบ</p></div>
            <span className="users-panel__status">{loading ? 'กำลังโหลด...' : 'อัปเดตแล้ว'}</span>
          </div>

          <div className="users-table-wrap">
            <table className="users-table">
              <thead><tr><th>ผู้ใช้งาน</th><th>รหัส</th><th>บทบาท</th><th>Username</th><th aria-label="actions" /></tr></thead>
              <tbody>
                {users.map(user => {
                  const id = user._id || user.id;
                  return (
                    <tr key={id}>
                      <td><div className="user-cell"><span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span><strong>{user.name}</strong></div></td>
                      <td>{user.uid}</td>
                      <td><span className={`role-badge role-badge--${user.role || 'user'}`}>{roleLabel(user.role)}</span></td>
                      <td><code>{user.username}</code></td>
                      <td className="users-table__action">
                        <button className="edit-user" type="button" onClick={() => openEditForm(user)}>แก้ไข</button>
                        {id !== currentUserId && (
                          <Popconfirm icon={null} title="ลบบัญชีนี้หรือไม่?" onConfirm={() => deleteUser(id)} okText="ลบ" cancelText="ยกเลิก">
                            <button className="delete-user" type="button">ลบ</button>
                          </Popconfirm>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

UserManagement.propTypes = {
  authUser: PropTypes.object,
  userState: PropTypes.object.isRequired,
  getUser: PropTypes.func.isRequired,
  createUser: PropTypes.func.isRequired,
  deleteUser: PropTypes.func.isRequired,
  updateUser: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  authUser: state.auth.user,
  userState: state.users
});

export default connect(mapStateToProps, { getUser, createUser, deleteUser, updateUser })(UserManagement);
