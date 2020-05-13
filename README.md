# WAVE
Web Archive Viewer and Expositor   

Uses [myquery](https://github.com/JeffersonLab/myquery) and [epics2web](https://github.com/JeffersonLab/epics2web) to provide an EPICS data viewer and analysis tool.

Deployed at:    
https://epicsweb.jlab.org/wave

## Graph Examples
### Features
   - [Live Chart](https://epicsweb.jlab.org/wave/?start=2020-05-13+13%3A02%3A52&end=2020-05-13+13%3A07%3A52&myaDeployment=ops&myaLimit=100000&windowMinutes=5&title=&fullscreen=false&layoutMode=1&viewerMode=2&pv=IBC2C21AIMAGuV&IBC2C21AIMAGuVlabel=IBC2C21AIMAGuV&IBC2C21AIMAGuVcolor=%23a6cee3&IBC2C21AIMAGuVyAxisLabel=%C2%B5V&IBC2C21AIMAGuVyAxisMin=&IBC2C21AIMAGuVyAxisMax=&IBC2C21AIMAGuVyAxisLog&IBC2C21AIMAGuVscaler=)
   - [Log Scale](https://epicsweb.jlab.org/wave/?start=2020-03-25+01%3A00%3A00&end=2020-03-26+07%3A00%3A00&myaDeployment=ops&myaLimit=100000&title=&fullscreen=true&layoutMode=1&viewerMode=1&pv=VIP1L05BLOG&VIP1L05BLOGlabel=VIP1L05BLOG&VIP1L05BLOGcolor=blue&VIP1L05BLOGyAxisLabel=+&VIP1L05BLOGyAxisMin=&VIP1L05BLOGyAxisMax=&VIP1L05BLOGyAxisLog=true&VIP1L05BLOGscaler=)
   - [Crosshair Linked Stacked Charts with Enum Labels](https://epicsweb.jlab.org/wave/?start=2019-12-16+18%3A45%3A00&end=2019-12-16+19%3A00%3A00&myaDeployment=ops&myaLimit=100000&title=&fullscreen=true&layoutMode=1&viewerMode=1&pv=ISD0I011G&pv=IGL1I00BEAMODE&pv=IGL1I00HALLAMODE&pv=MMSHLALASERA&ISD0I011Glabel=FSD+Master&ISD0I011Gcolor=red&ISD0I011GyAxisLabel=&ISD0I011GyAxisMin=&ISD0I011GyAxisMax=&ISD0I011Gscaler=&IGL1I00BEAMODElabel=Laser+Mode+Master&IGL1I00BEAMODEcolor=blue&IGL1I00BEAMODEyAxisLabel=&IGL1I00BEAMODEyAxisMin=&IGL1I00BEAMODEyAxisMax=&IGL1I00BEAMODEscaler=&IGL1I00HALLAMODElabel=Laser+A+Mode&IGL1I00HALLAMODEcolor=hotpink&IGL1I00HALLAMODEyAxisLabel=&IGL1I00HALLAMODEyAxisMin=&IGL1I00HALLAMODEyAxisMax=&IGL1I00HALLAMODEscaler=&MMSHLALASERAlabel=Hall+A+Using+Laser+A%3F&MMSHLALASERAcolor=green&MMSHLALASERAyAxisLabel=&MMSHLALASERAyAxisMin=&MMSHLALASERAyAxisMax=&MMSHLALASERAscaler=&MMSHLALASERByAxisLabel=&MMSHLALASERByAxisMin=&MMSHLALASERByAxisMax=&MMSHLALASERBscaler=&MMSHLALASERCyAxisLabel=&MMSHLALASERCyAxisMin=&MMSHLALASERCyAxisMax=&MMSHLALASERCscaler=&MMSHLALASERDyAxisLabel=&MMSHLALASERDyAxisMin=&MMSHLALASERDyAxisMax=&MMSHLALASERDscaler=&ISD0I011GyAxisLog=&IGL1I00BEAMODEyAxisLog=&IGL1I00HALLAMODEyAxisLog=&MMSHLALASERAyAxisLog=)
   - [Multiple Axis Chart with Custom Title, Labels, Series Scaling, and Series Integration](https://epicsweb.jlab.org/wave/?start=2019-08-12+00%3A00%3A00&end=2019-08-13+00%3A00%3A00&myaDeployment=ops&myaLimit=100000&layoutMode=3&viewerMode=1&pv=IGL1I00POTcurrent&pv=accumulate%28IGL1I00POTcurrent%29&title=Gun&fullscreen=true&IBC1H04CRCUR2yAxisLabel=uA&IBC0R08CRCUR1yAxisLabel=uA&IBC2C24CRCUR3yAxisLabel=uA&IBC3H00CRCUR4yAxisLabel=uA&IBCAD00CRCUR6yAxisLabel=uA&IGL1I00POTcurrentlabel=Current&IGL1I00POTcurrentcolor=red&IGL1I00POTcurrentyAxisLabel=microAmps&IGL1I00POTcurrentyAxisMin=&IGL1I00POTcurrentyAxisMax=&IGL1I00POTcurrentscaler=&IBC0R08CRCUR1yAxisMin=&IBC0R08CRCUR1yAxisMax=&IBC0R08CRCUR1scaler=&IBC1H04CRCUR2yAxisMin=&IBC1H04CRCUR2yAxisMax=&IBC1H04CRCUR2scaler=&IBC2C24CRCUR3yAxisMin=&IBC2C24CRCUR3yAxisMax=&IBC2C24CRCUR3scaler=&IBC3H00CRCUR4yAxisMin=&IBC3H00CRCUR4yAxisMax=&IBC3H00CRCUR4scaler=&IBCAD00CRCUR6yAxisMin=&IBCAD00CRCUR6yAxisMax=&IBCAD00CRCUR6scaler=&accumulate%28IGL1I00POTcurrent%29label=Charge&accumulate%28IGL1I00POTcurrent%29color=blue&accumulate%28IGL1I00POTcurrent%29yAxisLabel=Coulombs&accumulate%28IGL1I00POTcurrent%29yAxisMin=&accumulate%28IGL1I00POTcurrent%29yAxisMax=&accumulate%28IGL1I00POTcurrent%29scaler=0.001&IGL1I00POTcurrentyAxisLog&accumulate%28IGL1I00POTcurrent%29yAxisLog=)
### Use Cases
   - [Power Monitoring](https://epicsweb.jlab.org/wave/?start=2020-03-25+00%3A00%3A00&end=2020-03-27+00%3A00%3A00&myaDeployment=ops&myaLimit=100000&title=&fullscreen=true&layoutMode=2&viewerMode=1&pv=40MVA%3AtotkW&pv=33MVA%3AtotkW&40MVA%3AtotkWlabel=40MVA&40MVA%3AtotkWcolor=%23a6cee3&40MVA%3AtotkWyAxisLabel=Megawatts&40MVA%3AtotkWyAxisMin=&40MVA%3AtotkWyAxisMax=&40MVA%3AtotkWyAxisLog&40MVA%3AtotkWscaler=0.001&33MVA%3AtotkWlabel=33MVA&33MVA%3AtotkWcolor=%231f78b4&33MVA%3AtotkWyAxisLabel=&33MVA%3AtotkWyAxisMin=&33MVA%3AtotkWyAxisMax=&33MVA%3AtotkWyAxisLog&33MVA%3AtotkWscaler=0.001)
   - [Cryo Liquid Levels](https://epicsweb.jlab.org/wave/?start=2020-03-25+00%3A00%3A00&end=2020-03-27+00%3A00%3A00&myaDeployment=ops&myaLimit=100000&title=Liquid+Levels&fullscreen=true&layoutMode=2&viewerMode=1&pv=CLL2L0450&pv=CLL2L0950&CLL2L0450label=2L04&CLL2L0450color=%23a6cee3&CLL2L0450yAxisLabel=+&CLL2L0450yAxisMin=&CLL2L0450yAxisMax=&CLL2L0450yAxisLog&CLL2L0450scaler=&CLL2L0950label=2L09&CLL2L0950color=%231f78b4&CLL2L0950yAxisLabel=&CLL2L0950yAxisMin=&CLL2L0950yAxisMax=&CLL2L0950yAxisLog&CLL2L0950scaler=)
