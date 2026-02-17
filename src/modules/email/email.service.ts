import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { EMAIL_PURPOSE } from "@/bases/common/enums/email.enum";
import { mapEmailTemplateName } from "@/util/mapTemplateEmail";
@Injectable() 
export class EmailService 
{
    constructor(private mailerService: MailerService) {}
    async sendEmail(type : EMAIL_PURPOSE, toEmail : string, payload : any  , subject : string = '') 
    {
        try 
        {
            console.log(payload) 
            await this.mailerService.sendMail({
                to: toEmail,
                subject,
                template: `./${mapEmailTemplateName(type)}`,
                context: payload 
            });

        }
        catch (err) {
            console.log(err) 
        }
  }
    
}