import { useState } from 'react';
import { Accordion, Button, Card, Badge, Modal } from 'react-bootstrap';


export const Task = ({ taskName, taskDueTime, taskCreatedTime, taskDescription, taskTitle, taskCreator, workGroupName }) => {

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const acc_id = 'Bob'

    const define_color = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'high':
                return 'danger';
            case 'medium':
                return 'warning';
            case 'low':
                return 'secondary';
            default:
                return 'secondary';
        }
    }

    const onClickDone = () => {
        setShowConfirmModal(true)
    }

    const onClickDelete = () => {

    }

    return (
        <>
            <Card
                border={define_color(taskTitle)}
                className='w-100'
            >
                <Card.Body>
                    <Card.Title>
                        {taskName}<br />
                        <Badge pill bg={define_color(taskTitle)} className='m-1' size='sm'>{taskTitle}</Badge>
                    </Card.Title>

                    <Card.Subtitle className="mt-2" style={{ opacity: '60%', fontSize: '0.9rem' }}>Created : {new Date(taskCreatedTime).toLocaleDateString()}</Card.Subtitle>
                    <Card.Subtitle className="mt-2" style={{ opacity: '60%', fontSize: '0.9rem' }}>Due : {new Date(taskDueTime).toLocaleDateString()}</Card.Subtitle>

                    <Card.Body className='py-3 px-0'>
                        <Accordion defaultActiveKey="0">
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Task Descriptions</Accordion.Header>
                                <Accordion.Body>
                                    {taskDescription}
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="2">
                                <Accordion.Header>Task More Info</Accordion.Header>
                                <Accordion.Body>
                                    Group Name: <span style={{ opacity: '70%' }}>{workGroupName}</span><br />
                                    Created By: <span style={{ opacity: '70%' }}>{taskCreator}</span><br />
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Card.Body>

                    <div className='d-flex justify-content-center'>
                        {taskTitle === 'completed' ? <></> : <Button onClick={onClickDone} className='mt-4 mx-3'>done</Button>}
                        {acc_id === taskCreator ? <Button onClick={onClickDelete} className='mt-4 mx-3' variant='danger'>delete</Button> : <></>}
                    </div>

                </Card.Body>
            </Card>

            <ConfirmModal taskName={taskName} showConfirmModal={showConfirmModal} setShowConfirmModal={setShowConfirmModal} />
        </>
    )
}


const ConfirmModal = ({ taskName, showConfirmModal, setShowConfirmModal }) => {

    return (
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>{taskName}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>Are you sure you have done this task?</p>
            </Modal.Body>

            <Modal.Footer className='d-flex justify-content-around'>
                <Button variant="secondary" className='w-25' onClick={() => setShowConfirmModal(false)}>No</Button>
                <Button variant="danger" className='w-25' onClick={() => setShowConfirmModal(false)}>Yes</Button>
            </Modal.Footer>
        </Modal>
    )
}
