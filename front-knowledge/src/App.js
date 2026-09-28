import React, { Fragment } from "react";
import { Route } from "react-router-dom";
// import Navbar2 from "./components/layout/Navbar";
import Home from "./Components/Home/Home";
import Login from "./Components/Auth/Login";
import PrivateRoute from "./Components/routing/PrivateRoute";
import Addknow from "./Components/Knowledge/Addknow";
//Redux
import { Provider } from "react-redux";
import store from "./Components/redux/store";
import editknow from "./Components/Knowledge/editknow";
import UserManagement from "./Components/Admin/UserManagement";
import CourseCatalog from "./Components/Courses/CourseCatalog";
import CourseDetail from "./Components/Courses/CourseDetail";
import { loadUser } from "./Components/redux/action/auth";

store.dispatch(loadUser());
const App = () => (
  <Provider store={store}>
    <Fragment>
      {/* <Navbar2/> */}
      <Route exact path="/" component={Login} />
      <Route exact path="/login" component={Login} />
      <PrivateRoute path="/home" component={Home} />
      <PrivateRoute exact path="/courses" component={CourseCatalog} />
      <PrivateRoute path="/courses/:id" component={CourseDetail} />
      <PrivateRoute path="/addknow" component={Addknow} managerOnly />
      <PrivateRoute path="/edit-knowledge/:id" component={editknow} managerOnly />
      <PrivateRoute path="/users" component={UserManagement} adminOnly />
    </Fragment>
  </Provider>
);

export default App;
