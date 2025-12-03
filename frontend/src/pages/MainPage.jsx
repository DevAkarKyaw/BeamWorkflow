import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Image, Modal, Navbar, Offcanvas } from "react-bootstrap";
import {
    ArrowDownLeftSquare,
    ArrowUpRightSquare,
    ExclamationSquare,
    FilePlus,
    FolderPlus,
    House,
    List,
    ListTask,
    People,
} from "react-bootstrap-icons";

// app components
import { CreateWorkForm } from "../components/work/CreateWorkForm";
import { CreateWorkgroupForm } from "../components/workgroup/CreateWorkgroupForm";
import { ProfileHeader } from "../components/user/ProfileHeader";
import { UserProfileModal } from "../components/user/UserProfileModal";
import { WorkDetailView } from "../components/work/WorkDetailView";
import { WorksDisplay } from "../components/work/WorksDisplay";
import { WorkgroupDetailView } from "../components/workgroup/WorkgroupDetailView";
import { WorkgroupsDisplay } from "../components/workgroup/WorkgroupsDisplay";

// contexts & apis
import { useGlobal } from "../contexts/GlobalContext";
import { useUser } from "../contexts/UserContext";
import { useMainPage, WORK_SPACES } from "../contexts/MainPageContext";

export const MainPage = () => {
    // const navigate = useNavigate();
    const { setThemeName } = useGlobal();
    const { user } = useUser();
    const {
        currentWorkSpace,
        updateWorkSpace,
    } = useMainPage();

    const [showSideNavbar, setShowSideNavbar] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [profileModalShow, setProfileModalShow] = useState(false);

    useEffect(() => {
        if (user.themeName) setThemeName(user.themeName);

        // const fetchData = async () => {
        //     const authFail = (err) => {
        //         if (err?.response?.status === 401 || err?.response?.status === 404) {
        //             navigate("/signin", { replace: true });
        //             return true;
        //         }
        //         return false;
        //     };
        // };

        // fetchData();
    }, []);

    const onClickNavBtn = (workSpaceKey) => {
        updateWorkSpace(workSpaceKey);
        setShowSideNavbar(false);
    };

    const navItems = useMemo(
        () => [
            { key: WORK_SPACES.allWorks.key, label: WORK_SPACES.allWorks.label, icon: <ListTask size={20} className="me-3" /> },
            { key: WORK_SPACES.toDoWorks.key, label: WORK_SPACES.toDoWorks.label, icon: <ArrowDownLeftSquare size={20} className="me-3" /> },
            { key: WORK_SPACES.forDoWorks.key, label: WORK_SPACES.forDoWorks.label, icon: <ArrowUpRightSquare size={20} className="me-3" /> },
            { key: WORK_SPACES.myWorkgroups.key, label: WORK_SPACES.myWorkgroups.label, icon: <House size={20} className="me-3" /> },
            { key: WORK_SPACES.allWorkgroups.key, label: WORK_SPACES.allWorkgroups.label, icon: <People size={20} className="me-3" /> },
            { key: WORK_SPACES.createWork.key, label: WORK_SPACES.createWork.label, icon: <FilePlus size={20} className="me-3" /> },
            { key: WORK_SPACES.createWorkgroup.key, label: WORK_SPACES.createWorkgroup.label, icon: <FolderPlus size={20} className="me-3" /> },
        ],
        []
    );

    const currentWorkSpaceLabel = useMemo(() => {
        return Object.values(WORK_SPACES).find(item => item.key === currentWorkSpace)?.label || '';
    }, [currentWorkSpace]);

    const SideNavHeader = () => (
        <div className="d-flex align-items-center text-center p-2">
            <Image src="./bwf_logo.png" style={{ width: 40, height: "auto" }} alt="Beam Logo" />
            <div className="ms-2 text-start">
                <div className="fw-bold text-light fs-5">Beam Workflow</div>
                <div className="text-light" style={{ fontSize: 12 }}>v1.0</div>
            </div>
        </div>
    );

    const SideNavLinks = () => (
        <>
            {navItems.map((item) => (
                <div
                    key={item.key}
                    className={`nav-btn d-flex align-items-center px-3 py-2 my-1 text-light rounded-3 ${currentWorkSpace === item.key ? "active" : ""}`}
                    onClick={() => onClickNavBtn(item.key)}
                >
                    {item.icon} {item.label}
                </div>
            ))}
            <hr className="text-light" />
            <div
                className={`nav-btn d-flex align-items-center px-3 text-light py-2 my-1 rounded-3 ${aboutOpen ? "active" : ""}`}
                onClick={() => { setAboutOpen(true); setShowSideNavbar(false); }}
            >
                <ExclamationSquare size={20} className="me-3" /> About
            </div>
        </>
    );

    return (
        <div className="d-flex bg-light vh-100">
            <style>{`
                .nav-btn { 
                    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out; 
                    color: var(--bs-dark);
                }
                .nav-btn:hover { 
                    background-color: var(--bs-primary-bg-subtle); 
                    cursor: pointer; 
                    color: var(--bs-primary);
                }
                .nav-btn.active { 
                    background-color: var(--bs-primary) !important; 
                    color: var(--bs-white) !important; 
                    font-weight: 500; 
                }
            `}</style>

            {/* Desktop Sidebar */}
            <div className="d-none d-lg-flex flex-column p-2 bg-dark border-end" style={{ minWidth: '280px' }} >
                <SideNavHeader />
                <hr />
                <SideNavLinks />
            </div>

            {/* Main Content */}
            <main className="flex-grow-1 d-flex flex-column">
                {/* Top Navbar */}
                <Navbar className="p-2 bg-white border-bottom shadow-sm">
                    <Button variant="outline-secondary" className="d-lg-none me-2" onClick={() => setShowSideNavbar(true)}>
                        <List />
                    </Button>
                    <Navbar.Brand as="strong" className="mb-0">{currentWorkSpaceLabel}</Navbar.Brand>
                    <div className="ms-auto">
                        <ProfileHeader user={user} onClick={() => setProfileModalShow(true)} />
                    </div>
                </Navbar>

                {/* Content Area */}
                <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
                    {
                        (
                            currentWorkSpace === WORK_SPACES.allWorks.key ||
                            currentWorkSpace === WORK_SPACES.toDoWorks.key ||
                            currentWorkSpace === WORK_SPACES.forDoWorks.key
                        ) &&
                        <WorksDisplay />
                    }
                    {
                        (
                            currentWorkSpace === WORK_SPACES.myWorkgroups.key ||
                            currentWorkSpace === WORK_SPACES.allWorkgroups.key
                        ) &&
                        <WorkgroupsDisplay />
                    }
                    {currentWorkSpace === WORK_SPACES.createWork.key && <CreateWorkForm />}
                    {currentWorkSpace === WORK_SPACES.createWorkgroup.key && <CreateWorkgroupForm />}

                    {/* Detail Views */}
                    {currentWorkSpace === WORK_SPACES.workDetailView.key && <WorkDetailView />}
                    {currentWorkSpace === WORK_SPACES.workgroupDetailView.key && <WorkgroupDetailView />}
                </div>
            </main>

            {/* Mobile Offcanvas Nav */}
            <Offcanvas show={showSideNavbar} onHide={() => setShowSideNavbar(false)} placement="start" className='bg-dark'>
                <Offcanvas.Header className="py-0" closeButton>
                    <SideNavHeader />
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <hr className="mt-0" />
                    <SideNavLinks />
                </Offcanvas.Body>
            </Offcanvas>

            {/* About modal */}
            <Modal show={aboutOpen} onHide={() => setAboutOpen(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>About Beam Workflow</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1">A lightweight workflow tool built with React & ASP.NET Core.</p>
                    <small className="text-muted"></small>
                </Modal.Body>
            </Modal>

            {/* Profile modal */}
            <UserProfileModal user={user} show={profileModalShow} onHide={() => setProfileModalShow(false)} />
        </div>
    );
};