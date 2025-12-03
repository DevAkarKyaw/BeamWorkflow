import axios from "axios";
import { WORKGROUP, WORK } from "./urls";


// 
// =================================================================================================
// APIS THAT ARE USED IN `WorkDisplay.jsx`

const URL_GET_WORK_OVERVIEWS = `${WORK}/overviews`;
const URL_GET_WORK_DETAILS = `${WORK}/details`;

export const getWorkOverviews = (email) => {
    return axios.get(URL_GET_WORK_OVERVIEWS, {
        params: {
            email
        }
    })
}

export const getWrokDetails = (workId, email) => {
    return axios.get(URL_GET_WORK_DETAILS, {
        params: {
            workId,
            email
        }
    })
}

// =================================================================================================
// 


// 
// =================================================================================================
// APIS THAT ARE USED IN `WorkDetailView.jsx`

const URL_GET_MY_JUNIORS = `${WORKGROUP}/juniors`;
const URL_UPDATE_WORK = `${WORK}`;
const URL_WORK_DONE = `${WORK}/done`;
const URL_DELETE_WORK = `${WORK}`;

export const getMyJuniors = (workgroupId, userEmail) => {
    return axios.get(URL_GET_MY_JUNIORS, {
        params: {
            workgroupId,
            userEmail
        }
    })
}

export const updateWork = (toUpdate, updateValue, workId, updatedBy) => {
    let payload = new FormData()
    payload.append("toUpdate", toUpdate)
    payload.append("updateValue", updateValue)
    payload.append("workId", workId)
    payload.append("updatedBy", updatedBy)

    return axios.put(URL_UPDATE_WORK, payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
}

export const workDone = (workId, email) => {
    return axios.patch(URL_WORK_DONE, null, { // Send null as body since parameters are in query
        params: {
            workId,
            email
        }
    });
}

export const deleteWork = (workId, deletedBy) => {
    return axios.delete(URL_DELETE_WORK, {
        params: {
            workId,
            deletedBy
        }
    })
}

// =================================================================================================
// 


// 
// =================================================================================================
// APIS THAT ARE USED IN `CreateWorkForm.jsx`

const URL_GET_MY_WORKGROUPS_AND_JUNIORS = `${WORKGROUP}/workgroups_and_members`;
const URL_CREATE_NEW_WORK = `${WORK}`;

export const getMyWorkgroupsAndJuniors = (userEmail) => {
    return axios.get(URL_GET_MY_WORKGROUPS_AND_JUNIORS, {
        params: { userEmail }
    })
}

export const createNewWork = (title, description, createdBy, assignedTo, relatedWorkgroupId, priority, dueDate) => {
    const payload = new FormData();
    payload.append('title', title);
    payload.append('description', description);
    payload.append('createdBy', createdBy);
    payload.append('assignedTo', assignedTo);
    payload.append('relatedWorkgroupId', relatedWorkgroupId);
    payload.append('priority', priority.toLowerCase());
    payload.append('dueDate', dueDate);

    return axios.post(URL_CREATE_NEW_WORK, payload, {
        headers: { "Content-Type": "multipart/form-data" }
    })
}



// =================================================================================================
// 