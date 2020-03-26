# WAVE
Web Archive Viewer and Expositor   

Uses [myquery](https://github.com/JeffersonLab/myquery) and [epics2web](https://github.com/JeffersonLab/epics2web) to provide an EPICS data viewer and analysis tool.

Deployed at:    
https://epicsweb.jlab.org/wave

## Graph Examples

   - [Log Scale](https://epicsweb.jlab.org/wave/?start=2020-03-25+01%3A00%3A00&end=2020-03-26+07%3A00%3A00&myaDeployment=ops&myaLimit=100000&title=&fullscreen=true&layoutMode=1&viewerMode=1&pv=VIP1L05BLOG&VIP1L05BLOGlabel=VIP1L05BLOG&VIP1L05BLOGcolor=blue&VIP1L05BLOGyAxisLabel=&VIP1L05BLOGyAxisMin=&VIP1L05BLOGyAxisMax=&VIP1L05BLOGyAxisLog=true&VIP1L05BLOGscaler=)
   - [Crosshair Linked Stacked Charts with Enum Labels](https://epicsweb.jlab.org/wave/?start=2019-12-16+18%3A45%3A00&end=2019-12-16+19%3A00%3A00&myaDeployment=ops&myaLimit=100000&title=&fullscreen=true&layoutMode=1&viewerMode=1&pv=ISD0I011G&pv=IGL1I00BEAMODE&pv=IGL1I00HALLAMODE&pv=MMSHLALASERA&ISD0I011Glabel=FSD+Master&ISD0I011Gcolor=red&ISD0I011GyAxisLabel=&ISD0I011GyAxisMin=&ISD0I011GyAxisMax=&ISD0I011Gscaler=&IGL1I00BEAMODElabel=Laser+Mode+Master&IGL1I00BEAMODEcolor=blue&IGL1I00BEAMODEyAxisLabel=&IGL1I00BEAMODEyAxisMin=&IGL1I00BEAMODEyAxisMax=&IGL1I00BEAMODEscaler=&IGL1I00HALLAMODElabel=Laser+A+Mode&IGL1I00HALLAMODEcolor=hotpink&IGL1I00HALLAMODEyAxisLabel=&IGL1I00HALLAMODEyAxisMin=&IGL1I00HALLAMODEyAxisMax=&IGL1I00HALLAMODEscaler=&MMSHLALASERAlabel=Hall+A+Using+Laser+A%3F&MMSHLALASERAcolor=green&MMSHLALASERAyAxisLabel=&MMSHLALASERAyAxisMin=&MMSHLALASERAyAxisMax=&MMSHLALASERAscaler=&MMSHLALASERByAxisLabel=&MMSHLALASERByAxisMin=&MMSHLALASERByAxisMax=&MMSHLALASERBscaler=&MMSHLALASERCyAxisLabel=&MMSHLALASERCyAxisMin=&MMSHLALASERCyAxisMax=&MMSHLALASERCscaler=&MMSHLALASERDyAxisLabel=&MMSHLALASERDyAxisMin=&MMSHLALASERDyAxisMax=&MMSHLALASERDscaler=&ISD0I011GyAxisLog=&IGL1I00BEAMODEyAxisLog=&IGL1I00HALLAMODEyAxisLog=&MMSHLALASERAyAxisLog=)
   - [Multiple Axis Chart with Custom Title, Labels, Series Scaling, and Series Integration](https://epicsweb.jlab.org/wave/?start=2019-08-12+00%3A00%3A00&end=2019-08-13+00%3A00%3A00&myaDeployment=ops&myaLimit=100000&layoutMode=3&viewerMode=1&pv=IGL1I00POTcurrent&pv=accumulate%28IGL1I00POTcurrent%29&title=Gun&fullscreen=true&IBC1H04CRCUR2yAxisLabel=uA&IBC0R08CRCUR1yAxisLabel=uA&IBC2C24CRCUR3yAxisLabel=uA&IBC3H00CRCUR4yAxisLabel=uA&IBCAD00CRCUR6yAxisLabel=uA&IGL1I00POTcurrentlabel=Current&IGL1I00POTcurrentcolor=red&IGL1I00POTcurrentyAxisLabel=microAmps&IGL1I00POTcurrentyAxisMin=&IGL1I00POTcurrentyAxisMax=&IGL1I00POTcurrentscaler=&IBC0R08CRCUR1yAxisMin=&IBC0R08CRCUR1yAxisMax=&IBC0R08CRCUR1scaler=&IBC1H04CRCUR2yAxisMin=&IBC1H04CRCUR2yAxisMax=&IBC1H04CRCUR2scaler=&IBC2C24CRCUR3yAxisMin=&IBC2C24CRCUR3yAxisMax=&IBC2C24CRCUR3scaler=&IBC3H00CRCUR4yAxisMin=&IBC3H00CRCUR4yAxisMax=&IBC3H00CRCUR4scaler=&IBCAD00CRCUR6yAxisMin=&IBCAD00CRCUR6yAxisMax=&IBCAD00CRCUR6scaler=&accumulate%28IGL1I00POTcurrent%29label=Charge&accumulate%28IGL1I00POTcurrent%29color=blue&accumulate%28IGL1I00POTcurrent%29yAxisLabel=Coulombs&accumulate%28IGL1I00POTcurrent%29yAxisMin=&accumulate%28IGL1I00POTcurrent%29yAxisMax=&accumulate%28IGL1I00POTcurrent%29scaler=0.001&IGL1I00POTcurrentyAxisLog&accumulate%28IGL1I00POTcurrent%29yAxisLog=)
