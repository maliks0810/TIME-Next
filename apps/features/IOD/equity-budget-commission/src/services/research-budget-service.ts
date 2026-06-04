import CustomStore from 'devextreme/data/custom_store'
import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils'
import { ResearchBudget, RequestResearchBudget } from '../datatypes/research-budget-types';
import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info';

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndPoint = apiBaseUrl+'/research-budget';

type CallBackDataSetter = React.Dispatch<React.SetStateAction<ResearchBudget[]>>;

export const researchBudgetDataService = (setDataCallback:CallBackDataSetter, userData:UserInfo, budgetYear:number, divisionId:number) => {
    const userInfo = userData;
    let currentBudgetData: ResearchBudget[] = [];

    let url = `${apiEndPoint}/${budgetYear}`;
    if(divisionId > 0)
        url += `?divisionId=${divisionId}`;
    
    return new CustomStore({
        key: 'composite_Id', // Specify your unique key field
        cacheRawData: false, // Disable caching

        load: async () => {
            if(!budgetYear || budgetYear == 0) return null;
            try {
                const response = await fetch(url,{cache: "no-store"});
                if(!response.ok)
                {
                    throw new Error(`Load Data error ${response.status}`);
                }

                const data = await response.json()
                currentBudgetData =data;
                if(divisionId > 0)
                {    
                    const filteredData = currentBudgetData.filter(d=> d.divisionId === divisionId);
                    setDataCallback(filteredData);   
                    return filteredData;     
                }   
                else
                    setDataCallback(currentBudgetData);           
                return data;

            } catch (error) {
                throw new Error('Load error: ' + error);
            }            
        },
        insert: async (values) => {    
            const addDto: RequestResearchBudget= {
                composite_Id: "",
                budgetYear: budgetYear,
                division: values["division"]!= undefined? values["division"]:"",
                divisionId: values["divisionId"]!= undefined && values["divisionId"] > 0 ? values["divisionId"]:0,
                masterBroker: values["masterBroker"]!= undefined? values["masterBroker"]:"",
                mBkrCode: values["mBkrCode"]!= undefined? values["mBkrCode"]:"",
                masterBrokerId: values["masterBrokerId"]!= undefined ? values["masterBrokerId"]:"",
                quarter_One_Id: values["quarter_One_Id"]!= undefined && values["quarter_One_Id"] > 0 ? values["quarter_One_Id"]:0,
                quarter_Two_Id: values["quarter_Two_Id"]!= undefined && values["quarter_Two_Id"] > 0 ? values["quarter_Two_Id"]:0,
                quarter_Three_Id: values["quarter_Three_Id"]!= undefined && values["quarter_Three_Id"] > 0 ? values["quarter_Three_Id"]:0,
                quarter_Four_Id: values["quarter_Four_Id"]!= undefined && values["quarter_Four_Id"] > 0 ? values["quarter_Four_Id"]:0,
                quarterOne: values["quarterOne"]!= undefined && values["quarterOne"] > 0 ? values["quarterOne"]:0,
                quarterTwo: values["quarterTwo"]!= undefined && values["quarterTwo"] > 0 ? values["quarterTwo"]:0,
                quarterThree: values["quarterThree"]!= undefined && values["quarterThree"] > 0 ? values["quarterThree"]:0,
                quarterFour: values["quarterFour"]!= undefined && values["quarterFour"] > 0 ? values["quarterFour"]:0,
                total: values["total"]!= undefined && values["total"] > 0 ? values["total"]:0,
                lastUpdateBy: userInfo.name??""
            }        
            try {
                const response = await fetch(apiEndPoint, {
                    method: 'POST',
                    cache: "no-store",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(addDto),
                });
                
                if (!response.ok) {  
                    throw new Error(`Server responded with status ${response.status}`);  
                } 
                const data = response.json();
                 return data;
            } catch (error) {
                throw new Error('Insert error: ' + error);
            }            
        },
        update: async (key, values) => {
            const originalData: ResearchBudget|undefined = currentBudgetData.find(d=> d.composite_Id == key);            
            const updateDto: RequestResearchBudget= {
                composite_Id: key,
                budgetYear: budgetYear,
                division: values["division"]!= undefined? values["division"]:originalData?.division,
                divisionId: values["divisionId"]!= undefined && values["divisionId"] > 0 ? values["divisionId"]:originalData?.divisionId,
                masterBroker: values["masterBroker"]!= undefined? values["masterBroker"]:originalData?.masterBroker,
                mBkrCode: values["mBkrCode"]!= undefined? values["mBkrCode"]:originalData?.mBkrCode,
                masterBrokerId: values["masterBrokerId"]!= undefined ? values["masterBrokerId"]:originalData?.masterBrokerId,
                quarter_One_Id: values["quarter_One_Id"]!= undefined && values["quarter_One_Id"] > 0 ? values["quarter_One_Id"]:originalData?.quarter_One_Id,
                quarter_Two_Id: values["quarter_Two_Id"]!= undefined && values["quarter_Two_Id"] > 0 ? values["quarter_Two_Id"]:originalData?.quarter_Two_Id,
                quarter_Three_Id: values["quarter_Three_Id"]!= undefined && values["quarter_Three_Id"] > 0 ? values["quarter_Three_Id"]:originalData?.quarter_Three_Id,
                quarter_Four_Id: values["quarter_Four_Id"]!= undefined && values["quarter_Four_Id"] > 0 ? values["quarter_Four_Id"]:originalData?.quarter_Four_Id,
                quarterOne: values["quarterOne"]!= undefined && values["quarterOne"] > 0 ? values["quarterOne"]:originalData?.quarterOne,
                quarterTwo: values["quarterTwo"]!= undefined && values["quarterTwo"] > 0 ? values["quarterTwo"]:originalData?.quarterTwo,
                quarterThree: values["quarterThree"]!= undefined && values["quarterThree"] > 0 ? values["quarterThree"]:originalData?.quarterThree,
                quarterFour: values["quarterFour"]!= undefined && values["quarterFour"] > 0 ? values["quarterFour"]:originalData?.quarterFour,
                total: values["total"]!= undefined && values["total"] > 0 ? values["total"]:originalData?.total,
                lastUpdateBy: userInfo.name??""
            }
            try {
                const response = await fetch(apiEndPoint, {
                    method: 'PUT',
                    cache: "no-store",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateDto),
                });

                if (!response.ok) {  
                    throw new Error(`Server responded with status ${response.status}`);  
                } 
                const data = response.json();
                return data;
            } catch (error) {
                throw new Error('Update error: ' + error);
            }
        },
        remove: async (key): Promise<void> => {
            try {
                const originalData: ResearchBudget|undefined = currentBudgetData.find(d=> d.composite_Id == key);
                await fetch(apiEndPoint, {
                    method: 'DELETE',
                    cache: "no-store", 
                     headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(originalData),           
                })
                .then(handleErrors)            
                .then(() => {});
            } catch (error) {
                if (error instanceof Error) {  
                    throw new Error('Delete error: ' + error.message);  
                }
            }            
        },
    });
};