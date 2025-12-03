import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Modal, Button } from "react-bootstrap";

const MessageDialogContext = createContext(null);

export function MessageDialogProvider({ children }) {
    const [state, setState] = useState({ open: false, title: "", message: "", okText: "OK", variant: "primary" });
    const [resolver, setResolver] = useState(null);

    const showMessage = useCallback(({ title = "", message = "", okText = "OK", variant = "primary" } = {}) => {
        return new Promise((resolve) => {
            setResolver(() => resolve);
            setState({ open: true, title, message, okText, variant });
        });
    }, []);

    const close = useCallback(() => {
        setState((s) => ({ ...s, open: false }));
        if (resolver) {
            resolver(true);
            setResolver(null);
        }
    }, [resolver]);

    const api = useMemo(() => ({ showMessage }), [showMessage]);

    return (
        <MessageDialogContext.Provider value={api}>
            {children}
            <Modal show={state.open} onHide={close} centered>
                {state.title && (
                    <Modal.Header closeButton>
                        <Modal.Title>{state.title}</Modal.Title>
                    </Modal.Header>
                )}
                <Modal.Body>
                    <div style={{ whiteSpace: "pre-wrap" }}>{state.message}</div>
                </Modal.Body>
                <Modal.Footer style={{height: "80px"}}>
                    <Button variant={state.variant} onClick={close}>{state.okText}</Button>
                </Modal.Footer>
            </Modal>
        </MessageDialogContext.Provider>
    );
}

export function useMessageDialog() {
    const ctx = useContext(MessageDialogContext);
    if (!ctx) throw new Error("useMessageDialog must be used inside MessageDialogProvider");
    return ctx;
}

// --- Example wiring (Members / Relations icons) ---
// import { useMessageDialog } from "./MessageDialog";
// import { People, ArrowLeftRight } from "react-bootstrap-icons";
//
// function WorkgroupDetailHeader({ workgroupName }) {
//   const { showMessage } = useMessageDialog();
//
//   const onMembersClick = () =>
//     showMessage({ title: "Members", message: `Members of ${workgroupName} will be shown here.` });
//
//   const onRelationsClick = () =>
//     showMessage({ title: "Relations", message: `Relations of ${workgroupName} will be shown here.` });
//
//   return (
//     <div className="d-flex gap-3 align-items-center">
//       <People size={28} onClick={onMembersClick} style={{ cursor: "pointer" }} />
//       <ArrowLeftRight size={28} onClick={onRelationsClick} style={{ cursor: "pointer" }} />
//     </div>
//   );
// }