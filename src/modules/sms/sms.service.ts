import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import twilio , {Twilio} from "twilio";
import axios from "axios";
@Injectable() 
export class SmsService 
{
    private client : Twilio
    constructor(
        private configService : ConfigService
    ) {
        //Twilio 
        const sid = this.configService.get<string>("TWILIO_ACCOUNT_SID");
        const token = this.configService.get<string>("TWILIO_AUTH_TOKEN");
        this.client = twilio(sid!, token!);


    } 
    /* Use for twilio (production)
    async sendSms(to : string , message : string) 
    {
        console.log('Dang send') 
        return this.client.messages.create({
            body: message, 
            from: this.configService.get<string>("TWILIO_PHONE_NUMBER"),
            to 
        })
    }
    */
    async sendSms(to : string , message : string) 
    {
        //EasySMS 
        const brandName = this.configService.get<string>("EASYSMS_BRAND_NAME") 
        const apiKey = this.configService.get<string>("EASYSMS_API_KEY")

        const results = await axios.post('https://restapi.easysendsms.app/v1/rest/sms/send' , {
            from: brandName, 
            to, 
            text: message, 
            type: 1
        } , {
            headers: {
                'apikey': apiKey, 
                'Content-Type': 'application/json', 
                'Accept': 'application/json'
            }
        })
        console.log(results)
    }
}