import React, { useReducer } from 'react';
import { MyUserContext, MyDispatchContext } from '../contexts/MyUserContext';
import UserReducer from '../reducers/UserReducer';

const AppProvider = ({ children }) => {
    const [user, dispatch] = useReducer(UserReducer, null);

    return (
        <MyDispatchContext.Provider value={dispatch}>
            <MyUserContext.Provider value={user}>
                {children}
            </MyUserContext.Provider>
        </MyDispatchContext.Provider>
    );
};


export default AppProvider;