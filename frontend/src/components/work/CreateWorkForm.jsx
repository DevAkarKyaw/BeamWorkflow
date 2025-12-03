import { useState, useCallback, useEffect } from "react";
import { Form, Button, Alert, Card, Row, Col, Spinner, FloatingLabel } from "react-bootstrap";

import { useUser } from "../../contexts/UserContext";
import { useMessageDialog } from "../others/MessageDialog";
import { getMyWorkgroupsAndJuniors, createNewWork } from "../../apis/work_apis";

const initialFormData = {
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "Medium",
    workgroupId: "",
    assignedTo: "",
};

export const CreateWorkForm = () => {
    const { user } = useUser();
    const { showMessage } = useMessageDialog();

    const [formData, setFormData] = useState({ ...initialFormData, assignedTo: user.email });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [workgroups, setWorkgroups] = useState([]);
    const [juniors, setJuniors] = useState([]);
    const [selectedWorkgroup, setSelectedWorkgroup] = useState(null);
    const [workgroupJuniors, setWorkgroupJuniors] = useState([]);

    // Requesting data of my workgroups and juniors of workgroups
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getMyWorkgroupsAndJuniors(user.email);

                if (response.status === 200) {
                    setWorkgroups(response.data.dto.workgroups);
                    setJuniors(response.data.dto.juniors);
                }
            } catch (error) {
                showMessage({ title: "Failed", message: error.response.data.message });
            }
        }

        fetchData();
    }, []);

    // Refilter every time `selectedWorkgroup` value change.
    useEffect(() => {
        const filteredJuniors = juniors.filter(junior => junior.relatedWorkgroupId === selectedWorkgroup);
        setWorkgroupJuniors(filteredJuniors);
    }, [selectedWorkgroup]);

    // ----------------------------------------------------

    const validate = useCallback(() => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required.";
        if (!formData.description.trim()) newErrors.description = "Description is required.";
        if (!formData.workgroupId) newErrors.workgroupId = "Please select a workgroup.";
        if (!formData.assignedTo) newErrors.assignedTo = "Please assign this work to someone.";
        return newErrors;
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "workgroupId") setSelectedWorkgroup(value);
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);
        setSuccess(null);

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await createNewWork(
                formData.title,
                formData.description,
                user.email,
                formData.assignedTo,
                formData.workgroupId,
                formData.priority,
                formData.dueDate
            );

            if (response.status === 200 || response.status === 201) {
                setSuccess(response.data.message || "Work created successfully!");
                setFormData({ ...initialFormData, assignedTo: user.email });
                setErrors({});
            }
        } catch (err) {
            setApiError(err?.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="shadow-sm p-4 border-0">
            <h3 className="mb-4">Create New Work</h3>

            {success && (
                <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                    {success}
                </Alert>
            )}
            {apiError && (
                <Alert variant="danger" onClose={() => setApiError(null)} dismissible>
                    {apiError}
                </Alert>
            )}

            <Form noValidate onSubmit={handleSubmit}>
                {/* Title */}
                <FloatingLabel controlId="title" label="Title" className="mb-3">
                    <Form.Control
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        isInvalid={!!errors.title}
                        maxLength={50}
                        required
                    />
                    <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                </FloatingLabel>

                {/* Description */}
                <FloatingLabel controlId="description" label="Description" className="mb-3">
                    <Form.Control
                        name="description"
                        as="textarea"
                        style={{ height: "240px" }}
                        value={formData.description}
                        onChange={handleChange}
                        isInvalid={!!errors.description}
                        maxLength={1000}
                        required
                    />
                    <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                </FloatingLabel>

                <Row className="mb-3 g-2">
                    <Col md>
                        <Form.Group>
                            <Form.Label htmlFor="dueDate">Due Date</Form.Label>
                            <Form.Control
                                id="dueDate"
                                name="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>

                    <Col md>
                        <Form.Group>
                            <Form.Label htmlFor="priority">Priority</Form.Label>
                            <Form.Select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                {/* Workgroup */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="workgroupId">Workgroup</Form.Label>
                    <Form.Select
                        id="workgroupId"
                        name="workgroupId"
                        value={formData.workgroupId}
                        onChange={handleChange}
                        isInvalid={!!errors.workgroupId}
                        required
                    >
                        <option value="">Select a workgroup...</option>
                        {Object.values(workgroups).map((wg) => (
                            <option key={wg.workgroupId} value={wg.workgroupId}>
                                {wg.workgroupName}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.workgroupId}</Form.Control.Feedback>
                </Form.Group>

                {/* Assign To */}
                <Form.Group className="mb-4">
                    <Form.Label htmlFor="assignedTo">Assign To</Form.Label>
                    <Form.Select
                        id="assignedTo"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        isInvalid={!!errors.assignedTo}
                        required
                    >
                        {
                            (selectedWorkgroup)
                            &&
                            <>
                                <option key={user.email} value={user.email}>Yourself ({user.username})</option>
                                {
                                    workgroupJuniors.map((junior) => (
                                        (junior.juniorEmail !== user.email)
                                        &&
                                        <option key={junior.juniorEmail} value={junior.juniorEmail}>
                                            {junior.username}
                                        </option>
                                    ))
                                }
                            </>
                        }
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.assignedTo}</Form.Control.Feedback>
                </Form.Group>

                <Button type="submit" variant="primary" disabled={isSubmitting} className="w-100 py-2">
                    {isSubmitting ? (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    ) : (
                        "Create Work"
                    )}
                </Button>
            </Form>
        </Card>
    );
};
