import { createContext, useContext, useState, useCallback, useMemo } from "react";

export const WORK_SPACES = {
    allWorks: { key: 'all-works', label: 'All Works' },
    toDoWorks: { key: 'to-do-works', label: 'To-Do Works' },
    forDoWorks: { key: 'for-do-works', label: 'For-Do Works' },
    workDetailView: { key: 'work-detail-view', label: 'Work Detail View' },
    myWorkgroups: { key: 'my-workgroups', label: 'My Workgroups' },
    allWorkgroups: { key: 'all-workgroups', label: 'All Workgroups' },
    workgroupDetailView: { key: 'workgroup-detail-view', label: 'Workgroup Detail View' },
    createWork: { key: 'create-work', label: 'Create Work' },
    createWorkgroup: { key: 'create-workgroup', label: 'Create Workgroup' }
};

export const MainPageContext = createContext(null);

export const MainPageContextProvider = ({ children }) => {
    const [currentWorkSpace, setCurrentWorkSpace] = useState(WORK_SPACES.allWorks.key);
    const [previousWorkSpace, setPreviousWorkSpace] = useState('');
    const [detailId, setDetailId] = useState(null)

   const updateWorkSpace = useCallback((workSpace) => {
        setPreviousWorkSpace(currentWorkSpace);
        setCurrentWorkSpace(workSpace);
    }, [currentWorkSpace]);


    // =============================================================================================

    const contextValue = useMemo(() => ({
        currentWorkSpace, previousWorkSpace, updateWorkSpace,
        detailId, setDetailId,
    }), [
        currentWorkSpace, previousWorkSpace, updateWorkSpace,
        detailId,
    ]);

    return (
        <MainPageContext.Provider value={contextValue}>
            {children}
        </MainPageContext.Provider>
    );
};

export const useMainPage = () => {
    const context = useContext(MainPageContext);
    if (!context) {
        throw new Error('useMainPage must be used within a MainPageContextProvider');
    }
    return context;
};