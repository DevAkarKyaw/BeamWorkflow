import { useState } from "react";
import { Form, Button, Alert, Card, Spinner, FloatingLabel } from "react-bootstrap";
import { useUser } from "../../contexts/UserContext";
import { createNewWorkgroup } from "../../apis/workgroup_apis";

export const CreateWorkgroupForm = () => {
    const { user } = useUser();

    // --- FIX 1: Consolidated state into a single object ---
    const initialFormData = { title: '', description: '' };
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [apiMessage, setApiMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- FIX 2: Created a generic handleChange function ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear validation error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = "Workgroup name is required.";
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ type: '', text: '' });

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await createNewWorkgroup(
                formData.title,
                formData.description ? formData.description : "No descriptions...",
                user.email
            );

            if (response.status === 200) {
                setFormData(initialFormData);
                setApiMessage({ type: "success", text: response.data?.message ?? "Created." });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "An unexpected error occurred.";
            setApiMessage({ type: 'danger', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="shadow-sm p-4 border-0">
            <h3 className="mb-4">Create New Workgroup</h3>

            {/* --- FIX 4: Added an Alert for API feedback --- */}
            {apiMessage.text && (
                <Alert variant={apiMessage.type}>{apiMessage.text}</Alert>
            )}

            <Form noValidate onSubmit={handleSubmit}>
                {/* --- FIX 5: Correctly linked form controls to state and validation --- */}
                <FloatingLabel controlId="title" label="Name of Workgroup" className="mb-3">
                    <Form.Control
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        isInvalid={!!errors.title}
                        maxLength={100}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.title}
                    </Form.Control.Feedback>
                </FloatingLabel>

                <FloatingLabel controlId="description" label="Description (Optional)" className="mb-3">
                    <Form.Control
                        name="description"
                        as="textarea"
                        style={{ height: '400px' }}
                        value={formData.description}
                        onChange={handleChange}
                    />
                </FloatingLabel>

                <Button variant="primary" type="submit" disabled={isSubmitting} className="w-100 py-2">
                    {isSubmitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Create Group"}
                </Button>
            </Form>
        </Card>
    );
};