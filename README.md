# Guía de Proyectos Básicos en Azure IoT para Interconectar, Monitorear y Controlar Dispositivos

Luis Garreta

## Resumen 
El objetivo de esta guía es la de mostrar a través de cuatro 
proyectos la forma básica para interconectar y manejar 
dispositivos en la nube de Azure IoT. Los proyectos se 
desarrollan de una manera incremental, iniciando con un 
dispositivo simulado en un programa de computador hasta terminar 
en un solución que involucra hardware y sensores reales. En el 
primer proyecto partimos de un desarrollo de un sistema simple 
que envía y recibe mensajes de eventos. En el segundo, 
adicionamos al desarrollo anterior un componente de análisis de 
transmisiones que revisa los eventos que están llegando a la nube 
y filtra los que pueden ser posibles alarmas. En el tercero, 
adicionamos un componente conocido como worker role que de 
acuerdo a las alarmas envía comandos hacia los dispositivos y 
también mensajes a una cuenta de twitter. Y en el cuarto proyecto 
cambiamos los dispositivos simulados por dispositivos reales 
usando una tarjeta Intel Edison y los sensores de un kit de 
inicio Grove (Grove Starter Kit - Intel IoT Edition (https://www.seeedstudio.com/Grove-starter-kit-plus-Intel-IoT-Edition-for-Intel-Galileo-Gen-2-and-Edison-p-1978.html).

## Programación en Azure IoT
En los proyectos que describimos a continuación, utilizamos 
principalmente el lenguaje node.js (https://nodejs.org/en/), 
debido a su facilidad de programación; amplio soporte tanto de 
Azure IoT como de distintos fabricantes de hardware; y finalmente 
por su modelo de programación orientado a eventos que se ajusta 
con la forma como los dispositivos generan y reciben eventos e 
interactúan con la nube en una aplicación IoT. 

Azure IoT ofrece distintos recursos o SDKs para diferentes 
lenguajes de programación, entre ellos C#, C, Java, y node.js (https://github.com/Azure/azure-iot-sdks
). Sin embargo, aunque todos los lenguajes permiten programar 
este tipo de aplicaciones, la mayoría de los que soporta Azure 
IoT no están orientados directamente hacia la programación 
orientada a eventos, excepto node.js. Este lenguaje es soportado 
ampliamente por Azure IoT y por otros proveedores de servicios 
IoT como IBM Watson IoT (https://github.com/ibm-watson-iot/iot-nodejs
), Google IoT (https://cloud.google.com/nodejs/), y actualmente 
es usado en muchos otros proyectos de IoT, robótica, y de manejo 
de hardware (http://www.postscapes.com/javascript-and-the-internet-of-things/
). 

En general, la programación de IoT está orientada principalmente 
hacia el manejo de eventos que producen los diferentes 
dispositivos y que también llegan desde la nube. Para que los 
dispositivos se conecten con Azure IoT lo primero que se debe 
obtener son las diferentes cadenas o strings de conexión que dan 
permiso para acceder a los distintos recursos de Azure IoT. Una 
vez se tienen estos strings, se establece la conexión con Azure 
IoT, se configura la conexión con el hardware (dispositivos 
físicos), se crean los clientes de IoT, y se crean las directivas 
para reaccionar tanto a los eventos de los dispositivos como a 
los eventos que llegan desde la nube, y así mismo enviar mensajes 
de eventos, o escuchar mensajes de comandos para actuar. Entre 
los principales recursos de Azure IoT están el IoT Hub y los 
Event Hubs. El primero, encargado de la comunicación 
bidireccional: dispositivos-hacia-nube y nube-hacia-dispositivos. 
Y los segundos, encargados de recolectar los miles de eventos que 
pueden generarse por los dispositivos o por los servicios de 
Azure.

## Proyecto 1: Creación de un dispositivo, recepción y envío de mensajes de eventos en el Azure IoT
El objetivo aquí es crear un programa para simular un dispositivo 
(dispositivoSimulado.js) que se conecta al IoT Hub de Azure, y 
que le envía mensajes con eventos de temperatura de forma 
continua (cada 5 segundos). Para verificar que están llegando 
estos mensajes al IoT Hub, vamos a crear otro programa 
(lectorEventos.js) el cual se conecta al centro de eventos del 
IoT Hub (Event Hub) y se pone a escuchar indefinidamente los 
mensajes que aquí están llegando y los imprime en pantalla.

## Proyecto 2: Creación de un Trabajo de Análisis de Transmisiones en Azure IoT
El análisis de transmisiones en Azure IoT permite procesar los 
eventos que están llegando al IoT Hub en línea para determinar 
acciones a tomar según sus valores. Para esto se debe crear un 
trabajo de análisis de transmisiones (Stream analytics job), 
definir cuáles son sus entradas, crear el procesamiento que se va 
a realizar sobre esas entradas, y definir las salidas donde van a 
quedar los resultados. 

En este nuevo proyecto (Figura [Fig:Proyecto2]), extendemos el 
trabajo anterior adicionando un trabajo de análisis de 
transmisiones que toma los valores de temperatura enviados por el 
dispositivo simulado al centro de eventos del IoT Hub, para luego 
filtrar las temperaturas mayores a 17 grados C y enviarlas a un nuevo centro 
de eventos que vamos a crear específicamente para alarmas. Los 
programas son los mismos del proyecto anterior, solo que ahora el 
lector de eventos (lectorEventos.js) se configura con el string 
de conexión del nuevo centro de eventos de alarmas y por lo tanto 
va a estar escuchando un centro de eventos diferente al del 
primer proyecto. Este es el centro de eventos donde el trabajo de 
análisis de transmisiones coloca los mensajes con temperaturas 

. 

## Proyecto 3: Monitoreo Remoto de Dispositivos y Envío de Alarmas a Dispositivos y a Twitter
Hay que tener en cuenta que el proyecto anterior filtra 
(analytics) los mensajes y se dejan en un nuevo centro de eventos 
para alarmas, pero NO notifica a los dispositivos. Es decir, las 
alarmas se generan en la nube y permanecen allí a menos que un 
proceso (WorkerRole) envíe estas alarmas al IoT Hub, el cual se 
encarga de direccionarlas hacia los dispositivos interesados.

Para lograr que los dispositivos se enteren de las alarmas, 
primero creamos un programa (“workerrole.js”) que escucha los 
mensajes que llegan al centro de eventos de alarmas, construye 
mensajes de comandos para controlar los dispositivos, y los envía 
hacia el centro de eventos del IoT Hub, que los direcciona hacia 
los dispositivos respectivos. Ahora la funcionalidad del 
dispositivo se extiende (“dispositivoSimuladoComandos.js”) para 
que, aparte de enviar mensajes de eventos, escuche los mensajes 
de comandos, y los ejecute. Adicionalmente, el WorkerRole (“
workerrole.js”) adiciona la funcionalidad de enviar un tweet de 
estas alarmas hacia una cuenta previamente registrada. Para 
obtener las credenciales necesarias, siga las instrucciones en 
https://apps.twitter.com/

## Proyecto 4: Monitoreo y Control Remoto Usando una Tarjeta Intel Edison y un kit de Sensores
En este proyecto vamos a monitorear y controlar remotamente tres 
dispositivos: un sensor de temperatura, un sensor de luminosidad, 
y un relé. Los sensores van a enviar continuamente sus valores 
físicos a la nube, donde un trabajo de análisis de transmisiones 
va a generar alarmas si los valores de temperaturas son mayores a 
17  (Tenga en cuenta la temperatura del ambiente donde realice su 
experimento[Nota al pie:
Al momento que esté ejecutando el experimento, tenga en cuenta la 
temperatura de su ambiente: si el sensor marca siempre mayor a 17 
 entonces ajuste el umbral de la alarma (Query del Stream 
Analytics Job en Azure) a otro superior (e.g. 22 ) para que de 
verdad se generen alarmas. Realize algo similar si la temperatura 
de su ambiente es menor a 20 grados. Las alarmas son leídas en la nube por un programa que actúa 
como WorkerRole el cual notifica remotamente a la tarjeta Edison 
para que active o desactive un dispositivo relé y envíe un tweet 
hacia una cuenta registrada. 

En los anteriores proyectos el programa de dispositivo simulado 
genera los valores dentro del programa. Ahora, el nuevo programa 
del dispositivo ("dispositivoEdison.js") captura de los sensores 
reales los valores físicos por medio de una tarjeta Intel Edison (
https://www.arduino.cc/en/ArduinoCertified/IntelEdison) 
que actúa como un hub local. Esta tarjeta incorpora un 
procesador Atom y corre una distribución del sistema operativo 
Linux (distribución Yocto). Para la parte de sensores y 
actuadores usamos un kit de inicio Grove (Grove Starter Kit - 
Intel IoT Edition Gen2 que incluye una tarjeta Arduino compatible (Arduino compatible 
shield) a la que se le pueden conectar varios tipos de sensores.

Ahora la funcionalidad del programa del dispositivo 
("dispositivoEdison.js") adiciona tres nuevos elementos: primero, 
la inicialización del hardware (tarjeta y sensores); segundo, la 
obtención de los valores físicos de los sensores reales 
(temperatura y luminosidad); y tercero, la manipulación de otro 
dispositivo (abrir/cerrar el relé).
