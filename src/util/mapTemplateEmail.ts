import { EMAIL_PURPOSE } from "@/bases/common/enums/email.enum";

export function mapEmailTemplateName(type : EMAIL_PURPOSE) 
{
    switch (type) 
    {
        case EMAIL_PURPOSE.REGISTER : case EMAIL_PURPOSE.RESET_PASSWORD:  return 'sendotp'  
    }
    return '' 
}