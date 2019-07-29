import React, {Component} from 'react';
import {connect} from "react-redux";
import {Form, Button, Alert} from 'react-bootstrap';
import { loginUser } from '../store/actions/userAction';
import { NavLink } from "react-router-dom";
import FormElement from '../components/UI/FormElement';
import MobileInput from "../components/UI/MobileInput";

class Login extends Component {

    state = {
        phone: '',
        password: ''
    };

    updateInput = (e) => {
        e.preventDefault();
        this.setState({ [e.target.name]: e.target.value });
    };
    updatePhoneInput = phone => {
        this.setState({phone});
    };

    onSubmitHandler = e => {
        e.preventDefault();
        this.props.loginUser({
            phoneNumber: '+7'+this.state.phone,
            password: this.state.password,
        });
    };

    render() {

        return (
            <div className="container-login">
                <div className="logo text-center">
                    <div className="border-bottom border-secondary" />
                </div>
                <h1 className="text-center title">Вход в систему</h1>
                {
                    this.props.error ? <Alert variant={'danger'}>Введён неверный логин или пароль</Alert> : null
                }
                <Form onSubmit={this.onSubmitHandler} >
                    <MobileInput
                        value={this.state.phone}
                        onChange={this.updatePhoneInput}
                    />
                    <FormElement
                        onChange={this.updateInput}
                        type="password"
                        placeholder="Пароль"
                        name="password"
                        value={this.state.password}
                    />
                    <div className="text-right">
                        <NavLink to="">Забыли пароль?</NavLink>
                    </div>
                    <div className="mt-5 mb-2">
                        <Button type="submit" variant="primary" size="lg" block>Войти</Button>
                    </div>
                </Form>
                <div>
                    <span>Ещё нет аккаунта? <NavLink to="/register">Создайте </NavLink>прямо сейчас</span>
                </div>
            </div>
        )
    }    
}


const mapStateToProps = state => {
    return {
        error: state.users.loginError,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        loginUser: (userData) => dispatch(loginUser(userData))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);