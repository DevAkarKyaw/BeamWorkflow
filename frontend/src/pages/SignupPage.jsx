import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Row, Col, Spinner, FloatingLabel } from 'react-bootstrap';
import { useMessageDialog } from "../components/others/MessageDialog";
import { signUp } from "../apis/user_api";

export const SignupPage = () => {
    const navigate = useNavigate();
    const { showMessage } = useMessageDialog();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [gender, setGender] = useState("male");
    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = useCallback(() => {
        const newErrors = {};
        if (!formData.username) newErrors.username = "Username is required.";
        if (!formData.email) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid.";
        }
        if (!formData.password) {
            newErrors.password = "Password is required.";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long.";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }
        return newErrors;
    }, [formData]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors((prev) => ({ ...prev, [id]: null }));
        }
    };

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
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
            const response = await signUp(formData.email, formData.username, formData.password, gender, image);

            if (response.status === 200) {
                showMessage({ title: "Success", message: "Successfully signed up.", });
                navigate("/signin");
            }
        } catch (error) {
            setErrors({ api: "Failed to Signup!" });
            console.log(error.response)
            showMessage({ title: "Failed!", message: error.response.data.title });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Form onSubmit={handleSubmit} noValidate className='shadow-lg rounded p-4' style={{ width: '450px' }}>
                <h1 className='text-center fw-bold mb-4'>Sign Up</h1>

                {errors.api && <p className="text-center text-danger">{errors.api}</p>}

                <FloatingLabel controlId="username" label="Username" className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        isInvalid={!!errors.username}
                        disabled={loading}
                        required
                    />
                    <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                </FloatingLabel>

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
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
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
                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </FloatingLabel>

                <FloatingLabel controlId="confirmPassword" label="Confirm Password" className="mb-3">
                    <Form.Control
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        isInvalid={!!errors.confirmPassword}
                        disabled={loading}
                        required
                    />
                    <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                </FloatingLabel>

                <Form.Group className='mb-3' controlId='gender'>
                    <Form.Label>Gender</Form.Label>
                    <Form.Select value={gender} onChange={(e) => setGender(e.target.value)} disabled={loading}>
                        <option value='male'>Male</option>
                        <option value='female'>Female</option>
                        <option value='other'>Other</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className='mb-4' controlId='image'>
                    <Form.Label>Profile Image (Optional)</Form.Label>
                    <Form.Control type='file' accept='image/*' onChange={handleFileChange} disabled={loading} />
                </Form.Group>

                <Row className="g-2">
                    <Col>
                        <Button variant='secondary' className='w-100 shadow-sm' onClick={() => navigate('/signin')} disabled={loading}>
                            Cancel
                        </Button>
                    </Col>
                    <Col>
                        <Button type='submit' className='w-100 shadow-sm' disabled={loading}>
                            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Submit"}
                        </Button>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};