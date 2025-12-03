import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Spinner, FloatingLabel } from 'react-bootstrap';
import { useMessageDialog } from '../components/others/MessageDialog';
import { useUser } from '../contexts/UserContext';
import { signIn } from '../apis/user_api';

export const SigninPage = () => {
    const navigate = useNavigate();
    const { createUser, clearUser } = useUser();
    const { showMessage } = useMessageDialog();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);


    const validate = useCallback(() => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid.';
        }
        if (!formData.password) newErrors.password = 'Password is required.';
        return newErrors;
    }, [formData]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors((prev) => ({ ...prev, [id]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await signIn(formData.email, formData.password);

            if (response.status === 200) {
                const userData = {
                    ...response.data.dto,
                    email: formData.email,
                    password: formData.password, // Storing password is not recommended
                };

                clearUser();
                createUser(rememberMe, userData);

                showMessage({ title: "Success", message: "Successfully signed in." });

                navigate("/main");
            }
        } catch (error) {
            setErrors({ api: error.response.data.message });
            showMessage({ title: "Failed", message: error.response.data.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center vh-100 bg-light'>
            <Form onSubmit={handleSubmit} noValidate className='shadow-lg rounded p-4' style={{ width: '450px' }}>
                <h1 className='text-center fw-bold mb-4'>Sign In</h1>

                {errors.api && <p className="text-center text-danger">{errors.api}</p>}

                <FloatingLabel controlId="email" label="Email address" className="mb-3">
                    <Form.Control
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                        disabled={loading}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.email}
                    </Form.Control.Feedback>
                </FloatingLabel>

                <FloatingLabel controlId="password" label="Password" className="mb-3">
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        isInvalid={!!errors.password}
                        disabled={loading}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.password}
                    </Form.Control.Feedback>
                </FloatingLabel>

                <Form.Group className="mb-4" controlId="rememberMeCheck">
                    <Form.Check
                        type="checkbox"
                        label="Remember Me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                    />
                </Form.Group>

                <Row>
                    <Col>
                        <Button type='submit' className='w-100 shadow-sm' disabled={loading}>
                            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Sign In"}
                        </Button>
                    </Col>
                </Row>
                <Row className='mt-3'>
                    <Col className='text-center'>
                        <Button variant='secondary' className='w-100 shadow-sm' onClick={() => navigate('/signup')} disabled={loading}>
                            Don't have an account? Sign Up
                        </Button>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};