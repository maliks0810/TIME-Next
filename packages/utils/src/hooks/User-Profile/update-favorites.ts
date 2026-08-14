import { UserInfo } from '../Authentication/user-info';

export const addToFavorites = (
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    linkBase: (any),
    userInfo: UserInfo
): UserInfo => {
    const favorites = [...(userInfo.favorites ?? [])]; 

    const index = favorites.findIndex((fav) => fav.title == linkBase.title);

    if (index < 0) {
        favorites?.push({ title: linkBase.title, url: linkBase.url, newTab: linkBase.newTab ?? true, clickCount: 1 });
    } else {
        favorites[index].clickCount++;
    }

    const newUserInfo = Object.assign({}, userInfo);
    newUserInfo.favorites = [...favorites];
    return newUserInfo;
};

// export const removeFavorite = (index: number, userInfo: UserInfo): UserInfo => {
//     if (!userInfo.favorites) {
//         return userInfo;
//     }

//     const newUserInfo = Object.assign({}, userInfo);
//     newUserInfo.favorites = [...(userInfo.favorites?.filter((v, i) => i != index) ?? [])];
//     return newUserInfo;
// };

// export const clearFavorites = (userInfo: UserInfo): UserInfo => {
//     const newUserInfo = Object.assign({}, userInfo);
//     newUserInfo.favorites = [];
//     return newUserInfo;
// };
