import { useEffect, useState } from "react";
import { Button, Card, Badge, Spinner } from "react-bootstrap";
import { BoxArrowInRight } from "react-bootstrap-icons";
// Contexts, Global Variables and Functions
import { useUser } from "../../contexts/UserContext";
import { useMainPage, WORK_SPACES } from "../../contexts/MainPageContext";
import { useMessageDialog } from "../others/MessageDialog";
import { getWorkgroupOverviews } from "../../apis/workgroup_apis";
import { getRelativeTime } from "../../contexts/GlobalFunctions";


export const WorkgroupsDisplay = () => {
    const { user } = useUser();
    const { currentWorkSpace, updateWorkSpace, setDetailId } = useMainPage();
    const { showMessage } = useMessageDialog();

    const [currentWorkgroupOverviews, setCurrentWorkgroupOverviews] = useState([]);
    const [filteredWorkgroups, setFilteredWorkgroups] = useState([]);

    // Requesting workgroups overview informations to display.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getWorkgroupOverviews(user.email);
                if (response.status !== 200) return;

                setCurrentWorkgroupOverviews(response.data.dto);
            } catch (error) {
                showMessage({ title: "Failed", message: error.response.data.message })
            }
        }

        fetchData();
    }, []);

    // Filtering workgroups to display based on the selected workspace.
    useEffect(() => {
        if (currentWorkgroupOverviews.length === 0) return;
        let filteredResult = [];

        if (currentWorkSpace === WORK_SPACES.myWorkgroups.key) {
            filteredResult = currentWorkgroupOverviews.filter(cwgo => cwgo.role === "admin" || cwgo.role === "assist_admin");
        } else if (currentWorkSpace === WORK_SPACES.allWorkgroups.key) {
            filteredResult = currentWorkgroupOverviews;
        }

        setFilteredWorkgroups(filteredResult);
    }, [currentWorkSpace, currentWorkgroupOverviews]);

    // ----------------------------------------------------

    const onClickViewDetail = async (workgroupId) => {
        setDetailId(workgroupId)
        updateWorkSpace(WORK_SPACES.workgroupDetailView.key);
    }

    return (
        <>
            {
                filteredWorkgroups.length === 0 ? (
                    <p className="text-center text-muted mt-4">No workgroups to display.</p>
                ) : (
                    filteredWorkgroups.map((workgroup) => {
                        return (
                            <Card className="my-2" key={workgroup.workgroupId}>
                                <Card.Header>
                                    <div className="fw-bold fs-4 text-primary">
                                        {workgroup.workgroupName}
                                    </div>
                                    <div>
                                        <span className="me-3 text-muted">
                                            {getRelativeTime(workgroup.createdAt)}
                                        </span>
                                        {workgroup.role === "admin" && <Badge bg="danger">Admin</Badge>}
                                        {workgroup.role === "assist_admin" && <Badge bg="danger">Assistant admin</Badge>}
                                    </div>
                                </Card.Header>

                                <Card.Body>
                                    <Button
                                        className="mt-1" variant="primary"
                                        onClick={() => onClickViewDetail(workgroup.workgroupId)}
                                    >
                                        <BoxArrowInRight size={23} />
                                        <span className="ms-2" style={{ height: 0 }}>
                                            View Detail
                                        </span>
                                    </Button>
                                </Card.Body>
                            </Card>
                        );
                    })
                )
            }
        </>
    );
};