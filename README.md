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
inicio Grove (Grove Starter Kit - Intel IoT Edition (https://www.seeedstudio.com/Grove-starter-kit-plus-Intel-IoT-Edition-for-Intel-Galileo-Gen-2-and-Edison-p-1978.html)
]).
