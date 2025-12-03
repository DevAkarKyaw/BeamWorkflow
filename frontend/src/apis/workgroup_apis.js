import axios from "axios";
import { USER, WORKGROUP } from "./urls";


// 
// =================================================================================================
// APIS THAT ARE USED IN `WorkgroupsDisplay.jsx`

const URL_UPDATE_WORKGROUP = `${WORKGROUP}`;
const URL_DELETE_WORKGROUP = `${WORKGROUP}`;
const URL_GET_WORKGROUP_OVERVIEWS = `${WORKGROUP}/overviews`;
const URL_GET_WORKGROUP_DETAILS = `${WORKGROUP}/details`;

export const getWorkgroupOverviews = (email) => {
    return axios.get(URL_GET_WORKGROUP_OVERVIEWS, {
        params: {
            userEmail: email
        }
    })
}

export const getWorkgroupDetails = (workgroupId) => {
    return axios.get(URL_GET_WORKGROUP_DETAILS, {
        params: {
            workgroupId
        }
    })
}

export const updateWorkgroup = (toUpdate, updateValue, workgroupId, updatedBy, password) => {
    const payload = new FormData();
    payload.append("toUpdate", toUpdate);
    payload.append("updateValue", updateValue);
    payload.append("workgroupId", workgroupId);
    payload.append("updatedBy", updatedBy);
    payload.append("password", password);

    return axios.put(URL_UPDATE_WORKGROUP, payload, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export const deleteWorkgroup = (workgroupId, deletedBy, password) => {
    return axios.delete(URL_DELETE_WORKGROUP, {
        params: {
            workgroupId,
            deletedBy,
            password,
        },
    });
}

// =================================================================================================
// 


// 
// =================================================================================================
// APIS THAT ARE USED IN `CreateWorkgroupForm.jsx`

const URL_CREATE_NEW_WORKGROUP = `${WORKGROUP}`;

export const createNewWorkgroup = (title, description, email) => {
    const payload = new FormData();
    payload.append("workgroupName", title);
    payload.append("description", description);
    payload.append("createdBy", email);

    return axios.post(URL_CREATE_NEW_WORKGROUP, payload, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

// =================================================================================================
// 


// 
// =================================================================================================
// APIS THAT ARE USED IN `MembersModal.jsx`

const URL_ADD_WORKGROUP_MEMBER = `${WORKGROUP}/new_member`;
const URL_GET_WORKGROUP_MEMBERS = `${WORKGROUP}/members`;
const URL_DELETE_WORKGROUP_MEMBER = `${WORKGROUP}/member`;

export const addMemberToWorkgroup = (workgroupId, memberEmail, addedBy, role) => {
    const payload = new FormData()
    payload.append('workgroupId', workgroupId)
    payload.append('memberEmail', memberEmail)
    payload.append('addedBy', addedBy)
    payload.append('role', role)

    return axios.post(URL_ADD_WORKGROUP_MEMBER, payload, {
        headers: { "Content-Type": "multipart/form-data" }
    })
}

export const getWorkgroupMembers = (workgroupId) => {
    return axios.get(URL_GET_WORKGROUP_MEMBERS, {
        params: {
            workgroupId
        }
    })
}

export const removeWorkgroupMember = (workgroupId, removedBy, emailToRemove) => {
    return axios.delete(URL_DELETE_WORKGROUP_MEMBER, {
        params: {
            workgroupId,
            removedBy,
            emailToRemove
        }
    })
}

// =================================================================================================
// 


// 
// =================================================================================================
// APIS THAT ARE USED IN `RelationsModal.jsx`

const URL_CREATE_USERS_RELATION = `${USER}/new_relation`;
const URL_GET_USERS_RELATIONS  = `${USER}/relations`;
const URL_GET_USERS_RELATION  = `${USER}/relation`;
const URL_DELETE_USERS_RELATION  = `${USER}/relation`;

export const addUsersRelation = (workgroupId, createdBy, seniorEmail, juniorEmail) => {
    const payload = new FormData();
    payload.append("workgroupId", workgroupId);
    payload.append("createdBy", createdBy);
    payload.append("seniorEmail", seniorEmail);
    payload.append("juniorEmail", juniorEmail);

    return axios.post(URL_CREATE_USERS_RELATION, payload, {
        headers: {"Content-Type": "multipart/form-data"} 
    })
}

export const getUsersRelations = (workgroupId, userEmail) => {
    return axios.get(URL_GET_USERS_RELATIONS, {
        params: {
            workgroupId,
            userEmail
        }
    })
}

export const getUsersRelation = (seniorEmail, juniorEmail) => {
    return axios.get(URL_GET_USERS_RELATION, {
        params: {
            seniorEmail,
            juniorEmail
        }
    })
}

export const removeUsersRelation = (relationId, relatedWorkgroupId, deletedBy) => {
    return axios.delete(URL_DELETE_USERS_RELATION, {
        params: {
            relationId,
            relatedWorkgroupId,
            deletedBy
        }
    })
}

// =================================================================================================
// 