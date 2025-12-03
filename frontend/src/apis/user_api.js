import axios from "axios";
import { USER } from "./urls";


// 
// =================================================================================================
// APIS THAT ARE USED IN `SigninPage.jsx` and `SignupPage.jsx`.

const URL_SIGNIN = `${USER}/signin`;
const URL_SIGNUP = `${USER}/signup`;

export const signIn = (email, password) => {
    return axios.get(URL_SIGNIN, {
        params: { email, password }
    });
}

export const signUp = (email, username, password, gender, image) => {
    const payload = new FormData()
    payload.append("email", email)
    payload.append("username", username)
    payload.append("password", password)
    payload.append("gender", gender)
    if (image) payload.append("image", image)

    return axios.post(URL_SIGNUP, payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

// =================================================================================================
//


// 
// =================================================================================================
// APIS THAT ARE USED IN `UserProfileModal.jsx`.

const URL_UPDATE_USER = `${USER}/user-info`;
const URL_DELETE_USER = `${USER}`;

export const updateUserInfos = (toUpdate, value, email, password) => {
    const payload = new FormData()
    payload.append("toUpdate", toUpdate)
    payload.append("updateValue", toUpdate === "userImage" ? value.name : (value ?? ""))
    payload.append("userEmail", email)
    payload.append("password", password)
    if (toUpdate === "userimage" && value instanceof File) {
        payload.append("updateImage", value)
    }

    return axios.put(URL_UPDATE_USER, payload, {
        headers: { "Content-Type": "multipart/form-data" }
    })
}

export const deleteUser = (email, password) => {
    return axios.delete(URL_DELETE_USER, {
        params: {
            email: email,
            password: password
        }
    })
}

// =================================================================================================
//