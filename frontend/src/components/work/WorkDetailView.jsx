import { Button, Spinner, Badge, Form, Card, Dropdown } from "react-bootstrap";
import {
    ArrowLeftSquare,
    PencilSquare,
    Trash,
    Check2Circle,
    XCircle,
    ArrowRight
} from "react-bootstrap-icons";
import { useEffect, useMemo, useState } from "react";
// Contexts and Global Variables and Functions
import { useUser } from "../../contexts/UserContext";
import { useMainPage } from "../../contexts/MainPageContext";
import { useMessageDialog } from "../others/MessageDialog";
import { getRelativeTime } from "../../contexts/GlobalFunctions";
import { getWrokDetails, getMyJuniors, deleteWork, updateWork, workDone } from "../../apis/work_apis";


export const WorkDetailView = () => {
    // Contexts
    const { user } = useUser()
    const { previousWorkSpace, updateWorkSpace, detailId } = useMainPage()
    const { showMessage } = useMessageDialog()

    // UI state
    const [updating, setUpdating] = useState(false)
    const [loading, setLoading] = useState(false)

    // Editing control: 'title' | 'description' | null
    const [editingField, setEditingField] = useState(null);
    const isEditing = useMemo(() => editingField !== null, [editingField]);

    // Local editable copies
    const [localTitle, setLocalTitle] = useState("");
    const [localDescription, setLocalDescription] = useState("");
    const [toAssignJuniors, setToAssignJuniors] = useState([]);

    const [workDetails, setWorkDetails] = useState({});
    const [juniors, setJuniors] = useState([]);

    // Requesting detailed data of work to display.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getWrokDetails(detailId, user.email);

                if (response.status === 200) {
                    setWorkDetails(response.data.dto);
                    setLocalTitle(response.data.dto.title);
                    setLocalDescription(response.data.dto.description);
                }
            } catch (error) {
                showMessage({ title: "Failed!", message: error.response.data.message })
            }
        }

        fetchData();
    }, []);

    // Requesting juniors to reassign the work
    useEffect(() => {
        if (
            workDetails && 
            workDetails.createdBy !== user.email && 
            juniors.length === 0
        ) return;

        const fetchData = async () => {
            try {
                const response = await getMyJuniors(workDetails.relatedWorkgroupId, user.email);

                if (response.status === 200) setJuniors(response.data.dto);
            } catch (error) {
                showMessage({ title: "Failed!", message: error.response.data.message })
            }
        }

        fetchData();
    }, [workDetails])

    // Filtering the to assign juniors list
    useEffect(() => {
        if (juniors.length === 0) return;

        const filteredToAssignJuniors = juniors.filter(j => j.juniorEmail !== workDetails.assignedTo);
        setToAssignJuniors(filteredToAssignJuniors);
    }, [workDetails, juniors, workDetails?.assignedTo]);

    // ----------------------------------------------------

    const actionsDisabled = isEditing || updating;

    const onClickBack = () => {
        if (actionsDisabled) return;
        updateWorkSpace(previousWorkSpace);
    };

    const beginEdit = (field) => {
        if (isEditing && editingField !== field) return; // only one at a time
        setEditingField(field);
    };

    const cancelEdit = () => {
        setLocalTitle(workDetails.title);
        setLocalDescription(workDetails.description);
        setEditingField(null);
    };

    const saveEdit = async (toUpdate, updateValue) => {
        setUpdating(true);

        try {
            const response = await updateWork(toUpdate, updateValue, detailId, user.email)

            if (response.status === 200) {
                workDetails.updatedAt = response.data.dto.updatedAt;
                if (toUpdate === "title") {
                    setLocalTitle(updateValue);
                } else if (toUpdate === "description") {
                    setLocalDescription(updateValue)
                }

                showMessage({ title: "Success!", message: "Work updated successfully." });
                setEditingField(null);
            }
        } catch (error) {
            showMessage({ title: "Failed!", message: error.response.data.message })
        } finally {
            setUpdating(false);
        }
    };

    const onClickDone = async () => {
        setLoading(true);

        try {
            const response = await workDone(detailId, user.email);

            if (response.status === 200) {
                workDetails.isCompleted = true;
                workDetails.completedAt = response.data.dto.completedAt;
            }
        } catch (error) {
            showMessage({ title: "Failed!", message: error.response.data.message });
        } finally {
            setLoading(false);
        }
    };

    const onAssignToChange = async (newAssignedToEmail) => {
        if (newAssignedToEmail === workDetails.assignedTo) return;
        setUpdating(true);

        try {
            const response = await updateWork("assignedto", newAssignedToEmail, detailId, user.email);

            if (response.status === 200) {
                workDetails.assignedTo = newAssignedToEmail;
                workDetails.updatedAt = response.data.dto.updatedAt;

                if (newAssignedToEmail !== user.email) {
                    const assignedJunior = juniors.find(j => j.juniorEmail === newAssignedToEmail);
                    if (assignedJunior) workDetails.assignedToUser = assignedJunior.username;
                    showMessage({ title: "Success", message: `Work reassigned to ${assignedJunior.username}` });
                } else {
                    showMessage({ title: "Success", message: "Work reassigned to yourself" });
                }
            }
        } catch (error) {
            showMessage({ title: "Failed!", message: error.response.data.message });
        } finally {
            setUpdating(false);
        }
    };

    const onClickDelete = async () => {
        if (actionsDisabled || !detailId) return;
        if (!confirm("Are you sure you want to delete this work?")) return;

        try {
            const response = await deleteWork(workDetails.workId, user.email)

            if (response.status === 200) {
                showMessage({ title: 'Success', message: `${workDetails.title} was deleted successfully.` });

                updateWorkSpace(previousWorkSpace)
            }
        } catch (error) {
            showMessage({ title: "Failed", message: error.response.data.message });
        }
    };

    return (
        (!workDetails) ?
            <p className="text-center fs-4 mt-3">Loading work detailed informations...</p>
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

                            {(workDetails.createdBy === user.email) && <Badge pill bg="danger" className="me-2">
                                created by {workDetails.createdBy === user.email ? 'You' : workDetails.createdByUser}
                            </Badge>}

                            {
                                (workDetails.isCompleted) ?
                                    <Badge pill bg="success">Completed</Badge>
                                    :
                                    (workDetails.seen) ?
                                        <Badge pill bg="info">In progress</Badge>
                                        :
                                        <Badge pill bg="secondary">Incomplete</Badge>
                            }
                        </div>

                        {
                            (workDetails.createdBy === user.email)
                            &&
                            <div className="d-flex gap-3 align-items-center">
                                {workDetails.createdBy === user.email && (
                                    <Trash
                                        className={actionsDisabled ? "text-secondary" : "text-danger"}
                                        title="Delete work"
                                        size={30}
                                        onClick={onClickDelete}
                                        style={{ cursor: actionsDisabled ? "not-allowed" : "pointer" }}
                                    />
                                )}
                            </div>
                        }
                    </Card.Header>

                    <Card.Body>
                        {/* Title */}
                        <div className="d-flex align-items-center mt-1 mb-3 gap-2">
                            {editingField === "title" ? (
                                <>
                                    <Form.Control
                                        name="title"
                                        size="lg"
                                        value={localTitle}
                                        onChange={(e) => setLocalTitle(e.target.value)}
                                        placeholder="Enter work title"
                                        disabled={updating}
                                        style={{ maxWidth: 520 }}
                                    />
                                    <Check2Circle
                                        size={28}
                                        className="text-success"
                                        title={updating ? "Updating..." : "Save"}
                                        onClick={!updating ? () => saveEdit("title", localTitle.trim()) : undefined}
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
                                    <h2 className="d-inline me-2 mb-0">{localTitle || "Untitled work"}</h2>
                                    {
                                        (workDetails.createdBy === user.email)
                                        &&
                                        <>
                                            <PencilSquare
                                                className="text-primary"
                                                title="Edit title"
                                                size={24}
                                                onClick={() => beginEdit("title")}
                                                style={{ cursor: "pointer" }}
                                            />
                                        </>
                                    }
                                </>
                            )}
                        </div>

                        <Card.Text as="div" className="text-muted small">
                            <div>Priority: {workDetails.priority}</div>
                            <div>Created: {workDetails.createdAt ? getRelativeTime(workDetails.createdAt) : "—"}</div>
                            <div>Updated: {workDetails.updatedAt ? getRelativeTime(workDetails.updatedAt) : "—"}</div>

                            {workDetails.isCompleted && <div>Completed: {getRelativeTime(workDetails.completedAt)}</div>}

                            {workDetails.createdBy === user.email ? 'You' : workDetails.createdByUser}
                            <ArrowRight size={20} className="mx-2" />
                            {workDetails.assignedTo === user.email ? 'You' : workDetails.assignedToUser}
                        </Card.Text>

                        <hr />

                        {/* Description */}
                        <div className="mt-3">
                            {editingField === "description" ? (
                                <div className="d-flex align-items-start gap-2">
                                    <Form.Control
                                        name="description"
                                        as="textarea"
                                        rows={4}
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
                                <div>
                                    {(workDetails.createdBy === user.email) && (
                                        <PencilSquare
                                            className={`mb-2 ${isEditing ? "text-secondary" : "text-primary"}`}
                                            title={isEditing ? "Finish current edit first" : "Edit description"}
                                            size={24}
                                            onClick={() => !isEditing && beginEdit("description")}
                                            style={{ cursor: isEditing ? "not-allowed" : "pointer", float: 'right' }}
                                        />
                                    )}
                                    <pre
                                        style={{
                                            fontSize: "1.1rem",
                                            overflowY: "auto",
                                            wordWrap: "break-word",
                                            whiteSpace: "pre-wrap",
                                            fontFamily: 'inherit'
                                        }}
                                        className="mb-0"
                                    >
                                        {localDescription || "No description."}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </Card.Body>

                    <Card.Footer className="d-flex justify-content-between align-items-center">
                        {/* Mark as Done button is only able to see when the user is assigned user */}
                        {
                            (workDetails.assignedTo === user.email)
                            &&
                            <Button
                                onClick={onClickDone}
                                disabled={loading || workDetails.isCompleted || workDetails.assignedTo !== user.email}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : "Mark as Done"}
                            </Button>
                        }

                        {/* Reassign dropdown is only able to see to the work created user */}
                        {
                            (workDetails.createdBy === user.email)
                            &&
                            <Dropdown>
                                <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic" disabled={updating}>
                                    {updating ? <Spinner animation="border" size="sm" /> : workDetails.assignedTo}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {/* Assign work to yourself */}
                                    {
                                        (workDetails.assignedTo !== user.email)
                                        &&
                                        <Dropdown.Item key={user.email} onClick={() => onAssignToChange(user.email)} >
                                            Yourself
                                        </Dropdown.Item>
                                    }

                                    {/* Assign work to juniors */}
                                    {
                                        toAssignJuniors.map(junior => (
                                            (junior.juniorEmail !== workDetails.assignedTo)
                                            &&
                                            <Dropdown.Item key={junior.juniorEmail} onClick={() => onAssignToChange(junior.juniorEmail)} >
                                                {junior.juniorEmail} ({junior.username})
                                            </Dropdown.Item>
                                        ))
                                    }
                                </Dropdown.Menu>
                            </Dropdown>
                        }
                    </Card.Footer>
                </Card>
            </>
    );
};