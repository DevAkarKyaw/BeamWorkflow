// src/components/workgroup/RelationsModal.jsx

import { useEffect, useState } from "react";
import { Modal, Form, Spinner, Badge, Image } from "react-bootstrap";
import { Diagram3, Check2Circle, XCircle, Trash } from "react-bootstrap-icons";

// Contexts & APIs
import { useUser } from "../../contexts/UserContext";
import { useMessageDialog } from "../others/MessageDialog";
import { addUsersRelation, getUsersRelations, getUsersRelation, removeUsersRelation } from "../../apis/workgroup_apis";
import { URL_IMAGE } from "../../apis/urls";


export const RelationsModal = ({ show, onHide, workgroupId, workgroupName, role, memberList }) => {
    const { user } = useUser();
    const { showMessage } = useMessageDialog();

    const [relatedUsers, setRelatedUsers] = useState([]);

    // State specific to this modal's functionality
    const [updating, setUpdating] = useState(false);
    const [addingRelation, setAddingRelation] = useState(false);
    const [newSeniorEmail, setNewSeniorEmail] = useState("");
    const [newJuniorEmail, setNewJuniorEmail] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getUsersRelations(workgroupId, user.email);
                if (response.status === 200) setRelatedUsers(response.data.dto);
            } catch (error) {
                console.log(error.response)
                showMessage({ title: "Failed", message: error.response.data.message });
            }
        }

        fetchData();
    }, [memberList]);

    // ------------------------------------------------

    const handleAddRelation = async () => {
        if (!workgroupId || !newSeniorEmail || !newJuniorEmail) return;
        setUpdating(true);

        try {
            const response = await addUsersRelation(workgroupId, user.email, newSeniorEmail, newJuniorEmail);
            if (response.status === 200) {
                const response = await getUsersRelation(newSeniorEmail, newJuniorEmail);
                if (response.status === 200) setRelatedUsers(prev => [...prev, response.data.dto]);
            }
        } catch (error) {
            showMessage({ title: "Failed", message: error.response.data.message });
        } finally {
            setUpdating(false);
            handleCancelAddRelation();
        }
    };

    const handleRemove = async (relationId) => {
        if (!relationId || !workgroupId) return;
        setUpdating(true);

        try {
            const response = await removeUsersRelation(relationId, workgroupId, user.email);
            if (response.status === 200) {
                setRelatedUsers(relatedUsers.filter(ru => ru.relationId !== relationId));
            }
        } catch (error) {
            showMessage({ title: "Failed", message: error.response.data.message })
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelAddRelation = () => {
        setNewSeniorEmail("");
        setNewJuniorEmail("");
        setAddingRelation(false);
    };

    const UserDisplay = ({ userInfo, role }) => {
        const isSenior = role.toLowerCase() === 'senior';

        return (
            <div className="d-flex align-items-center">
                <Image
                    roundedCircle
                    src={`${URL_IMAGE}?imageId=${userInfo.image}`}
                    height={45} width={45}
                    className="me-3" style={{ objectFit: 'cover' }}
                    alt={userInfo.name}
                />
                <div>
                    <Badge bg={isSenior ? 'primary' : 'secondary'}>
                        {role}
                    </Badge>
                    <div className="fw-bold mt-1">
                        {userInfo.name}
                        {userInfo.email === user.email && <Badge className="bg-danger ms-2" size="sm">you</Badge>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Relations — {workgroupName}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ "maxHeight": "60vh", "overflowY": "scroll" }}>
                {relatedUsers.length === 0 ? (
                    <p className="text-center text-muted mt-4">No relations to show.</p>
                ) : (
                    relatedUsers.map((relation) => (
                        <div key={relation.relationId} className="position-relative py-3 px-2 border-bottom">

                            {/* The user displays are now left-aligned */}
                            <div>
                                {/* Senior User */}
                                <UserDisplay
                                    userInfo={{ name: relation.seniorName, image: relation.seniorImage, email: relation.seniorEmail }}
                                    role="Senior"
                                />

                                {/* Vertical Connecting Line */}
                                <div
                                    className="ms-3"
                                    style={{
                                        height: '20px',
                                        borderLeft: '2px solid #e0e0e0', // A light grey vertical line
                                        marginLeft: '21px' // Aligns the line with the center of the 45px avatar
                                    }}
                                />

                                {/* Junior User */}
                                <UserDisplay
                                    userInfo={{ name: relation.juniorName, image: relation.juniorImage, email: relation.juniorEmail }}
                                    role="Junior"
                                />
                            </div>

                            {/* Remove Relation Button (positioned in the top-right corner) */}
                            {
                                (role === "admin" || role === "assist_admin")
                                &&
                                <button
                                    onClick={() => handleRemove(relation.relationId)} // Add your delete handler
                                    className="btn btn-icon position-absolute top-0 end-0 mt-2 me-2"
                                    title="Remove relation"
                                >
                                    <Trash size={20} className="text-danger" />
                                </button>
                            }
                        </div>
                    ))
                )}
            </Modal.Body>
            {
                (role === "admin" || role === "assist_admin")
                &&
                <Modal.Footer className="d-flex justify-content-between align-items-center">
                    {addingRelation ? (
                        <div className="d-flex align-items-start w-100 gap-2">
                            <div className="flex-grow-1">
                                <Form.Control
                                    name="seniorEmail"
                                    type="email" placeholder="Senior user email" value={newSeniorEmail}
                                    onChange={(e) => setNewSeniorEmail(e.target.value.trim())}
                                    disabled={updating} className="mb-2" required
                                />
                                <Form.Control
                                    name="juniorEmail"
                                    type="email" placeholder="Junior user email" value={newJuniorEmail}
                                    onChange={(e) => setNewJuniorEmail(e.target.value.trim())}
                                    disabled={updating} required
                                />
                            </div>
                            <div className="d-flex flex-column align-items-center mt-1">
                                <Check2Circle size={28} className="text-success mb-2" title={updating ? "Adding..." : "Add Relation"}
                                    onClick={!updating ? handleAddRelation : undefined} style={{ cursor: updating ? "wait" : "pointer" }}
                                />
                                <XCircle size={24} className="text-muted" title="Cancel"
                                    onClick={!updating ? handleCancelAddRelation : undefined} style={{ cursor: updating ? "not-allowed" : "pointer" }}
                                />
                            </div>
                            {updating && <Spinner animation="border" size="sm" className="ms-2 mt-1" />}
                        </div>
                    ) : (
                        <Diagram3 size={30} title="Add relation" onClick={() => setAddingRelation(true)} style={{ cursor: "pointer" }} />
                    )}
                </Modal.Footer>
            }
        </Modal>
    );
};