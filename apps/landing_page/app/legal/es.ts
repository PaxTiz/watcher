import type { LegalContent, LegalInfo } from "~/utils/legal";

export default (info: LegalInfo): LegalContent => ({
  privacy: {
    title: "Política de privacidad",
    description:
      "Los datos que recoge Watcher, por qué, cuánto tiempo se conservan y cómo eliminarlos.",
    intro:
      "Watcher reúne sus suscripciones de YouTube y Twitch en un solo feed. Para ello necesita un mínimo de datos, y solo esos. Esta página explica cuáles, qué hacemos con ellos y cómo usted mantiene el control.",
    sections: [
      {
        title: "Quién es responsable de sus datos",
        blocks: [
          `El responsable del tratamiento es ${info.publisher}, ${info.address}. Para cualquier pregunta sobre sus datos, escriba a [${info.email}](mailto:${info.email}).`,
        ],
      },
      {
        title: "Los datos que recogemos",
        blocks: [
          "Cuando usted inicia sesión y usa Watcher, guardamos:",
          [
            "su cuenta: el nombre visible de su perfil de Google o Twitch, el identificador de esa cuenta en el proveedor y las fechas de creación y de último inicio de sesión;",
            "los accesos concedidos por Google y Twitch (tokens OAuth), cifrados con AES-256-GCM; solo sirven para leer sus suscripciones;",
            "sus suscripciones: la lista de canales de YouTube a los que está suscrito y de canales de Twitch que sigue;",
            "su uso de Watcher: sus favoritos, los canales y vídeos que ha ocultado y su posición de reproducción en cada vídeo;",
            "sus passkeys, si crea alguna: la clave pública, el nombre que les da, el tipo de dispositivo y las fechas de uso. Su clave privada y sus datos biométricos nunca salen de su dispositivo;",
            "sus sesiones: el navegador utilizado (user agent) y las fechas de inicio de sesión y de actividad;",
            "su dirección IP, de forma temporal, para limitar los intentos de inicio de sesión abusivos;",
            "registros técnicos (peticiones, errores), vinculados a su identificador de Watcher, para diagnosticar problemas.",
          ],
          "Twitch también envía su dirección de email al iniciar sesión: Watcher no la conserva.",
        ],
      },
      {
        title: "Lo que no hacemos",
        blocks: [
          [
            "Watcher no tiene ninguna contraseña que pedirle y no guarda ninguna.",
            "Watcher no publica, no modifica nada y no se suscribe a nada en sus cuentas de YouTube o Twitch: el acceso es de solo lectura.",
            "Sin publicidad, sin rastreadores publicitarios, sin herramientas de analítica de terceros.",
            "Sus datos no se venden, no se alquilan y no se comparten con fines comerciales.",
          ],
        ],
      },
      {
        title: "Para qué los usamos",
        blocks: [
          [
            "Para que el servicio funcione, es decir, mostrar su feed, sus favoritos y retomar sus vídeos donde los dejó: es la ejecución del servicio que usted solicita al crear su cuenta.",
            "Para proteger su cuenta y el servicio (sesiones revocables, limitación de intentos, registros de errores): es nuestro interés legítimo en proteger Watcher y a sus usuarios.",
          ],
        ],
      },
      {
        title: "Datos de Google y YouTube",
        blocks: [
          "Watcher utiliza los servicios de API de YouTube. Con Google, pide dos permisos: acceso de solo lectura a su cuenta de YouTube (para obtener sus suscripciones) y su perfil básico (para su nombre).",
          "El uso y la transferencia a cualquier otra aplicación de la información recibida de las API de Google cumplen la [Política de datos de usuario de los servicios de API de Google](https://developers.google.com/terms/api-services-user-data-policy), incluidos los requisitos de uso limitado.",
          "Al usar Watcher, usted también acepta las [Condiciones de servicio de YouTube](https://www.youtube.com/t/terms). Google trata sus datos según su [Política de privacidad](https://policies.google.com/privacy).",
          "Puede retirar el acceso de Watcher en cualquier momento desde la página de [permisos de su cuenta de Google](https://myaccount.google.com/permissions) y, en Twitch, desde sus [conexiones de Twitch](https://www.twitch.tv/settings/connections).",
        ],
      },
      {
        title: "Servicios de terceros",
        blocks: [
          [
            "YouTube (Google) y Twitch, para obtener sus suscripciones y los vídeos de los canales que sigue.",
            "El reproductor de YouTube integrado, servido desde youtube-nocookie.com: cuando usted reproduce un vídeo de YouTube, Google recibe su dirección IP y puede instalar sus propias cookies.",
            "Los vídeos de Twitch pasan por el servidor de Watcher: Twitch no recibe su dirección IP cuando usted los ve.",
            "Las miniaturas y logotipos de los canales se copian en el almacenamiento de Watcher: su navegador no los carga desde YouTube ni Twitch.",
            `El alojamiento corre a cargo de ${info.host}, ${info.host_address}.`,
          ],
        ],
      },
      {
        title: "Cookies y almacenamiento local",
        blocks: [
          "Watcher solo usa cookies necesarias para su funcionamiento, que no requieren consentimiento:",
          [
            "una cookie de sesión, cifrada, que mantiene su sesión iniciada;",
            "una cookie que recuerda su idioma;",
            "el almacenamiento local de su navegador, que recuerda su tema (claro u oscuro).",
          ],
        ],
      },
      {
        title: "Cuánto tiempo los conservamos",
        blocks: [
          [
            "Su cuenta, suscripciones, favoritos y progresos: mientras exista su cuenta.",
            "Las sesiones: 7 días como máximo, o hasta que cierre sesión.",
            "Las direcciones IP usadas para limitar intentos: una hora como máximo.",
            "Los registros técnicos: unos 30 días.",
          ],
          "Cuando usted elimina su cuenta desde los ajustes de la app, Watcher revoca sus accesos en Google y Twitch y después borra su cuenta, sus accesos, sesiones, passkeys, favoritos, elementos ocultos y progresos. Los canales y vídeos públicos, comunes a todos los usuarios, no son datos personales y se mantienen.",
        ],
      },
      {
        title: "Sus derechos",
        blocks: [
          `Conforme al RGPD, usted puede acceder a sus datos, rectificarlos, suprimirlos, solicitar su portabilidad, limitar su tratamiento u oponerse a él. La eliminación está disponible directamente en los ajustes de la app; para todo lo demás, escriba a [${info.email}](mailto:${info.email}).`,
          "Si considera que no se respetan sus derechos, puede presentar una reclamación ante la [CNIL](https://www.cnil.fr/fr/plaintes), la autoridad francesa de protección de datos, o ante la autoridad de su país.",
        ],
      },
      {
        title: "Seguridad",
        blocks: [
          "Los accesos de Google y Twitch están cifrados, las sesiones pueden revocarse en cualquier momento desde los ajustes y las acciones sensibles (eliminar la cuenta, vincular o desvincular un servicio, gestionar sus passkeys) requieren una autenticación reciente.",
        ],
      },
      {
        title: "Edad mínima",
        blocks: [
          "Watcher está dirigido a personas de 15 años o más. Por debajo de esa edad, se necesita el consentimiento de un padre, madre o tutor.",
        ],
      },
      {
        title: "Cambios",
        blocks: [
          "Esta política puede cambiar con el servicio. La fecha de actualización en la parte superior de la página indica la última versión; ante cualquier cambio importante, se le informará en la app.",
        ],
      },
    ],
  },

  terms: {
    title: "Condiciones de uso",
    description: "Las normas de uso de Watcher y el aviso legal del sitio.",
    intro:
      "Estas condiciones regulan el uso de Watcher, la app y este sitio. Al crear una cuenta, usted las acepta. Están escritas para leerse: si algo no está claro, escríbanos.",
    sections: [
      {
        title: "El servicio",
        blocks: [
          "Watcher reúne en un solo feed los vídeos y directos de los canales de YouTube y Twitch que usted sigue, con un único reproductor, favoritos y la posibilidad de retomar la reproducción.",
          "Watcher es gratuito. Más adelante podrán ofrecerse funciones de pago; se presentarán claramente como tales y no se le cobrará nada sin su consentimiento explícito.",
        ],
      },
      {
        title: "Su cuenta",
        blocks: [
          "Usted inicia sesión con Google, Twitch o una passkey. Es responsable del acceso a esas cuentas y de lo que se haga desde su sesión. Si cree que alguien usa su cuenta, revoque sus sesiones desde los ajustes y escríbanos.",
          "Puede eliminar su cuenta en cualquier momento desde los ajustes de la app.",
        ],
      },
      {
        title: "Uso aceptable",
        blocks: [
          "Al usar Watcher, usted se compromete a no:",
          [
            "eludir los límites técnicos del servicio ni intentar acceder a los datos de otros usuarios;",
            "extraer datos de Watcher de forma masiva por medios automatizados;",
            "usar Watcher para descargar, redistribuir o explotar comercialmente los contenidos de los creadores;",
            "perturbar el funcionamiento del servicio o de sus proveedores.",
          ],
          "En caso de incumplimiento, el acceso a la cuenta afectada puede suspenderse o eliminarse.",
        ],
      },
      {
        title: "Contenidos de los creadores",
        blocks: [
          "Los vídeos, directos, miniaturas y nombres de canales que se muestran en Watcher pertenecen a sus creadores y siguen sujetos a las condiciones de YouTube y Twitch. Watcher solo los muestra para usted; no reclama ningún derecho sobre ellos.",
          "Watcher no está afiliado a Twitch Interactive ni a YouTube LLC, ni cuenta con su respaldo. Al usar Watcher, usted también acepta las [Condiciones de servicio de YouTube](https://www.youtube.com/t/terms) y las [Condiciones de servicio de Twitch](https://www.twitch.tv/p/legal/terms-of-service/).",
        ],
      },
      {
        title: "Disponibilidad",
        blocks: [
          "Watcher hace lo posible por estar disponible y al día, pero depende de YouTube y Twitch: un vídeo puede aparecer con algo de retraso y una función puede dejar de funcionar si alguno de ellos cambia sus normas. El servicio puede evolucionar, interrumpirse por mantenimiento o cerrar; en este último caso, se le avisará con antelación en la medida de lo posible.",
        ],
      },
      {
        title: "Responsabilidad",
        blocks: [
          "Watcher se ofrece tal cual. En los límites que permite la ley, el editor no se hace responsable de las interrupciones del servicio, de los contenidos publicados por los creadores ni de las decisiones de YouTube o Twitch.",
        ],
      },
      {
        title: "Datos personales",
        blocks: [
          "La forma en que Watcher trata sus datos se describe en la [política de privacidad](privacy).",
        ],
      },
      {
        title: "Cambios y ley aplicable",
        blocks: [
          "Estas condiciones pueden cambiar; ante cualquier cambio importante, se le informará en la app. Se rigen por la ley francesa. En caso de litigio, se buscará primero una solución amistosa; en su defecto, serán competentes los tribunales franceses.",
          "Estas condiciones existen en varios idiomas; en caso de diferencia, prevalece la versión francesa.",
        ],
      },
      {
        title: "Aviso legal",
        blocks: [
          [
            `Editor: ${info.publisher}, ${info.status}, ${info.address}. ${info.siret}.`,
            `Director de la publicación: ${info.publisher}.`,
            `Contacto: [${info.email}](mailto:${info.email}).`,
            `Alojamiento: ${info.host}, ${info.host_address}.`,
          ],
        ],
      },
    ],
  },
});
