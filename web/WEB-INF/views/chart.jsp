<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<!DOCTYPE html>
<html>
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
            <input type="text" id="pv-input" placeholder="PV Names"/>
        </div>          
        <div data-role="page" id="chart-page">  
            <div data-role="panel" data-position="left" data-display="overlay" data-dismissible="false" data-swipe-close="false" id="options-panel">
                <h2>Viewer Options</h2>
                <h3>Time Interval</h3>
                <div class="endpoint-header">Start</div>
                <input type="text" id="start-date-input" placeholder="Start Date" data-options="{&quot;overrideDateFormat&quot;: &quot;%b %d %Y&quot;}"/>
                <input type="text" id="start-time-input" placeholder="Start Time"/>
                <div class="endpoint-header">End</div>
                <input type="text" id="end-date-input" placeholder="End Date" data-options="{&quot;overrideDateFormat&quot;: &quot;%b %d %Y&quot;}"/>
                <input type="text" id="end-time-input" placeholder="End Time"/>
                <h3>Multiple PVs</h3>
                <select id="multiple-pv-mode-select">
                    <option value="1">Separate Chart</option>
                    <option value="2">Same Chart Same Axis</option>
                    <option value="3">Same Chart Separate Axis</option>
                </select>
                <hr id="options-hr"/>
                <button type="button" id="update-options-button">Update</button>
                <a title="Close" class="cancel-panel-button ui-btn-right ui-link ui-btn ui-btn-a ui-icon-delete ui-btn-icon-notext ui-shadow ui-corner-all" href="#">Cancel</a>
            </div>
            <div data-role="panel" data-position="left" data-display="overlay" data-dismissible="false" data-swipe-close="false" id="pv-panel">
                <h2>PV Menu</h2>
                <a title="Close" class="cancel-panel-button ui-btn-right ui-link ui-btn ui-btn-a ui-icon-delete ui-btn-icon-notext ui-shadow ui-corner-all" href="#">Cancel</a>
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
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/wave.js?v=${initParam.releaseNumber}"></script>
    </body>
</html>
