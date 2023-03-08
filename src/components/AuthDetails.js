import React from 'react';

const AuthDetails = ({name}) => {
    return (
        <div className="authDetails">
            <div>Welcome</div>
            <div className="authName">{name}</div>
        </div>
    )
}

export default AuthDetails;