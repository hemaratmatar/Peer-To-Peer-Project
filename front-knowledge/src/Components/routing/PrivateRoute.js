import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const PrivateRoute = ({
  component: Component,
  auth: { isAuthenticated, loading },
  authUser,
  adminOnly = false,
  managerOnly = false,
  ...rest
}) => (
  <Route
    {...rest}
    render={props =>
      loading ? null : !isAuthenticated ? (
        <Redirect to='/' />
      ) : adminOnly && (!authUser || authUser.role !== 'admin') ? (
        <Redirect to='/home' />
      ) : managerOnly && (!authUser || !['admin', 'instructor'].includes(authUser.role)) ? (
        <Redirect to='/home' />
      ) : (
        <Component {...props} />
      )
    }
  />
);

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  authUser: state.auth.user
});

export default connect(mapStateToProps)(PrivateRoute);
