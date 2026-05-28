const UserReducer = (state, action) => {
    switch (action.type) {
        case "login":
            return action.payload;
        case "logout":
            return null; 
    }
    return state;
}

export default UserReducer;