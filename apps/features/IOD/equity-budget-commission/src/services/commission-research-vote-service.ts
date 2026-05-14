import CustomStore from 'devextreme/data/custom_store'
import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils'
import { CommissionResearchVote } from '../datatypes/tcw-commission-types';
import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info';

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndPoint = apiBaseUrl+'/tcw-commission';

type CallBackDataSetter = React.Dispatch<React.SetStateAction<CommissionResearchVote[]>>;

export const commResearchVoteDataService = (setDataCallback:CallBackDataSetter, userData:UserInfo, budgetYear:number, divCode:string|undefined) => {
    const userInfo = userData;
    let currentResearchData: CommissionResearchVote[] = [];
    let url = `${apiEndPoint}/${budgetYear}`;    
    
    return new CustomStore({
        key: '', // Specify your unique key field
        cacheRawData: false, // Disable caching

        load: async () => {            
            return fetch(url,{cache: "no-store"})
            .then(async response => {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const data = await response.json()
                currentResearchData =data;
                if(divCode != undefined)
                {    
                    const filteredData = currentResearchData.filter(d=> d.divCode === divCode);
                    setDataCallback(filteredData);   
                    return filteredData;     
                }   
                else
                    setDataCallback(currentResearchData);           
                return data;
            })
            .catch(error => { throw new Error('Load error: ' + error); });
        },
        insert: async (values) => {    
                  
            return fetch(apiEndPoint, {
                method: 'POST',
                cache: "no-store",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
                })
                .then(response => response.json())
                .then(data => {                
                    return data; // Return the inserted data
                })
                .catch(error => { throw new Error('Insert error: '+ userInfo.name + error); });
        },
        update: async (key, values) => {           

            return fetch(apiEndPoint, {
                method: 'PUT',
                cache: "no-store",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
                })
                .then(response => response.json())
                .then(data => {
                    return data; // Return the updated data
                })
                .catch(error => { throw new Error(`Update error for Id:${key}- ${error}`); });
        },
        remove: async (key): Promise<void> => {
            return fetch(apiEndPoint+`/${key}`, {
                method: 'DELETE',
                cache: "no-store",            
                })
                .then(handleErrors)            
                .then(() => {});
        },
    });
};