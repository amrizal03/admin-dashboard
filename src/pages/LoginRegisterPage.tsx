import React, { useEffect, useState } from 'react'
import { AppDispatch, RootState } from '../redux/store'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Checkbox, Form, Input, Spin } from 'antd'
import '../assets/css/Auth.css'
import { loginUser, registerUser } from '../redux/slices/authSlice'


const LoginRegisterPage: React.FC<{api: any}> = ({ api }) => {
    const { loading, error } = useSelector((state: RootState) => state.auth)
    const dispatch: AppDispatch = useDispatch()
    const navigate = useNavigate()
    const [isLogin, setIsLogin] = useState(true)

    // make presisted user login
    useEffect(() => {
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    const openNotification = (type: 'success' | 'error', message: string, description: string) => {
        api[type]({
            message: message,
            description: description,
            duration: 3,
        })
    }

    let commonValidation = [
        { required: true, message: "Please input your username!" },
        { min: 2, message: "Username must be at least 2 characters" },
        { pattern: /^[a-zA-Z0-9_\s]+$/, message: 'Username can only include letters, numbers, space and underscores' }
    ]

    let passwordValidation = [
        { required: true, message: "Please input your password!" },
        { min: 6, message: "Password must be at least 6 characters" }
    ]

    const onFinish = async (values: any) => {
        try {
            let loginResponse
            let registerResponse
            if (isLogin === true) {
                loginResponse = await dispatch(loginUser(values))
                if (loginUser.fulfilled.match(loginResponse)) {
                    openNotification(
                        'success',
                        'Login Successful',
                        'You have been successfully logged in.'
                    )
                    navigate('/admin/dashboard')
                } else {
                    openNotification(
                        'error',
                        'Login Failed',
                        loginResponse.payload as string
                    )
                }
            } else {
                registerResponse = await dispatch(registerUser(values))
                if (registerUser.fulfilled.match(registerResponse)) {
                    openNotification(
                        'success',
                        'Register successful',
                        'You have been successfully registered.'
                    )

                    switchView()
                } else if (registerResponse.type == "auth/registerUser/rejected") {
                    openNotification(
                        'error',
                        'Credential was exists. Please signin!',
                        'You already registered.'
                    )

                    switchView()
                }
            }
        } catch (error) {
            console.log('Error: ', error)
        }
    }

    const onFinishFailed = (errorInfo: any) => {
        openNotification(
            'error',
            'Input validation failed, please check your input',
            'Please check the form fields and try again.'
        )
        console.error(`Error: ${errorInfo}`)
    }

    const switchView = () => {
        setIsLogin(!isLogin)
    }

    return (
        <div className="container">
            <div style={{ 
                flex: 1, 
                paddingRight: '20px' 
            }}>
                <h2>Welcome back</h2>
                <p>Login to the Dashboard</p>
                <Form
                    name="basic"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                            name="username"
                            rules={commonValidation}
                        >
                            <Input placeholder='Input your username' />
                        </Form.Item>

                        { !isLogin && (
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: "Please input your email!" },
                                    { type: 'email', message: "Please enter a valid email!" }
                                ]}
                            >
                                <Input placeholder='Input your email' />
                            </Form.Item>
                        )}

                        <Form.Item
                            name="password"
                            rules={passwordValidation}
                        >
                            <Input.Password placeholder='Input your password' />
                        </Form.Item>

                        { !isLogin && (
                            <Form.Item
                                name="confirmPassword"
                                rules={[
                                    { required: true, message: "Please confirm your password!" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve()
                                            }
                                            return Promise.reject(new Error('The two passwords do not match!'))
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder='Confirm your password' />
                            </Form.Item>
                        )}

                        <Form.Item
                            name="remember"
                            valuePropName='checked'
                        >
                            <Checkbox>Remember me!</Checkbox>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                            >
                                {isLogin ? 'Login' : 'Register'}
                            </Button>
                        </Form.Item>

                        <div className="switch-link">
                            <Link to="#" onClick={switchView}>
                                {isLogin ? 'Already have an account?' : 'Back to Login'}
                            </Link>
                        </div>
                </Form>

                {loading && <Spin />}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
            
            <div 
                className="illustration"
            >
                <img 
                    src="../../src/assets/images/cart-ecommerce.jpeg"
                    alt="E-commerce Illustration"
                    style={{ 
                        width: '100%', 
                        height: 'auto',
                    }} 
                />
            </div>
        </div>
    )
}

export default LoginRegisterPage