import AsyncStorage from "@react-native-async-storage/async-storage"


export type configuration={
    accessKey:string,secretKey:string
    bucketName:string,region:string
}

export const saveConfig = async(serviceName:string,config?:configuration,blobSasUrl?:string) => {
    if(serviceName === 'azure'){
        if (blobSasUrl) {
            await AsyncStorage.setItem(`${serviceName}_config`, JSON.stringify(blobSasUrl));
        }
    }else{
    await AsyncStorage.setItem(`${serviceName}_config`, JSON.stringify(config))
    }
}
export const getConfig = async (serviceName:string) => {
    let data;
    const config = await AsyncStorage.getItem(`${serviceName}_config`)
    if(config){
        data =  JSON.parse(config);
        
    return data
    }
    return data
}
