import { Image } from "react-bootstrap";
import { URL_IMAGE } from "../../apis/urls";

export const ProfileHeader = ({ user, onClick }) => {
    if (!user) return null

    return (
        <div
            className="d-flex align-items-center gap-2 p-2 rounded shadow bg-secondary"
            style={{ cursor: "pointer" }}
            onClick={onClick}
        >
            <Image
                src={`${URL_IMAGE}?imageId=${user.userImage}`}
                roundedCircle
                height={45}
                width={45}
                style={{ objectFit: "cover" }}
                alt="User"
            />
            <span className="fw-bold">{user.username}</span>
        </div>
    )
}