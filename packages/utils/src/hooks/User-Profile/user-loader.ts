import { useEffect, useRef } from 'react';
import { useUpdateUserInfo } from '../Authentication/user-info-context';
import { useOktaUserInfo } from '../Authentication/user-info-from-token';
import { useUserFavorites } from './user-favs';

// import { useUserAuthorizations } from '../Authorization/user-authorizations';

//getUserInfoFromOkta, loadUserFavorites, and getUserAuthorizations could probably
//(should probably?) all be custom hooks. loadUserFavorites and getUserAuthorizations
//are being used as an example of the possibility of calling gql queries in a
//utility function

export function UserLoader(props: {
    children: React.ReactElement | null;
}): React.ReactElement | null {
    const updateUserInfo = useRef(useUpdateUserInfo());
    const favs = useRef(useUserFavorites());
    // const auths = useRef(useUserAuthorizations());
    const info = useRef(useOktaUserInfo());
    //Notice here the use of useRef. This basically tells React
    //that the value passed to useRef is not expected to change.
    //This allows the values to then be used inside of useEffect
    //(or other hooks that have a dependency list) without the
    //need to include the variable in the dependency list. This
    //is because it is understood that the value is not intended
    //to change.
    //If useRef was not used for the following variables, we may
    //run into infinite loop scenarios because they would then
    //need to be included in the dependency array, which would
    //cause the useEffect to be triggered on every rerender. 
    //(an infinite loop scenario shouldn't really be an issue 
    //here because the UserLoader functional component won't get
    //re-rendered)

    useEffect(() => {
        console.log('Loading user data');

        //The .then block is used to load the favs and auths because it
        //guarantees an actual userInfo instance that has the needed 
        // data already loaded.
        info.current.get()
        .then(async (userInfo) => {
            console.log('User info loaded. Loading authorizations');
            // userInfo.authorizations = await auths.current.get();
            // console.log('Loading favorites');
            userInfo.favorites = await favs.current.get(userInfo.login ?? '');
            console.log(userInfo.favorites)
            console.log('setting user info context');
            updateUserInfo.current(userInfo);            
        })
        .catch((err) => {
            console.log("An unexpected error occurred while loading user info: ", err);
        })
        
    }, []);

    return props.children;
}
