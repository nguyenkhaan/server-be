import { ROLES_KEY } from "@/bases/decorators/role.decorator";
import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
@Injectable() 
export class RoleGuards implements CanActivate
{
    constructor(private reflector : Reflector) {} 
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.get(ROLES_KEY , context.getHandler()) 
        if (!requiredRoles) return true 
        const req = context.switchToHttp().getRequest() 
        const user = req.user 
        if (!user || !Array.isArray(user.roles)) return false;
        return user.roles.some((role: string) =>
            requiredRoles.includes(role)
        )
    }
}