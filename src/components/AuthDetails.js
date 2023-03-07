import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';

const AuthDetails = ({name}) => {
    return (
        <div className="authDetails">
            <div>Welcome</div>
            <div className="authName">{name}</div>
        </div>
    )
}

export default AuthDetails;