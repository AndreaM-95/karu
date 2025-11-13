import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import {ROLES_KEY} from "../roles.decorator";
/**
 * RolesGuard:
 * Verifica si el usuario tiene los roles necesarios para acceder
 * a una ruta protegida mediante el decorador @Roles().
 */
@Injectable()
export class RolesGuard implements CanActivate{
    /**
     * Constructor:
     * Inyecta Reflector para obtener los metadatos de roles
     * definidos en controladores o métodos.
     * @param reflector - Permite leer los metadatos de @Roles().
     */
    constructor (private reflector:Reflector){}
    /**
     * Método canActivate:
     * Evalúa si el usuario autenticado posee un rol permitido.
     * @param context - Contexto de ejecución actual (request HTTP).
     * @returns true si el acceso es autorizado.
     * @throws ForbiddenException si el usuario no está autenticado
     * o su rol no tiene permisos.
     */
    canActivate(context:ExecutionContext):boolean{
        const requiredRoles=this.reflector.getAllAndOverride<string[]>(ROLES_KEY,[
            context.getHandler(), 
            context.getClass(),
        ])

        console.log('=== ROLES GUARD DEBUG ===');
        console.log('ROLES_KEY:', ROLES_KEY);
        console.log('Roles requeridos:', requiredRoles);
        console.log('Tipo de requiredRoles:', typeof requiredRoles, Array.isArray(requiredRoles));
        
        if(!requiredRoles){return true}; 

        const {user}=context.switchToHttp().getRequest();
        
        console.log('Usuario completo:', user);
        console.log('Rol del usuario:', user?.role);
        console.log('Tipo de user.role:', typeof user?.role);
        console.log('¿Incluye?:', requiredRoles.includes(user?.role));
        console.log('Comparación individual:');
        requiredRoles.forEach(r => console.log(`  "${r}" === "${user?.role}":`, r === user?.role));
        console.log('========================');
        
        if(!user){throw new ForbiddenException("El usuario no está autenticado en el sistema")}

        if(!requiredRoles.includes(user.role)){
            throw new ForbiddenException("Su rol en el sistema no tiene acceso a este servicio")
        }
        return true;
    }
}