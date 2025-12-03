// src/components/workgroup/WorkgroupDetailView.jsx

import { Card, Form, Spinner, Badge } from "react-bootstrap";
import { ArrowLeftSquare, PencilSquare, People, ArrowLeftRight, Trash, Check2Circle, XCircle } from "react-bootstrap-icons";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useMainPage } from "../../contexts/MainPageContext";
import { useMessageDialog } from "../others/MessageDialog";
import { getRelativeTime } from "../../contexts/GlobalFunctions";
import { getWorkgroupDetails, updateWorkgroup, deleteWorkgroup } from "../../apis/workgroup_apis";

// Import the new components from the same folder
import { MembersModal } from "./MembersModal";
import { RelationsModal } from "./RelationsModal";


export const WorkgroupDetailView = () => {
    const { user } = useUser();
    const { previousWorkSpace, updateWorkSpace, detailId } = useMainPage();
    const { showMessage } = useMessageDialog();

    const [updating, setUpdating] = useState(false);
    const [editingField, setEditingField] = useState(null);

    // State to control modal visibility
    const [showMembers, setShowMembers] = useState(false);
    const [showRelations, setShowRelations] = useState(false);

    const isEditing = useMemo(() => editingField !== null, [editingField]);
    const actionsDisabled = isEditing || updating;

    const [workgroupDetails, setWorkgroupDetails] = useState(null);
    const [localTitle, setLocalTitle] = useState("");
    const [localDescription, setLocalDescription] = useState("");

    // Member Modal States
    const [memberList, setMemberList] = useState([]);

    // Requesting detailed data of workgroup to display
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getWorkgroupDetails(detailId);

                if (response.status === 200) setWorkgroupDetails(response.data.dto);
                setLocalTitle(response.data.dto.workgroupName);
                setLocalDescription(response.data.dto.description);
            } catch (error) {
                showMessage({ title: "Failed!", message: error.response.data.message })
            }
        }

        fetchData();
    }, []);

    // ----------------------------------------------------

    const onClickBack = () => {
        if (actionsDisabled) return;
        updateWorkSpace(previousWorkSpace);
    };

    const onClickDelete = async () => {
        if (actionsDisabled || !detailId) return;
        if (!confirm("Are you sure you want to delete this workgroup?")) return;

        try {
            const password = prompt("Please enter your password to confirm deletion:");
            if (!password) return;

            const response = await deleteWorkgroup(detailId, user.email, password);

            if (response.status === 200) {
                showMessage({ title: "Success", message: "Workgroup deleted successfully!" });

                updateWorkSpace(previousWorkSpace);
            }
        } catch (error) {
            showMessage({ title: "Failed", message: error.response?.data?.message || "An error occurred during deletion." });
        }
    };

    const beginEdit = (field) => {
        if (isEditing && editingField !== field) return; // only one at a time
        setEditingField(field);
    };

    const cancelEdit = () => {
        if (!detailId || !workgroupDetails) return;
        setLocalTitle(workgroupDetails.workgroupName ?? "");
        setLocalDescription(workgroupDetails.description ?? "");
        setEditingField(null);
    };

    const saveEdit = async (toUpdate, updateValue) => {
        if (!detailId) return;
        setUpdating(true);

        try {
            const password = prompt("Please enter your password to save changes:");
            if (!password) {
                setUpdating(false);
                return;
            }

            const response = await updateWorkgroup(toUpdate, updateValue, detailId, user.email, password);

            if (response.status === 200) {
                showMessage({ title: 'Success', message: `Workgroup ${toUpdate} updated.` });
                setEditingField(null);
            }
        } catch (err) {
            showMessage({ title: 'Failed', message: err.response?.data?.message || "Update failed." });
        } finally {
            setUpdating(false);
        }
    };

    return (
        (!workgroupDetails) ?
            <p className="text-center fs-4 mt-3">Loading workgroup detailed informations...</p>
            :
            <>
                <Card className="shadow-sm">
                    <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                        <div>
                            <ArrowLeftSquare
                                title="Go back"
                                size={30}
                                onClick={onClickBack}
                                className={`me-3 ${actionsDisabled ? "text-muted" : ""}`}
                                style={{ cursor: actionsDisabled ? "not-allowed" : "pointer" }}
                            />
                            <Badge pill bg={workgroupDetails.role === 'admin' ? 'danger' : 'primary'}>
                                {workgroupDetails.role}
                            </Badge>
                        </div>
                        <div className="d-flex gap-3 align-items-center">
                            <People
                                className={actionsDisabled ? "text-secondary" : "text-primary"}
                                title="Members" size={30} onClick={() => !actionsDisabled && setShowMembers(true)}
                                style={{ cursor: actionsDisabled ? "not-allowed" : "pointer" }}
                            />
                            <ArrowLeftRight
                                className={actionsDisabled ? "text-secondary" : "text-primary"}
                                title="Relations" size={30} onClick={() => !actionsDisabled && setShowRelations(true)}
                                style={{ cursor: actionsDisabled ? "not-allowed" : "pointer" }}
                            />

                            {/* Delete the workgroup button. This button will be shown when the user is admin. */}
                            {
                                workgroupDetails.role === "admin"
                                &&
                                <Trash
                                    className={actionsDisabled ? "text-secondary" : "text-danger"}
                                    title="Delete workgroup"
                                    size={30}
                                    onClick={onClickDelete}
                                    style={{ cursor: actionsDisabled ? "not-allowed" : "pointer" }}
                                />
                            }
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="d-flex align-items-center mt-1 mb-3 gap-2">
                            {editingField === "title" ? (
                                <>
                                    <Form.Control
                                        name="workgroupTitle"
                                        size="lg"
                                        value={localTitle}
                                        onChange={(e) => setLocalTitle(e.target.value)}
                                        placeholder="Enter workgroup title"
                                        disabled={updating}
                                        style={{ maxWidth: 520 }}
                                    />
                                    <Check2Circle
                                        size={28}
                                        className="text-success"
                                        title={updating ? "Updating..." : "Save"}
                                        onClick={!updating ? () => saveEdit("workgroupName", localTitle.trim()) : undefined}
                                        style={{ cursor: updating ? "wait" : "pointer" }}
                                    />
                                    <XCircle
                                        size={24}
                                        className="text-muted"
                                        title="Cancel"
                                        onClick={!updating ? cancelEdit : undefined}
                                        style={{ cursor: updating ? "not-allowed" : "pointer" }}
                                    />
                                    {updating && <Spinner animation="border" size="sm" className="ms-2" />}
                                </>
                            ) : (
                                <>
                                    <h2 className="d-inline me-2 mb-0">{localTitle || "Untitled Workgroup"}</h2>
                                    {workgroupDetails.role === 'admin' && (
                                        <PencilSquare
                                            className="text-primary"
                                            title="Edit title"
                                            size={24}
                                            onClick={() => beginEdit("title")}
                                            style={{ cursor: "pointer" }}
                                        />
                                    )}
                                </>
                            )}
                        </div>

                        <Card.Text as="div" className="text-muted small">
                            <div>Created: {workgroupDetails.createdAt ? getRelativeTime(workgroupDetails.createdAt) : "—"}</div>
                            <div>Updated: {workgroupDetails.updatedAt ? getRelativeTime(workgroupDetails.updatedAt) : "—"}</div>
                        </Card.Text>

                        <hr />

                        <div className="mt-3">
                            {editingField === "description" ? (
                                <div className="d-flex align-items-start gap-2">
                                    <Form.Control
                                        name="workgroupDescription"
                                        as="textarea"
                                        rows={22}
                                        value={localDescription}
                                        onChange={(e) => setLocalDescription(e.target.value)}
                                        placeholder="Enter description"
                                        disabled={updating}
                                    />
                                    <div className="d-flex flex-column align-items-center mt-1">
                                        <Check2Circle
                                            size={28}
                                            className="text-success mb-2"
                                            title={updating ? "Updating..." : "Save"}
                                            onClick={!updating ? () => saveEdit("description", localDescription.trim()) : undefined}
                                            style={{ cursor: updating ? "wait" : "pointer" }}
                                        />
                                        <XCircle
                                            size={24}
                                            className="text-muted"
                                            title="Cancel"
                                            onClick={!updating ? cancelEdit : undefined}
                                            style={{ cursor: updating ? "not-allowed" : "pointer" }}
                                        />
                                    </div>
                                    {updating && <Spinner animation="border" size="sm" className="ms-2 mt-1" />}
                                </div>
                            ) : (
                                <div className="w-100 justify-content-center">
                                    {workgroupDetails.role === 'admin' && (
                                        <PencilSquare
                                            className={`mb-2 ${isEditing ? "text-secondary" : "text-primary"}`}
                                            title={isEditing ? "Finish current edit first" : "Edit description"}
                                            size={24}
                                            onClick={() => !isEditing && beginEdit("description")}
                                            style={{ cursor: isEditing ? "not-allowed" : "pointer", float: 'right' }}
                                        />
                                    )}
                                    <pre
                                        className="mb-4"
                                        style={{
                                            fontSize: "1.2rem",
                                            overflowY: "auto",
                                            wordWrap: "normal",
                                            whiteSpace: "pre-wrap",
                                            fontFamily: 'inherit'
                                        }}
                                    >
                                        {localDescription || "No description."}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                {/* Render the modals with their required props */}
                <MembersModal
                    show={showMembers}
                    onHide={() => setShowMembers(false)}
                    workgroupId={detailId}
                    workgroupName={localTitle}
                    role={workgroupDetails.role}
                    memberList={memberList}
                    setMemberList={setMemberList}
                />

                <RelationsModal
                    show={showRelations}
                    onHide={() => setShowRelations(false)}
                    workgroupId={detailId}
                    workgroupName={localTitle}
                    role={workgroupDetails.role}
                    memberList={memberList} // for trigger the memberList changes
                />
            </>
    );
};