// src/components/workgroup/MembersModal.jsx

import { useEffect, useState } from "react";
import { Modal, Form, Spinner, Badge, Image } from "react-bootstrap";
import { PersonPlus, Check2Circle, XCircle, Trash } from "react-bootstrap-icons";

// Contexts & APIs
import { useUser } from "../../contexts/UserContext";
import { useMessageDialog } from "../others/MessageDialog";
import { addMemberToWorkgroup, getWorkgroupMembers, removeWorkgroupMember } from "../../apis/workgroup_apis";
import { URL_IMAGE } from "../../apis/urls";

export const MembersModal = ({ show, onHide, workgroupId, workgroupName, role, memberList, setMemberList }) => {
    const { user } = useUser();
    const { showMessage } = useMessageDialog();

    // State specific to this modal's functionality
    const [updating, setUpdating] = useState(false);
    const [memberBeingRemoved, setMemberBeingRemoved] = useState(null); // Changed from boolean to string/null
    const [addingMember, setAddingMember] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newMemberRole, setNewMemberRole] = useState("member");

    // Requesting the workgroup members to display
    useEffect(() => {
        const fetchData = async () => {
            // Only fetch if the modal is shown and workgroupId is available
            if (show && workgroupId) {
                try {
                    const response = await getWorkgroupMembers(workgroupId);
                    if (response.status !== 200) return;
                    setMemberList(response.data.dto);
                } catch (error) {
                    showMessage({ title: "Failed", message: error.response.data.message });
                }
            }
        };

        fetchData();
    }, [show, workgroupId]);

    // ----------------------------------------------------

    const handleAddMember = async () => {
        if (!workgroupId || !newMemberEmail) return;

        try {
            setUpdating(true);
            const response = await addMemberToWorkgroup(workgroupId, newMemberEmail, user.email, newMemberRole);
            if (response.status !== 200) return;

            // Adding new member data to the list
            setMemberList(prev => [...prev, response.data.dto]);

            showMessage({ title: "Success", message: `Member (${newMemberEmail}) added.` });
            setNewMemberEmail("");
            setNewMemberRole("member");
        } catch (error) {
            showMessage({ title: "Failed", message: error.response.data.message });
        } finally {
            setUpdating(false);
            handleCancelAddMember();
        }
    };

    const handleRemoveMember = async (emailToRemove) => {
        // Prevent multiple simultaneous removal attempts
        if (!workgroupId || !emailToRemove || memberBeingRemoved) return;
        setMemberBeingRemoved(emailToRemove); // Set the specific member being removed

        try {
            const response = await removeWorkgroupMember(workgroupId, user.email, emailToRemove);
            if (response.status !== 200) return;

            // Removing member data from the list
            setMemberList(prev => prev.filter(p => p.memberEmail !== emailToRemove));

            showMessage({ title: "Success", message: `${emailToRemove} removed from workgroup.` });
        } catch (error) {
            showMessage({ title: "Failed", message: error.response.data.message });
        } finally {
            setMemberBeingRemoved(null); // Reset after operation
        }
    };

    const handleCancelAddMember = () => {
        setNewMemberEmail("");
        setNewMemberRole("member");
        setAddingMember(false);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Members — {workgroupName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    memberList.length === 0 ? (
                        <p className="text-center text-muted mt-4">No members to show.</p>
                    ) : (
                        memberList.map((member) => (
                            <div key={member.memberEmail} className="d-flex justify-content-between align-items-center mx-2 my-1 shadow-lg p-2">
                                <div>
                                    <Image
                                        src={`${URL_IMAGE}?imageId=${member.userImage}`}
                                        roundedCircle height={45} width={45}
                                        className="me-3" style={{ objectFit: "cover" }} alt="User"
                                    />
                                    <span className="me-3">
                                        {member.username}
                                        {member.memberEmail === user.email && " (You)"}
                                    </span>
                                    <Badge bg={member.role === 'member' ? "secondary" : "primary"}>{member.role}</Badge>
                                </div>
                                {
                                    (
                                        (role === "admin" || role === "assist_admin") &&
                                        (member.role !== "admin") &&
                                        (member.memberEmail !== user.email)
                                    ) && (
                                        <Trash
                                            title="remove member"
                                            className={memberBeingRemoved === member.memberEmail ? "text-muted" : "text-danger"}
                                            size={22}
                                            onClick={() => handleRemoveMember(member.memberEmail)}
                                            style={{ cursor: memberBeingRemoved ? "wait" : "pointer" }}
                                        />
                                    )
                                }
                            </div>
                        ))
                    )
                }
            </Modal.Body>
            {
                (role === "admin" || role === "assist_admin") && (
                    <Modal.Footer className="d-flex justify-content-between align-items-center">
                        {addingMember ? (
                            <div className="d-flex align-items-center w-100">
                                <div className="flex-grow-1">
                                    <Form.Control
                                        name="memberEmail"
                                        type="email" placeholder="Enter member email" value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value.trim())}
                                        disabled={updating} className="mb-2" required
                                    />
                                    <Form.Select
                                        name="memberRole"
                                        value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} required
                                    >
                                        <option value="member">Member</option>
                                        <option value="assist_admin">Assistant Admin</option>
                                    </Form.Select>
                                </div>
                                <div className="d-flex flex-column align-items-center ms-2">
                                    <Check2Circle size={28} className="text-success mb-2" title={updating ? "Adding..." : "Add"}
                                        onClick={!updating ? handleAddMember : undefined} style={{ cursor: updating ? "wait" : "pointer" }}
                                    />
                                    <XCircle size={24} className="text-muted" title="Cancel"
                                        onClick={!updating ? handleCancelAddMember : undefined} style={{ cursor: updating ? "wait" : "pointer" }}
                                    />
                                </div>
                                {updating && <Spinner animation="border" size="sm" className="ms-2" />}
                            </div>
                        ) : (
                            <PersonPlus size={30} title="Add member" onClick={() => setAddingMember(true)} style={{ cursor: "pointer" }} />
                        )}
                    </Modal.Footer>
                )
            }
        </Modal>
    );
};