import { useState, useEffect } from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { ArrowRight } from "react-bootstrap-icons";

import { useUser } from "../../contexts/UserContext";
import { useMainPage, WORK_SPACES } from "../../contexts/MainPageContext";
import { getRelativeTime } from "../../contexts/GlobalFunctions";
import { getWorkOverviews } from "../../apis/work_apis";
import { useMessageDialog } from "../others/MessageDialog";

export const WorksDisplay = () => {
    const { user } = useUser();
    const { currentWorkSpace, updateWorkSpace, setDetailId } = useMainPage();
    const { showMessage } = useMessageDialog();

    const [currentWorkOverviews, setCurrentWorkOverviews] = useState([]);
    const [filterdWorks, setFilteredWorks] = useState([]);

    // Requesting work overviews informations to display.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getWorkOverviews(user.email);
                if (response.status !== 200) return;

                setCurrentWorkOverviews(response.data.dto);
            } catch (error) {
                showMessage({ title: "Failed", message: error.response.data.message })
            }
        }

        fetchData();
    }, []);

    // Filtering the works to display based on selected workspace
    useEffect(() => {
        if (currentWorkOverviews.length === 0) return;
        let filteredResult = [];

        if (currentWorkSpace === WORK_SPACES.allWorks.key) {
            filteredResult = currentWorkOverviews;
        }
        else if (currentWorkSpace === WORK_SPACES.toDoWorks.key) {
            filteredResult = currentWorkOverviews.filter(cwo => cwo.assignedTo === user.email);
        }
        else if (currentWorkSpace === WORK_SPACES.forDoWorks.key) {
            filteredResult = currentWorkOverviews.filter(cwo => cwo.createdBy === user.email && cwo.assignedTo !== user.email)
        }

        setFilteredWorks(filteredResult);
    }, [currentWorkSpace, currentWorkOverviews])

    // ----------------------------------------------------

    const onClicViewDetail = async (workId) => {
        setDetailId(workId)
        updateWorkSpace(WORK_SPACES.workDetailView.key)
    };

    return (
        <>
            {filterdWorks.length === 0 ? (
                <p className="text-center text-muted mt-4">No work items to display.</p>
            ) : (
                filterdWorks.map(work => {
                    if (!work) return null;

                    return (
                        <Card key={work.workId} className='my-2 shadow-sm'>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <div>
                                    {/* New work Badge */}
                                    {
                                        (!work.seen && work.createdBy !== work.assignedTo && work.createdBy !== user.email)
                                        &&
                                        <Badge bg='success' className='me-3'>new</Badge>
                                    }

                                    <span className='fw-bold text-primary fs-4 me-3'>{work.title}</span>

                                    {/* Creator Badge */}
                                    {
                                        (work.createdBy === user.email)
                                        &&
                                        <Badge bg="danger" className="shadow-sm mx-1" >you created</Badge>
                                    }

                                    {/* Priority Badge */}
                                    <Badge
                                        bg={work.priority === 'high' ? 'danger' : work.priority === 'medium' ? 'warning' : 'dark'}
                                        className="shadow-sm mx-1"
                                    >
                                        {work.priority}
                                    </Badge>

                                    {/* Complete or not Badge */}
                                    <Badge
                                        bg={work.isCompleted ? 'success' : 'secondary'}
                                        className="shadow-sm mx-1"
                                    >
                                        {work.isCompleted ? 'completed' : 'incomplete'}
                                    </Badge>
                                </div>

                                <span className='ms-2 text-muted small'>{getRelativeTime(work.createdAt)}</span>
                            </Card.Header>
                            <Card.Body>
                                <Card.Text as="div" className="d-flex align-items-center">
                                    {work.createdBy === user.email ? 'You' : work.createdByUser}
                                    <ArrowRight size={20} className="mx-2" />
                                    {work.assignedTo === user.email ? 'You' : work.assignedToUser}
                                </Card.Text>
                                <Button variant="outline-primary" size="sm" className="mt-2" onClick={() => onClicViewDetail(work.workId)}>
                                    View Details
                                </Button>
                            </Card.Body>
                        </Card>
                    );
                })
            )}
        </>
    );
};