<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<!DOCTYPE html>
<html class="${param.print eq 'Y' ? 'print ' : ''}">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WAVE</title>
        <link rel="shortcut icon" href="${pageContext.request.contextPath}/resources/img/favicon.ico?v=${initParam.releaseNumber}"/>
        <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/jquery.mobile-1.4.5.min.css"/>
        <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/jtsage-datebox-4.1.1.min.css"/>
        <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/wave.css?v=${initParam.releaseNumber}"/>
    </head>
    <body>
        <div id="header-panel" data-role="header" data-position="fixed" data-theme="a">
            <h1>WAVE</h1>
            <button type="button" data-icon="gear" data-iconpos="notext" id="options-button" title="Viewer Options"></button>
            <input type="text" id="pv-input" placeholder="PV Names (% wildcard)" data-type="search"/>
            <ul id="pv-filter" data-role="listview" data-filter="true" data-input="#pv-input">

            </ul>
        </div>
        <a id="fullscreen-link" class="ui-icon-carat-u ui-btn-icon-notext ui-shadow ui-corner-all"></a>
        <div data-role="page" id="chart-page">  
            <div data-role="panel" data-position="left" data-display="overlay" data-dismissible="false" data-swipe-close="false" id="options-panel">
                <h2>Viewer Options</h2>
<!--                
                <h3>Mode</h3>
                <select id="viewer-mode-select">
                    <option value="1">Archive</option>
                    <option value="2" disabled="disabled">Strip</option>
                    <option value="3" disabled="disabled">Waveform</option>
                </select>
-->
                <h3>Time Interval</h3>
                <div class="endpoint-header">Start</div>
                <input type="text" id="start-date-input" placeholder="Start Date" data-options="{&quot;overrideDateFormat&quot;: &quot;%b %d %Y&quot;}"/>
                <input type="text" id="start-time-input" placeholder="Start Time"/>
                <div class="endpoint-header">End</div>
                <input type="text" id="end-date-input" placeholder="End Date" data-options="{&quot;overrideDateFormat&quot;: &quot;%b %d %Y&quot;}"/>
                <input type="text" id="end-time-input" placeholder="End Time"/>
                <h3>Multiple PVs</h3>
                <select id="layout-mode-select">
                    <option value="1">Separate Chart</option>
                    <option value="2">Same Chart Same Axis</option>
                    <option value="3">Same Chart Separate Axis</option>
                </select>
                <h3>Mya Options</h3>
                <div class="endpoint-header">Deployment</div>
                <input type="text" id="mya-deployment" placeholder="Mya Deployment (ops, etc)" value="ops" />
                <div class="endpoint-header">Sampling Threshold</div>
                <input type="text" id="mya-limit" placeholder="Binning limit (optional)" value="100000"/>
                <h3>Title</h3>
                <input type="text" id="chart-title-input"/>
                <hr id="options-hr"/>
                <button type="button" id="update-options-button" class="ui-btn ui-icon-check ui-btn-icon-left">Update</button>
                <a title="Close" class="cancel-panel-button ui-btn-right ui-link ui-btn ui-btn-a ui-icon-delete ui-btn-icon-notext ui-shadow ui-corner-all" href="#">Cancel</a>
            </div>
            <div data-role="panel" data-position="left" data-display="overlay" data-dismissible="false" data-swipe-close="false" id="pv-panel">
                <h2 id="pv-menu-header">PV Menu</h2>
                <div id="pv-panel-error"></div>
                <a title="Close" class="cancel-panel-button ui-btn-right ui-link ui-btn ui-btn-a ui-icon-delete ui-btn-icon-notext ui-shadow ui-corner-all" href="#">Cancel</a>
                <h3>Config</h3>
                <div class="endpoint-header">Label</div>
                <input type="text" id="pv-label"/>
                <div class="endpoint-header">Color</div>
                <input type="text" id="pv-color"/>
                <div class="endpoint-header">Y Axis Label</div>
                <input type="text" id="pv-y-axis-label"/>
                <div class="endpoint-header">Y Axis Max</div>
                <input type="text" id="pv-y-axis-max"/>
                <div class="endpoint-header">Y Axis Min</div>
                <input type="text" id="pv-y-axis-min"/>
                <div class="endpoint-header">Scaler</div>
                <input type="text" id="pv-scaler"/>
                <button type="button" class="ui-btn ui-icon-check ui-btn-icon-left" id="pv-update-config-button">Update</button>
                <h3>Info</h3>
                <ul id="pv-info-list" data-role="listview" data-inset="true">
                    <li><a href="#metadata-popup" data-rel="popup" data-position-to="window">Metadata</a></li>
                    <li><a href="#statistics-popup" data-rel="popup" data-position-to="window">Statistics</a></li>
                </ul>
                <h3>Actions</h3>
                <button type="button" class="ui-btn ui-icon-eye ui-btn-icon-left" id="pv-visibility-toggle-button">Hide</button>
                <hr id="options-hr"/>
                <button type="button" class="ui-btn ui-icon-minus ui-btn-icon-left" id="pv-delete-button">Delete</button>
            </div>
            <div id="metadata-popup" data-role="popup" class="info-popup ui-content" data-theme="b" data-dismissible="false">
                <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a>
                <div data-role="header" data-theme="a">
                    <h2>PV</h2>
                </div>
                <table>
                    <tbody>
                        <tr>
                            <th>Datatype:</th>
                            <td id="metadata-datatype"></td>
                        </tr>
                        <tr>
                            <th>Host:</th>
                            <td id="metadata-host"></td>
                        </tr>
                        <tr>
                            <th>Event Count:</th>
                            <td id="metadata-count"></td>
                        </tr> 
                        <tr>
                            <th>Sampled:</th>
                            <td id="metadata-sampled"></td>
                        </tr> 
                        <tr>
                            <th>Sampled Event Count:</th>
                            <td id="metadata-sampled-count"></td>
                        </tr>   
                        <tr>
                            <th>Stepped Points Count:</th>
                            <td id="metadata-stepped-count"></td>
                        </tr>                           
                    </tbody>
                </table>
            </div>
            <div id="statistics-popup" data-role="popup" class="info-popup ui-content" data-theme="b" data-dismissible="false">
                <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a>
                <div data-role="header" data-theme="a">
                    <h2>PV</h2>
                </div>
                <table>
                    <tbody>
                        <tr>
                            <th>Max:</th>
                            <td id="metadata-max"></td>
                        </tr>                           
                        <tr>
                            <th>Min:</th>
                            <td id="metadata-min"></td>
                        </tr>                    
                    </tbody>
                </table>
            </div>
            <div id="chart-container"></div>
        </div>
        <div id="footer-panel" data-role="footer" data-position="fixed" data-theme="a">
            <div id="version">Version: ${initParam.releaseNumber} (${initParam.releaseDate})</div> 
        </div>    
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/canvasjs-1.9.10.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery-1.10.2.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.mobile-1.4.5.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jtsage-datebox-4.1.1.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/uri-1.14.1.min.js"></script>   
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery-whenall.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/epics2web-1.4.0.min.js"></script>
        <c:choose>
            <c:when test="${initParam.productionRelease eq 'true'}">
                <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/combined.min.js?v=${initParam.releaseNumber}"></script>
            </c:when>
            <c:otherwise>
                <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/src/util.js?v=${initParam.releaseNumber}"></script> 
                <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/src/chart.js?v=${initParam.releaseNumber}"></script>
                <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/src/series.js?v=${initParam.releaseNumber}"></script>
                <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/src/layoutmanager.js?v=${initParam.releaseNumber}"></script>
                <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/src/chartmanager.js?v=${initParam.releaseNumber}"></script>                
                <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/src/appmanager.js?v=${initParam.releaseNumber}"></script>  
                <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/src/options.js?v=${initParam.releaseNumber}"></script>
                <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/src/urlmanager.js?v=${initParam.releaseNumber}"></script>                
                <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/src/viewer.js?v=${initParam.releaseNumber}"></script>
                <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/src/zoomabletimeformatter.js?v=${initParam.releaseNumber}"></script>                 
                <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/src/main.js?v=${initParam.releaseNumber}"></script>                
            </c:otherwise>
        </c:choose>        
    </body>
</html>
