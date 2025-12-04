# Sidebar Dinámico Angular

Este proyecto implementa un sidebar dinámico que permite seleccionar el tipo de usuario (Cliente, Restaurante, Administrador, Conductor) y muestra los enlaces correspondientes para cada tipo. La lógica está centralizada en el componente `SlideBar`.

## ¿Cómo funciona?

- Al iniciar, el sidebar muestra botones para seleccionar el tipo de usuario.
- Al seleccionar un tipo, se actualizan los enlaces (`links`) y se navega automáticamente a la vista principal de ese usuario.
- Los enlaces se definen en el método `selectUserType` dentro de `slide-bar.ts`.
- Cada tipo de usuario tiene su propio arreglo de enlaces, por ejemplo:
  - **Cliente**: Inicio, Pedidos, Carrito, Perfil
  - **Restaurante**: Inicio, Pedidos, Menú, Perfil
  - **Administrador**: Panel, Usuarios, Reportes, Configuración
  - **Conductor**: Inicio, Pedidos, Mi Moto, Perfil

## ¿Cómo agregar un botón/enlace a un tipo de usuario?

1. Abre el archivo `slide-bar.ts`.
2. Busca el método `selectUserType(type: string)`.
3. Dentro del bloque correspondiente al tipo de usuario (por ejemplo, `if (type === 'client')`), agrega un nuevo objeto al arreglo `this.links`:

```typescript
this.links = [
  { label: 'Inicio', route: '/dashboard/client' },
  { label: 'Pedidos', route: '/dashboard/client/orders' },
  { label: 'Carrito', route: '/dashboard/client/cart' },
  { label: 'Perfil', route: '/dashboard/client/profile' },
  { label: 'Nuevo Botón', route: '/dashboard/client/nueva-vista' } // <-- Agrega aquí
];
```

4. Si necesitas una nueva vista, crea el componente y la ruta correspondiente en el archivo de rutas (`app.routes.ts`).
5. El sidebar actualizará automáticamente los enlaces y la navegación al seleccionar el tipo de usuario.

## ¿Cómo agregar un nuevo tipo de usuario?

1. Agrega el nuevo tipo en el arreglo `userTypes`:
```typescript
userTypes = [
  { label: 'Cliente', value: 'client' },
  { label: 'Restaurante', value: 'restaurant' },
  { label: 'Administrador', value: 'admin' },
  { label: 'Conductor', value: 'driver' },
  { label: 'NuevoTipo', value: 'nuevo' } // <-- Agrega aquí
];
```
2. Agrega un nuevo bloque en `selectUserType` para definir los enlaces y navegación de ese tipo.

## Resumen
- Toda la lógica de los enlaces está en `slide-bar.ts`.
- El template (`slide-bar.html`) muestra los enlaces según el tipo seleccionado.
- Para agregar o modificar botones, solo actualiza el arreglo de enlaces en el método correspondiente.

---

Cualquier cambio futuro en los botones o vistas de usuario se realiza editando el método `selectUserType` y el arreglo `userTypes` en `slide-bar.ts`.
