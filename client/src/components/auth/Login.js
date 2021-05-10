import React, { Fragment, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { login } from '../../actions/auth';
import { connect } from 'react-redux';

const Login = ({ login, isAuthenticated }) => {
  const [formData, SetFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const onChange = async (e) =>
    SetFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    login(email, password);
  };

  if (isAuthenticated) {
    return <Redirect to='/dashboard' />;
  }

  return (
    <Fragment>
      <h1 className='large text-primary'>Sign In</h1>
      <p className='lead'>
        <i className='fas fa-user'></i> Sign Into Your Account
      </p>
      <form className='form' onSubmit={(e) => onSubmit(e)}>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            name='email'
            value={email}
            onChange={(e) => onChange(e)}
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Password'
            name='password'
            minLength='6'
            value={password}
            onChange={(e) => onChange(e)}
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Login' />
      </form>
      <p className='my-1'>
        Don't have an account?
        <Link to='/register'>Sign Up</Link>
      </p>
    </Fragment>
  );
};

/*
to access this array we use mapStateToProps
auth[
token(pin):"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjA0ZjVkNzVhY2MxYWMyMGZjNjE2OGVkIn0sIml
hdCI6MTYyMDYzMDUwNSwiZXhwIjoxNjIwOTkwNTA1fQ.B4okXhd6cuEX6NVp19GKhcwt7hLo1azhmPF3HDCVr7E"
isAuthenticated(pin):true
loading(pin):false
]
*/

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { login })(Login);
