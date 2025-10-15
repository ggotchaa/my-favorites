import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface IConfigAzureSimple{
  baseUrl:string,
  clientId:string
}
@Injectable({
  providedIn: 'root'
})

// Get json file from wwwwroot/assets/ at the azure service app
// Currently disabled, we use azureConfigPipeline to get data to angular CAL
export class ConfigAzureService {
    
    constructor(private http: HttpClient) {
    }
  
    getConfig():Promise<IConfigAzureSimple> {
      return this.http.get("/assets/config.json")
        .toPromise()
        .then(settings => {
          let config = <IConfigAzureSimple>settings;
          return config;
        });
    }
    
}
