export interface UserFavorite extends LinkInfoBase {
    title: string,
    url: string,
    newTab: boolean,
    clickCount: number
}