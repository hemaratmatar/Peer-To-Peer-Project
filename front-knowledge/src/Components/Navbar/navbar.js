import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../redux/action/auth';
import './navbar.css';

const Navbar2 = ({ auth: { user }, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user && user.role === 'admin';
  const canManageCourses = user && ['admin', 'instructor'].includes(user.role);
  const initial = user && user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="app-navbar">
      <div className="app-navbar__inner">
        <Link className="app-brand" to="/home" aria-label="LearnSpace home">
          <span>
            <strong>LearnSpace</strong>
            <small>Learning Management</small>
          </span>
        </Link>

        <button
          className="app-navbar__toggle"
          type="button"
          aria-label="เปิดเมนู"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          เมนู
        </button>

        <nav className={`app-navbar__menu ${isOpen ? 'is-open' : ''}`}>
          <div className="app-navbar__links">
            <NavLink to="/home" activeClassName="is-active">ภาพรวม</NavLink>
            <NavLink to="/courses" activeClassName="is-active">หลักสูตรทั้งหมด</NavLink>
            {canManageCourses && <NavLink to="/addknow" activeClassName="is-active">เพิ่มหลักสูตร</NavLink>}
            {isAdmin && <NavLink to="/users" activeClassName="is-active">จัดการผู้ใช้</NavLink>}
          </div>

          <div className="app-navbar__account">
            <span className="app-navbar__avatar">{initial}</span>
            <span className="app-navbar__identity">
              <strong>{user ? user.name : 'ผู้ใช้งาน'}</strong>
              <small>{isAdmin ? 'ผู้ดูแลระบบ' : user && user.role === 'instructor' ? 'ผู้สอน' : 'ผู้เรียน'}</small>
            </span>
            <Link className="app-navbar__logout" to="/" onClick={logout}>ออกจากระบบ</Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

Navbar2.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({ auth: state.auth });

export default connect(mapStateToProps, { logout })(Navbar2);
