# WAVE [![CI](https://github.com/JeffersonLab/wave/actions/workflows/ci.yml/badge.svg)](https://github.com/JeffersonLab/wave/actions/workflows/ci.yml) [![Docker](https://img.shields.io/docker/v/jeffersonlab/wave?sort=semver&label=DockerHub)](https://hub.docker.com/r/jeffersonlab/wave)
Web Archive Viewer and Expositor   

<p>
<a href="#"><img src="https://github.com/JeffersonLab/wave/raw/main/doc/Screenshot.png"/></a>     
</p>

---
 - [Overview](https://github.com/JeffersonLab/wave#overview)   
 - [Quick Start with Compose](https://github.com/JeffersonLab/wave#quick-start-with-compose)    
 - [Install](https://github.com/JeffersonLab/wave#install)    
 - [Configure](https://github.com/JeffersonLab/wave#configure)    
 - [Build](https://github.com/JeffersonLab/wave#build)
 - [Release](https://github.com/JeffersonLab/wave#release)
---

## Overview
Uses [myquery](https://github.com/JeffersonLab/myquery) and [epics2web](https://github.com/JeffersonLab/epics2web) to provide an [EPICS](https://en.wikipedia.org/wiki/EPICS) data viewer and analysis tool for the Jefferson Lab archiver MYA as well as plots of live data.

### Examples
#### Features
   - [Live Chart](https://epicsweb.jlab.org/wave/?start=2020-05-13+13%3A02%3A52&end=2020-05-13+13%3A07%3A52&myaDeployment=ops&myaLimit=100000&windowMinutes=5&title=&fullscreen=false&layoutMode=1&viewerMode=2&pv=IBC2C21AIMAGuV&IBC2C21AIMAGuVlabel=IBC2C21AIMAGuV&IBC2C21AIMAGuVcolor=%23a6cee3&IBC2C21AIMAGuVyAxisLabel=%C2%B5V&IBC2C21AIMAGuVyAxisMin=&IBC2C21AIMAGuVyAxisMax=&IBC2C21AIMAGuVyAxisLog&IBC2C21AIMAGuVscaler=)
   - [Log Scale](https://epicsweb.jlab.org/wave/?start=2020-03-25+01%3A00%3A00&end=2020-03-26+07%3A00%3A00&myaDeployment=history&myaLimit=100000&title=&fullscreen=true&layoutMode=1&viewerMode=1&pv=VIP1L05BLOG&VIP1L05BLOGlabel=VIP1L05BLOG&VIP1L05BLOGcolor=blue&VIP1L05BLOGyAxisLabel=+&VIP1L05BLOGyAxisMin=&VIP1L05BLOGyAxisMax=&VIP1L05BLOGyAxisLog=true&VIP1L05BLOGscaler=)
   - [Crosshair Linked Stacked Charts with Enum Labels](https://epicsweb.jlab.org/wave/?start=2019-12-16+18%3A45%3A00&end=2019-12-16+19%3A00%3A00&myaDeployment=history&myaLimit=100000&title=&fullscreen=true&layoutMode=1&viewerMode=1&pv=ISD0I011G&pv=IGL1I00BEAMODE&pv=IGL1I00HALLAMODE&pv=MMSHLALASERA&ISD0I011Glabel=FSD+Master&ISD0I011Gcolor=red&ISD0I011GyAxisLabel=&ISD0I011GyAxisMin=&ISD0I011GyAxisMax=&ISD0I011Gscaler=&IGL1I00BEAMODElabel=Laser+Mode+Master&IGL1I00BEAMODEcolor=blue&IGL1I00BEAMODEyAxisLabel=&IGL1I00BEAMODEyAxisMin=&IGL1I00BEAMODEyAxisMax=&IGL1I00BEAMODEscaler=&IGL1I00HALLAMODElabel=Laser+A+Mode&IGL1I00HALLAMODEcolor=hotpink&IGL1I00HALLAMODEyAxisLabel=&IGL1I00HALLAMODEyAxisMin=&IGL1I00HALLAMODEyAxisMax=&IGL1I00HALLAMODEscaler=&MMSHLALASERAlabel=Hall+A+Using+Laser+A%3F&MMSHLALASERAcolor=green&MMSHLALASERAyAxisLabel=&MMSHLALASERAyAxisMin=&MMSHLALASERAyAxisMax=&MMSHLALASERAscaler=&MMSHLALASERByAxisLabel=&MMSHLALASERByAxisMin=&MMSHLALASERByAxisMax=&MMSHLALASERBscaler=&MMSHLALASERCyAxisLabel=&MMSHLALASERCyAxisMin=&MMSHLALASERCyAxisMax=&MMSHLALASERCscaler=&MMSHLALASERDyAxisLabel=&MMSHLALASERDyAxisMin=&MMSHLALASERDyAxisMax=&MMSHLALASERDscaler=&ISD0I011GyAxisLog=&IGL1I00BEAMODEyAxisLog=&IGL1I00HALLAMODEyAxisLog=&MMSHLALASERAyAxisLog=)
   - [Multiple Axis Chart with Custom Title, Labels, Series Scaling, and Series Integration](https://epicsweb.jlab.org/wave/?start=2019-08-12+00%3A00%3A00&end=2019-08-13+00%3A00%3A00&myaDeployment=history&myaLimit=100000&layoutMode=3&viewerMode=1&pv=IGL1I00POTcurrent&pv=accumulate%28IGL1I00POTcurrent%29&title=Gun&fullscreen=false&IBC1H04CRCUR2yAxisLabel=uA&IBC0R08CRCUR1yAxisLabel=uA&IBC2C24CRCUR3yAxisLabel=uA&IBC3H00CRCUR4yAxisLabel=uA&IBCAD00CRCUR6yAxisLabel=uA&IGL1I00POTcurrentlabel=Current&IGL1I00POTcurrentcolor=red&IGL1I00POTcurrentyAxisLabel=microAmps&IGL1I00POTcurrentyAxisMin=&IGL1I00POTcurrentyAxisMax=&IGL1I00POTcurrentscaler=&IBC0R08CRCUR1yAxisMin=&IBC0R08CRCUR1yAxisMax=&IBC0R08CRCUR1scaler=&IBC1H04CRCUR2yAxisMin=&IBC1H04CRCUR2yAxisMax=&IBC1H04CRCUR2scaler=&IBC2C24CRCUR3yAxisMin=&IBC2C24CRCUR3yAxisMax=&IBC2C24CRCUR3scaler=&IBC3H00CRCUR4yAxisMin=&IBC3H00CRCUR4yAxisMax=&IBC3H00CRCUR4scaler=&IBCAD00CRCUR6yAxisMin=&IBCAD00CRCUR6yAxisMax=&IBCAD00CRCUR6scaler=&accumulate%28IGL1I00POTcurrent%29label=Charge&accumulate%28IGL1I00POTcurrent%29color=blue&accumulate%28IGL1I00POTcurrent%29yAxisLabel=Coulombs&accumulate%28IGL1I00POTcurrent%29yAxisMin=&accumulate%28IGL1I00POTcurrent%29yAxisMax=&accumulate%28IGL1I00POTcurrent%29scaler=0.001&IGL1I00POTcurrentyAxisLog&accumulate%28IGL1I00POTcurrent%29yAxisLog=&windowMinutes=30)
#### Use Cases
   - [Power Monitoring](https://epicsweb.jlab.org/wave/?start=2020-03-25+00%3A00%3A00&end=2020-03-27+00%3A00%3A00&myaDeployment=history&myaLimit=100000&title=&fullscreen=true&layoutMode=2&viewerMode=1&pv=40MVA%3AtotkW&pv=33MVA%3AtotkW&40MVA%3AtotkWlabel=40MVA&40MVA%3AtotkWcolor=%23a6cee3&40MVA%3AtotkWyAxisLabel=Megawatts&40MVA%3AtotkWyAxisMin=&40MVA%3AtotkWyAxisMax=&40MVA%3AtotkWyAxisLog&40MVA%3AtotkWscaler=0.001&33MVA%3AtotkWlabel=33MVA&33MVA%3AtotkWcolor=%231f78b4&33MVA%3AtotkWyAxisLabel=&33MVA%3AtotkWyAxisMin=&33MVA%3AtotkWyAxisMax=&33MVA%3AtotkWyAxisLog&33MVA%3AtotkWscaler=0.001)
   - [Cryo Liquid Levels](https://epicsweb.jlab.org/wave/?start=2020-03-25+00%3A00%3A00&end=2020-03-27+00%3A00%3A00&myaDeployment=history&myaLimit=100000&title=Liquid+Levels&fullscreen=true&layoutMode=2&viewerMode=1&pv=CLL2L0450&pv=CLL2L0950&CLL2L0450label=2L04&CLL2L0450color=%23a6cee3&CLL2L0450yAxisLabel=+&CLL2L0450yAxisMin=&CLL2L0450yAxisMax=&CLL2L0450yAxisLog&CLL2L0450scaler=&CLL2L0950label=2L09&CLL2L0950color=%231f78b4&CLL2L0950yAxisLabel=&CLL2L0950yAxisMin=&CLL2L0950yAxisMax=&CLL2L0950yAxisLog&CLL2L0950scaler=)
   - [Temperature Sensors](https://epicsweb.jlab.org/wave/?start=2020-05-21+11%3A16%3A10&end=2020-05-21+11%3A21%3A10&myaDeployment=ops&myaLimit=100000&windowMinutes=30&title=&fullscreen=true&layoutMode=2&viewerMode=2&pv=tempSensorA&pv=tempSensorB&pv=tempSensorC&tempSensorAlabel=Sensor+A&tempSensorAcolor=red&tempSensorAyAxisLabel=%C2%B0F&tempSensorAyAxisMin=&tempSensorAyAxisMax=&tempSensorAyAxisLog&tempSensorAscaler=&tempSensorBlabel=Sensor+B&tempSensorBcolor=blue&tempSensorByAxisLabel=&tempSensorByAxisMin=&tempSensorByAxisMax=&tempSensorByAxisLog&tempSensorBscaler=&tempSensorClabel=Sensor+C&tempSensorCcolor=green&tempSensorCyAxisLabel=&tempSensorCyAxisMin=&tempSensorCyAxisMax=&tempSensorCyAxisLog&tempSensorCscaler=)
   
## Quick Start with Compose 
1. Grab project
```
git clone https://github.com/JeffersonLab/wave
cd wave
```
2. Launch [Compose](https://github.com/docker/compose)
```
docker compose up
```
3. Use web browser to view channel1 on August 12 2019

[localhost/wave?pv=channel1](http://localhost:8080/wave/?start=2019-08-12+00%3A00%3A00&end=2019-08-13+00%3A00%3A00&myaDeployment=docker&myaLimit=100000&windowMinutes=30&title=&fullscreen=false&layoutMode=1&viewerMode=1&pv=channel1)

## Install
 1. Download [Java JDK 17+](https://adoptium.net/)
 2. Download [Apache Tomcat 10+](http://tomcat.apache.org/) (Compiled against Jakarta EE)
 4. Download [wave.war](https://github.com/JeffersonLab/wave/releases) and drop it into the Tomcat webapps directory
 5. Install [myquery](https://github.com/JeffersonLab/myquery) and [epics2web](https://github.com/JeffersonLab/epics2web).
 5. [Configure](https://github.com/JeffersonLab/wave#configure) Tomcat
 6. Start Tomcat and navigate your web browser to localhost:8080/wave
 
 ## Configure
 Set the environment variables:
 - __EPICS_2_WEB_HOST__: host (and port) of epics2web
 - __MYQUERY_HOST__: host (and port) of myquery
 - __MYQUERY_DEFAULT_DEPLOYMENT__: default MYA deployment
  
 ## Build
This project is built with [Java 17](https://adoptium.net/) (compiled to Java 17 bytecode), and uses the [Gradle 7](https://gradle.org/) build tool to automatically download dependencies and build the project from source:

```
git clone https://github.com/JeffersonLab/wave
cd wave
gradlew build
```
**Note**: If you do not already have Gradle installed, it will be installed automatically by the wrapper script included in the source

**Note for JLab On-Site Users**: Jefferson Lab has an intercepting [proxy](https://gist.github.com/slominskir/92c25a033db93a90184a5994e71d0b78)

## Release
1. Bump the version number and release date in build.gradle and commit and push to GitHub (using [Semantic Versioning](https://semver.org/)).   
2. Create a new release on the GitHub [Releases](https://github.com/JeffersonLab/wave/releases) page corresponding to same version in build.gradle (Enumerate changes and link issues).  Attach war file for users to download.
3. Build and publish a new Docker image [from the GitHub tag](https://gist.github.com/slominskir/a7da801e8259f5974c978f9c3091d52c#8-build-an-image-based-of-github-tag).  DockerHub is configured to do this automatically on git push of semver tag (typically part of GitHub release).
4. Bump and commit quick start [image version](https://github.com/JeffersonLab/wave/blob/main/docker-compose.override.yml)
