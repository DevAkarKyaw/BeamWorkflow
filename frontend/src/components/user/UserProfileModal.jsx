import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Image, Alert, Spinner, Stack, Container } from "react-bootstrap";
import { PencilSquare } from "react-bootstrap-icons";
import { useGlobal } from "../../contexts/GlobalContext";
import { useUser } from "../../contexts/UserContext";
import { useMessageDialog } from "../others/MessageDialog";
import { deleteUser, updateUserInfos } from "../../apis/user_api";
import { URL_IMAGE } from "../../apis/urls";

const AVATAR_FALLBACK =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'>
      <rect width='100' height='100' fill='#ddd'/>
      <text x='50' y='54' text-anchor='middle' font-size='42' fill='#888'>👤</text>
    </svg>`
    );

export const UserProfileModal = ({ user, onHide, show }) => {
    const navigate = useNavigate()
    const { themeName, themeOptions, setThemeName } = useGlobal()
    const { user: storedUser, clearUser, updateUser } = useUser()
    const { showMessage } = useMessageDialog()

    const safeUser = user ?? {}

    const [username, setUsername] = useState("")
    const [gender, setGender] = useState("");
    const [newPassword, setNewPassword] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewImage, setPreviewImage] = useState(null)
    const fileInputRef = useRef(null)

    const [editingField, setEditingField] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const [tempTheme, setTempTheme] = useState(themeName)

    const resetState = () => {
        setEditingField(null)
        setUsername(user?.username ?? "")
        setGender(user?.gender ?? "")
        setNewPassword("")
        setTempTheme(themeName)
        setSelectedFile(null)
        setPreviewImage(null)
    };

    useEffect(() => {
        if (show) {
            resetState()
        }
    }, [show, user, themeName])

    const handleUpdate = async (toUpdate, value) => {
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await updateUserInfos(toUpdate, value, storedUser.email, storedUser.password)
            console.log(response.data)

            if (response.status === 200) {
                if (toUpdate !== "userImage") updateUser(toUpdate, value);

                if (toUpdate === "themeName") setThemeName(value);
                if (toUpdate === "userImage") {
                    updateUser(toUpdate, response.data.dto)
                    setSelectedFile(null);
                    setPreviewImage(null);
                }

                setSuccess(`${toUpdate} updated successfully!`);
                setEditingField(null);
            }
        } catch (err) {
            setError(err.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const cancelImageUpdate = () => {
        setSelectedFile(null);
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        if (!success && !error) return;
        const timer = setTimeout(() => {
            setSuccess(null);
            setError(null);
        }, 3000);
        return () => clearTimeout(timer);
    }, [success, error]);

    const logOut = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            clearUser();
            navigate("/signin");
        }
    };

    const deleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete this account?")) {
            try {
                const response = await deleteUser(storedUser.email, storedUser.password)

                if (response.status === 200) {
                    showMessage({ title: "Success!", message: "Account deleted successfully." })
                    clearUser()
                    navigate('/signin')
                }
            } catch (error) {
                showMessage({ title: "Failed!", message: error.response.data.message })
            }
        }

    }

    const avatarSrc =
        previewImage ||
        (safeUser.userImage
            ? `${URL_IMAGE}?imageId=${encodeURIComponent(safeUser.userImage)}&t=${new Date().getTime()}`
            : AVATAR_FALLBACK);

    return (
        <Modal show={!!show} onHide={onHide} centered onExited={resetState}>
            <Modal.Header closeButton>
                <Modal.Title>Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger" className="mb-2">{error}</Alert>}
                {success && <Alert variant="success" className="mb-2">{success}</Alert>}

                <Container className="d-flex flex-column align-items-center mb-3">
                    <div className="position-relative d-inline-block">
                        <Image
                            src={avatarSrc}
                            roundedCircle
                            height={100}
                            width={100}
                            alt="User"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.src = AVATAR_FALLBACK; }}
                        />
                        <Button
                            variant="light"
                            className="position-absolute border"
                            style={{ right: 0, bottom: 0, borderRadius: '50%', padding: '0.3rem' }}
                            onClick={() => fileInputRef.current?.click()}
                            title="Change avatar"
                        >
                            <PencilSquare size={20} />
                        </Button>
                        <Form.Control
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                    {selectedFile && (
                        <div className="d-flex justify-content-center gap-2 mt-2">
                            <Button
                                variant="primary"
                                size="sm"
                                disabled={loading}
                                onClick={() => handleUpdate("userImage", selectedFile)}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : "Update Image"}
                            </Button>
                            <Button variant="secondary" size="sm" onClick={cancelImageUpdate}>Cancel</Button>
                        </div>
                    )}
                </Container>

                <Stack gap={3}>
                    <div>
                        <strong>Username:</strong>
                        {editingField === "username" ? (
                            <>
                                <Form.Control
                                    type="text"
                                    className="mt-1"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <div className="d-flex gap-2 mt-1">
                                    <Button size="sm" onClick={() => handleUpdate("username", username)} disabled={loading}>
                                        {loading ? <Spinner animation="border" size="sm" /> : "Update"}
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => setEditingField(null)}>Cancel</Button>
                                </div>
                            </>
                        ) : (
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="ms-3">{username || "—"}</span>
                                <PencilSquare onClick={() => setEditingField("username")} size={20} style={{ cursor: "pointer" }} />
                            </div>
                        )}
                    </div>

                    <div>
                        <strong>Gender:</strong>
                        {editingField === "gender" ? (
                            <>
                                <Form.Select
                                    className="mt-1"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="">Select…</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </Form.Select>
                                <div className="d-flex gap-2 mt-1">
                                    <Button size="sm" onClick={() => handleUpdate("gender", gender)} disabled={loading}>
                                        {loading ? <Spinner animation="border" size="sm" /> : "Update"}
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => setEditingField(null)}>Cancel</Button>
                                </div>
                            </>
                        ) : (
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="ms-3">{gender || "—"}</span>
                                <PencilSquare onClick={() => setEditingField("gender")} size={20} style={{ cursor: "pointer" }} />
                            </div>
                        )}
                    </div>

                    <div>
                        <strong>Password:</strong>
                        {editingField === "password" ? (
                            <>
                                <Form.Control
                                    type="password"
                                    className="mt-1"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <div className="d-flex gap-2 mt-1">
                                    <Button size="sm" onClick={() => handleUpdate("password", newPassword)} disabled={loading || !newPassword}>
                                        {loading ? <Spinner animation="border" size="sm" /> : "Update"}
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => setEditingField(null)}>Cancel</Button>
                                </div>
                            </>
                        ) : (
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="ms-3">••••••••</span>
                                <PencilSquare onClick={() => setEditingField("password")} size={20} style={{ cursor: "pointer" }} />
                            </div>
                        )}
                    </div>

                    <div>
                        <strong>Theme:</strong>
                        {editingField === "theme" ? (
                            <>
                                <Form.Select
                                    className="mt-1"
                                    value={tempTheme}
                                    onChange={(e) => setTempTheme(e.target.value)}
                                >
                                    {(themeOptions ?? []).map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </Form.Select>
                                <div className="d-flex gap-2 mt-1">
                                    <Button size="sm" onClick={() => handleUpdate("themeName", tempTheme)} disabled={loading}>
                                        {loading ? <Spinner animation="border" size="sm" /> : "Update"}
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => setEditingField(null)}>Cancel</Button>
                                </div>
                            </>
                        ) : (
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="ms-3 text-capitalize">{themeName || "—"}</span>
                                <PencilSquare onClick={() => setEditingField("theme")} size={20} style={{ cursor: "pointer" }} />
                            </div>
                        )}
                    </div>
                </Stack>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="warning" onClick={logOut}>Logout</Button>
                <Button variant="danger" onClick={deleteAccount}>Delete Account</Button>
            </Modal.Footer>
        </Modal>
    );
};
