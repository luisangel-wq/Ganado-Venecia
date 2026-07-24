# Configurar Firebase Storage para las fotos

Las fotos ahora se guardan en **Firebase Storage** (no dentro de la base de datos como
antes). Esto hace la sincronización mucho más rápida y liviana. La app ya está lista;
solo falta **activar Storage** y **poner las reglas** una sola vez en la consola de Firebase.

> Mientras no hagas esto, la app **sigue funcionando igual que antes** (fotos en base64).
> En cuanto lo actives, las fotos existentes se suben solas a Storage en segundo plano.

## Pasos (una sola vez)

1. Entra a la consola: https://console.firebase.google.com/project/ganado-venecia/storage
2. Si ves un botón **"Comenzar" / "Get started"**, haz clic. Acepta las reglas por defecto
   y elige la ubicación (deja la que sugiere). Esto crea el bucket
   `ganado-venecia.firebasestorage.app` (el que ya está en la configuración).
3. Ve a la pestaña **"Rules" / "Reglas"** dentro de Storage.
4. Borra lo que haya y pega exactamente esto (también está en el archivo `storage.rules`):

   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /photos/{allPaths=**} {
         allow read, write: if true;
       }
       match /{allPaths=**} {
         allow read, write: if false;
       }
     }
   }
   ```

5. Haz clic en **"Publicar" / "Publish"**.

Listo. La próxima vez que cada dispositivo abra la app (con internet), las fotos
empezarán a subirse a Storage automáticamente.

## Cómo saber que funciona

- Abre la app en el computador con la consola del navegador (F12).
- Deberías ver: `🗄️ Firebase Storage available for photos` y luego
  `✅ Uploaded N photo(s) to Firebase Storage` a medida que migran.
- En la consola de Firebase → Storage → verás una carpeta `photos/`.

## Notas

- **Seguridad:** igual que la base de datos actual, las fotos quedan accesibles para
  cualquiera que tenga el enlace (no hay login). Es el mismo nivel de acceso que ya tenías.
- **Sin internet:** puedes tomar fotos en la finca sin señal; se guardan en el teléfono y
  se suben solas cuando haya internet.
- **Ver fotos sin internet:** una foto que ya se subió a Storage necesita internet para
  verse (el teléfono ya no guarda la copia pesada para ahorrar espacio). Las fotos recién
  tomadas y aún no subidas sí se ven sin internet.
